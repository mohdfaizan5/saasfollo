/**
 * Server actions for Versions
 * Uses project nanoid for project lookups, version nanoid for version lookups.
 * Internal FK references still use numeric IDs for database consistency.
 */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/server';
import type { Version, VersionInsert, VersionUpdate } from '@/lib/types/database';

/**
 * Helper: resolve a project nanoid to its internal numeric id
 */
async function resolveProjectId(projectNanoid: string): Promise<number> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('nanoid', projectNanoid)
        .single();

    if (error || !data) {
        throw new Error('Project not found');
    }
    return data.id;
}

/**
 * Get all versions for a project (by project nanoid)
 */
export async function getVersions(projectNanoid: string): Promise<Version[]> {
    const supabase = await createClient();
    const projectId = await resolveProjectId(projectNanoid);

    const { data, error } = await supabase
        .from('versions')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching versions:', error);
        throw new Error('Failed to fetch versions');
    }

    return data || [];
}

/**
 * Get a single version by its nanoid
 */
export async function getVersion(versionNanoid: string): Promise<Version | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('versions')
        .select('*')
        .eq('nanoid', versionNanoid)
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
 * Accepts project nanoid, resolves to numeric id for the FK
 */
export async function createVersion(projectNanoid: string, version: Omit<VersionInsert, 'project_id'>): Promise<Version> {
    const supabase = await createClient();
    const projectId = await resolveProjectId(projectNanoid);

    const { data: highestPositionRows, error: positionError } = await supabase
        .from('versions')
        .select('position')
        .eq('project_id', projectId)
        .order('position', { ascending: false })
        .limit(1);

    if (positionError) {
        console.error('Error fetching version position:', positionError);
        throw new Error('Failed to create version');
    }

    const nextPosition = (highestPositionRows?.[0]?.position ?? -1) + 1;

    const { data, error } = await supabase
        .from('versions')
        .insert({
            ...version,
            project_id: projectId,
            position: nextPosition,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating version:', error);
        throw new Error('Failed to create version');
    }

    revalidatePath(`/projects/${projectNanoid}`);
    return data;
}

/**
 * Update an existing version (lookup by version nanoid)
 */
export async function updateVersion(versionNanoid: string, projectNanoid: string, updates: VersionUpdate): Promise<Version> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('versions')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('nanoid', versionNanoid)
        .select()
        .single();

    if (error) {
        console.error('Error updating version:', error);
        throw new Error('Failed to update version');
    }

    revalidatePath(`/projects/${projectNanoid}`);
    return data;
}

/**
 * Delete a version (lookup by version nanoid)
 */
export async function deleteVersion(versionNanoid: string, projectNanoid: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('versions')
        .delete()
        .eq('nanoid', versionNanoid);

    if (error) {
        console.error('Error deleting version:', error);
        throw new Error('Failed to delete version');
    }

    revalidatePath(`/projects/${projectNanoid}`);
}

/**
 * Set a version as active (and deactivate others)
 * Uses version nanoid for the target, project nanoid for project-level operations
 */
export async function setVersionActive(versionNanoid: string, projectNanoid: string): Promise<void> {
    const supabase = await createClient();
    const projectId = await resolveProjectId(projectNanoid);

    // Get the version's numeric id for the FK update
    const { data: version } = await supabase
        .from('versions')
        .select('id')
        .eq('nanoid', versionNanoid)
        .single();

    if (!version) {
        throw new Error('Version not found');
    }

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
        .eq('nanoid', versionNanoid);

    if (activateError) {
        console.error('Error activating version:', activateError);
        throw new Error('Failed to activate version');
    }

    // Update the project's active_version_id (uses numeric id for FK)
    const { error: projectError } = await supabase
        .from('projects')
        .update({ active_version_id: version.id, updated_at: new Date().toISOString() })
        .eq('nanoid', projectNanoid);

    if (projectError) {
        console.error('Error updating project active version:', projectError);
        throw new Error('Failed to update project');
    }

    revalidatePath(`/projects/${projectNanoid}`);
}

/**
 * Move a version up or down in the ordered list.
 */
export async function moveVersion(
    versionNanoid: string,
    projectNanoid: string,
    direction: 'up' | 'down'
): Promise<Version[]> {
    const supabase = await createClient();
    const projectId = await resolveProjectId(projectNanoid);

    const { data: versions, error: versionsError } = await supabase
        .from('versions')
        .select('id, nanoid, position, created_at')
        .eq('project_id', projectId)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });

    if (versionsError || !versions) {
        console.error('Error fetching versions for reordering:', versionsError);
        throw new Error('Failed to reorder versions');
    }

    if (versions.length < 2) {
        return getVersions(projectNanoid);
    }

    const currentIndex = versions.findIndex((v) => v.nanoid === versionNanoid);
    if (currentIndex === -1) {
        throw new Error('Version not found');
    }

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= versions.length) {
        return getVersions(projectNanoid);
    }

    const reordered = [...versions];
    const temp = reordered[currentIndex];
    reordered[currentIndex] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const updates = reordered
        .map((version, index) => ({ id: version.id, position: index, currentPosition: version.position }))
        .filter((version) => version.currentPosition !== version.position);

    for (const version of updates) {
        const { error: updateError } = await supabase
            .from('versions')
            .update({ position: version.position, updated_at: new Date().toISOString() })
            .eq('id', version.id)
            .eq('project_id', projectId);

        if (updateError) {
            console.error('Error updating version position:', updateError);
            throw new Error('Failed to reorder versions');
        }
    }

    revalidatePath(`/projects/${projectNanoid}`);
    return getVersions(projectNanoid);
}
