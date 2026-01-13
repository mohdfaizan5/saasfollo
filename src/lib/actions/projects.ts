'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/server';
import type { Project, ProjectInsert, ProjectUpdate, ProjectWithStats } from '@/lib/types/database';

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
 * Get a single project by ID
 */
export async function getProject(projectId: number): Promise<Project | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
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
 * Get a project with its active version
 */
export async function getProjectWithActiveVersion(projectId: number): Promise<ProjectWithStats | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('projects')
        .select(`
      *,
      active_version:versions!fk_projects_active_version(*)
    `)
        .eq('id', projectId)
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
 * Update an existing project
 */
export async function updateProject(projectId: number, updates: ProjectUpdate): Promise<Project> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('projects')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

    if (error) {
        console.error('Error updating project:', error);
        throw new Error('Failed to update project');
    }

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    return data;
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: number): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

    if (error) {
        console.error('Error deleting project:', error);
        throw new Error('Failed to delete project');
    }

    revalidatePath('/projects');
}

/**
 * Toggle project pinned status
 */
export async function toggleProjectPin(projectId: number): Promise<Project> {
    const supabase = await createClient();

    // First get the current pinned status
    const { data: project, error: fetchError } = await supabase
        .from('projects')
        .select('is_pinned')
        .eq('id', projectId)
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
        .eq('id', projectId)
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
 */
export async function setActiveVersion(projectId: number, versionId: number | null): Promise<Project> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('projects')
        .update({
            active_version_id: versionId,
            updated_at: new Date().toISOString(),
        })
        .eq('id', projectId)
        .select()
        .single();

    if (error) {
        console.error('Error setting active version:', error);
        throw new Error('Failed to set active version');
    }

    revalidatePath('/projects');
    revalidatePath(`/projects/${projectId}`);
    return data;
}
