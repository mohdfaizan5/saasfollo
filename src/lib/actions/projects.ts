/**
 * Server actions for Projects
 * All public-facing lookups now use the `nanoid` field instead of numeric `id`.
 * Internal FK references (active_version_id, etc.) still use numeric ids.
 */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/server';
import type { Project, ProjectInsert, ProjectUpdate, ProjectWithStats, CollaboratorRole } from '@/lib/types/database';

export type UserProjectRole = CollaboratorRole | 'owner';

/**
 * Get the current user's role for a specific project
 * Accepts nanoid (string) as the project identifier
 */
export async function getUserProjectRole(projectNanoid: string): Promise<UserProjectRole | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    // Look up project by nanoid
    const { data: project } = await supabase
        .from('projects')
        .select('id, user_id')
        .eq('nanoid', projectNanoid)
        .single();

    if (!project) return null;

    if (project.user_id === user.id) {
        return 'owner';
    }

    // Check if user is a collaborator (uses internal numeric id for FK join)
    const { data: collaborator } = await supabase
        .from('project_collaborators')
        .select('role')
        .eq('project_id', project.id)
        .eq('user_id', user.id)
        .single();

    return collaborator?.role ?? null;
}

/**
 * Get all projects for the current user
 * Returns projects with pinned ones first, then sorted by updated_at
 */
export async function getProjects(): Promise<ProjectWithStats[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('projects')
        .select(`
      *,
      versions:versions(count),
      tasks:tasks(count)
    `)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
        throw new Error('Failed to fetch projects');
    }

    // Transform the count aggregates
    return (data || []).map((project) => ({
        ...project,
        version_count: project.versions?.[0]?.count ?? 0,
        task_count: project.tasks?.[0]?.count ?? 0,
    }));
}

/**
 * Get a single project by nanoid
 */
export async function getProject(projectNanoid: string): Promise<Project | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('nanoid', projectNanoid)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null; // Not found
        }
        console.error('Error fetching project:', error);
        throw new Error('Failed to fetch project');
    }

    return data;
}

/**
 * Get a project with its active version by nanoid
 */
export async function getProjectWithActiveVersion(projectNanoid: string): Promise<ProjectWithStats | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('projects')
        .select(`
      *,
      active_version:versions!fk_projects_active_version(*)
    `)
        .eq('nanoid', projectNanoid)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('Error fetching project with active version:', error);
        throw new Error('Failed to fetch project');
    }

    return {
        ...data,
        active_version: data.active_version ?? null,
    };
}

/**
 * Create a new project
 * Returns the created project (which will have an auto-generated nanoid)
 */
export async function createProject(project: ProjectInsert): Promise<Project> {
    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
        throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
        .from('projects')
        .insert({
            ...project,
            user_id: userData.user.id,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating project:', error);
        throw new Error('Failed to create project');
    }

    revalidatePath('/projects');
    return data;
}

/**
 * Update an existing project (lookup by nanoid)
 */
export async function updateProject(projectNanoid: string, updates: ProjectUpdate): Promise<Project> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('projects')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('nanoid', projectNanoid)
        .select()
        .single();

    if (error) {
        console.error('Error updating project:', error);
        throw new Error('Failed to update project');
    }

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectNanoid}`);
    return data;
}

/**
 * Delete a project (lookup by nanoid)
 */
export async function deleteProject(projectNanoid: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('nanoid', projectNanoid);

    if (error) {
        console.error('Error deleting project:', error);
        throw new Error('Failed to delete project');
    }

    revalidatePath('/projects');
}

/**
 * Toggle project pinned status (lookup by nanoid)
 */
export async function toggleProjectPin(projectNanoid: string): Promise<Project> {
    const supabase = await createClient();

    // First get the current pinned status
    const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('is_pinned')
        .eq('nanoid', projectNanoid)
        .single();

    if (fetchError) {
        console.error('Error fetching project for pin toggle:', fetchError);
        throw new Error('Failed to fetch project');
    }

    // Toggle the pin
    const { data, error } = await supabase
        .from('projects')
        .update({
            is_pinned: !project.is_pinned,
            updated_at: new Date().toISOString(),
        })
        .eq('nanoid', projectNanoid)
        .select()
        .single();

    if (error) {
        console.error('Error toggling project pin:', error);
        throw new Error('Failed to toggle project pin');
    }

    revalidatePath('/projects');
    return data;
}

/**
 * Set the active version for a project
 * Uses nanoid for project lookup, numeric id for version FK
 */
export async function setActiveVersion(projectNanoid: string, versionId: number | null): Promise<Project> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('projects')
        .update({
            active_version_id: versionId,
            updated_at: new Date().toISOString(),
        })
        .eq('nanoid', projectNanoid)
        .select()
        .single();

    if (error) {
        console.error('Error setting active version:', error);
        throw new Error('Failed to set active version');
    }

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectNanoid}`);
    return data;
}

