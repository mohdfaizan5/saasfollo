/**
 * UploadThing (SDK v7) file router.
 *
 * Defines the upload endpoints used across the app and their auth rules. Every
 * upload requires a signed-in Supabase user (checked in `.middleware`). The
 * uploaded file's public URL is returned to the client from `.onUploadComplete`.
 *
 * Env: v7 reads a single `UPLOADTHING_TOKEN` (base64 app credential).
 */

import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';
import { createClient } from '@/lib/server';

const f = createUploadthing();

// Shared auth guard — throws (surfaced to the client) when there is no user.
async function requireUser() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
        throw new UploadThingError('You must be signed in to upload files.');
    }
    return data.user;
}

export const ourFileRouter = {
    // Images embedded in rich-text task descriptions and notes.
    editorImage: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
        .middleware(async () => {
            const user = await requireUser();
            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { url: file.url, uploadedBy: metadata.userId };
        }),

    // Project images ("avatars") shown on project cards and settings.
    projectImage: f({ image: { maxFileSize: '4MB', maxFileCount: 1 } })
        .middleware(async () => {
            const user = await requireUser();
            return { userId: user.id };
        })
        .onUploadComplete(async ({ metadata, file }) => {
            return { url: file.url, uploadedBy: metadata.userId };
        }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
