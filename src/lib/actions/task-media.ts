/**
 * Server action for uploading images embedded in rich-text task descriptions.
 * Images are stored in the public `task-media` Supabase bucket and referenced
 * by public URL inside the task description HTML.
 *
 * Authorization: only authenticated users with edit access (owner/editor) on the
 * given project may upload. Storage RLS additionally restricts inserts to
 * authenticated users; the per-project check lives here.
 */
'use server';

import { createClient } from '@/lib/server';
import { createAdminClient } from '@/lib/admin';
import { getUserProjectRole } from '@/lib/actions/projects';

const BUCKET = 'task-media';
const MAX_BYTES = 5 * 1024 * 1024; // keep in sync with the bucket's file_size_limit
const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp']);
const MIME_EXTENSION: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
};

export interface TaskMediaUploadResult {
    url: string;
}

/**
 * Upload a single image for use in a task description. Returns the public URL.
 * Throws user-friendly errors on validation/permission/storage failures.
 */
export async function uploadTaskMedia(
    projectNanoid: string,
    formData: FormData,
): Promise<TaskMediaUploadResult> {
    const supabase = await createClient();

    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
        throw new Error('You must be signed in to upload images.');
    }

    // Only owners/editors of the project may attach media to its tasks.
    const role = await getUserProjectRole(projectNanoid);
    if (!role || role === 'reader') {
        throw new Error('You do not have permission to add images to this project.');
    }

    const file = formData.get('file');
    if (!(file instanceof File)) {
        throw new Error('No image file was provided.');
    }

    if (!ALLOWED_MIME.has(file.type)) {
        throw new Error('Unsupported image type. Use PNG, JPG, GIF, or WebP.');
    }

    if (file.size > MAX_BYTES) {
        throw new Error('Image is too large. The maximum size is 5 MB.');
    }

    // Prefer the admin client for storage writes (bypasses RLS timing issues),
    // falling back to the user-scoped client which the storage policy also allows.
    let storageClient = supabase;
    try {
        storageClient = createAdminClient();
    } catch {
        // No service role configured in this environment; user client is fine.
    }

    const extension = MIME_EXTENSION[file.type] ?? 'png';
    const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const path = `${projectNanoid}/${uniqueSuffix}.${extension}`;

    const { error: uploadError } = await storageClient.storage
        .from(BUCKET)
        .upload(path, file, {
            cacheControl: '3600',
            contentType: file.type,
            upsert: false,
        });

    if (uploadError) {
        console.error('[Storage Error] Failed to upload task media:', JSON.stringify(uploadError, null, 2));
        throw new Error('Could not upload the image due to a service error. Please try again.');
    }

    const { data: urlData } = storageClient.storage.from(BUCKET).getPublicUrl(path);

    if (!urlData?.publicUrl) {
        throw new Error('The image uploaded but no public URL was returned. Please try again.');
    }

    return { url: urlData.publicUrl };
}