/**
 * Upload a project icon (lookup by nanoid)
 */
export async function uploadProjectIcon(projectNanoid: string, formData: FormData): Promise<Project> {
    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
        throw new Error('Not authenticated');
    }

    // Verify user has permission to update this project
    const role = await getUserProjectRole(projectNanoid);
    if (!role || role === 'reader') {
        throw new Error('You do not have permission to update this project');
    }

    const file = formData.get('icon') as File;
    if (!file || !(file instanceof File)) {
        throw new Error('No file provided');
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only PNG, JPEG, GIF, SVG, and WebP are allowed.');
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
        throw new Error('File too large. Maximum size is 2MB.');
    }

    // Get current project to delete old icon if exists
    const { data: currentProject } = await supabase
        .from('projects')
        .select('icon_url, nanoid')
        .eq('nanoid', projectNanoid)
        .single();

    // Generate unique filename using nanoid
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png';
    const fileName = `${projectNanoid}/${Date.now()}-icon.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('project-icons')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: true,
        });

    if (uploadError) {
        console.error('Error uploading icon:', uploadError);
        throw new Error('Failed to upload icon');
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('project-icons')
        .getPublicUrl(fileName);

    // Delete old icon if exists
    if (currentProject?.icon_url) {
        try {
            const oldUrl = new URL(currentProject.icon_url);
            const pathParts = oldUrl.pathname.split('/storage/v1/object/public/project-icons/');
            if (pathParts.length > 1) {
                await supabase.storage
                    .from('project-icons')
                    .remove([decodeURIComponent(pathParts[1])]);
            }
        } catch {
            console.warn('Could not delete old icon');
        }
    }

    // Update project with new icon URL
    const { data, error } = await supabase
        .from('projects')
        .update({
            icon_url: urlData.publicUrl,
            updated_at: new Date().toISOString(),
        })
        .eq('nanoid', projectNanoid)
        .select()
        .single();

    if (error) {
        console.error('Error updating project icon:', error);
        throw new Error('Failed to update project icon');
    }

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectNanoid}`);
    return data;
}

/**
 * Delete a project icon (lookup by nanoid)
 */
export async function deleteProjectIcon(projectNanoid: string): Promise<Project> {
    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
        throw new Error('Not authenticated');
    }

    // Verify user has permission
    const role = await getUserProjectRole(projectNanoid);
    if (!role || role === 'reader') {
        throw new Error('You do not have permission to update this project');
    }

    // Get current project to find the icon URL
    const { data: currentProject } = await supabase
        .from('projects')
        .select('icon_url')
        .eq('nanoid', projectNanoid)
        .single();

    // Delete icon from storage if exists
    if (currentProject?.icon_url) {
        try {
            const oldUrl = new URL(currentProject.icon_url);
            const pathParts = oldUrl.pathname.split('/storage/v1/object/public/project-icons/');
            if (pathParts.length > 1) {
                await supabase.storage
                    .from('project-icons')
                    .remove([decodeURIComponent(pathParts[1])]);
            }
        } catch {
            console.warn('Could not delete icon from storage');
        }
    }

    // Update project to remove icon URL
    const { data, error } = await supabase
        .from('projects')
        .update({
            icon_url: null,
            updated_at: new Date().toISOString(),
        })
        .eq('nanoid', projectNanoid)
        .select()
        .single();

    if (error) {
        console.error('Error removing project icon:', error);
        throw new Error('Failed to remove project icon');
    }

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectNanoid}`);
    return data;
}
