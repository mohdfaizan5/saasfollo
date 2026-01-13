'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/server';
import type { Version, VersionInsert, VersionUpdate } from '@/lib/types/database';

/**
 * Get all versions for a project
 */
export async function getVersions(projectId: number): Promise<Version[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('versions')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching versions:', error);
        throw new Error('Failed to fetch versions');
    }

    return data || [];
}

/**
 * Get a single version by ID
 */
export async function getVersion(versionId: number): Promise<Version | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('versions')
        .select('*')
        .eq('id', versionId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('Error fetching version:', error);
        throw new Error('Failed to fetch version');
    }

    return data;
}

/**
 * Create a new version for a project
 */
export async function createVersion(version: VersionInsert): Promise<Version> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('versions')
        .insert(version)
        .select()
        .single();

    if (error) {
        console.error('Error creating version:', error);
        throw new Error('Failed to create version');
    }

    revalidatePath(`/projects/${version.project_id}`);
    return data;
}

/**
 * Update an existing version
 */
export async function updateVersion(versionId: number, projectId: number, updates: VersionUpdate): Promise<Version> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('versions')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', versionId)
        .select()
        .single();

    if (error) {
        console.error('Error updating version:', error);
        throw new Error('Failed to update version');
    }

    revalidatePath(`/projects/${projectId}`);
    return data;
}

/**
 * Delete a version
 */
export async function deleteVersion(versionId: number, projectId: number): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('versions')
        .delete()
        .eq('id', versionId);

    if (error) {
        console.error('Error deleting version:', error);
        throw new Error('Failed to delete version');
    }

    revalidatePath(`/projects/${projectId}`);
}

/**
 * Set a version as active (and deactivate others)
 */
export async function setVersionActive(versionId: number, projectId: number): Promise<void> {
    const supabase = await createClient();

    // First, set all versions of this project to inactive
    const { error: deactivateError } = await supabase
        .from('versions')
        .update({ status: 'inactive', updated_at: new Date().toISOString() })
        .eq('project_id', projectId);

    if (deactivateError) {
        console.error('Error deactivating versions:', deactivateError);
        throw new Error('Failed to deactivate versions');
    }

    // Then set the selected version to active
    const { error: activateError } = await supabase
        .from('versions')
        .update({ status: 'active', updated_at: new Date().toISOString() })
        .eq('id', versionId);

    if (activateError) {
        console.error('Error activating version:', activateError);
        throw new Error('Failed to activate version');
    }

    // Update the project's active_version_id
    const { error: projectError } = await supabase
        .from('projects')
        .update({ active_version_id: versionId, updated_at: new Date().toISOString() })
        .eq('id', projectId);

    if (projectError) {
        console.error('Error updating project active version:', projectError);
        throw new Error('Failed to update project');
    }

    revalidatePath(`/projects/${projectId}`);
}
