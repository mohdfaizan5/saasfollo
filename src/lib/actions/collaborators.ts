'use server';

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';
import type { ProjectCollaborator, CollaboratorRole } from '@/lib/types/database';

export async function getProjectCollaborators(projectId: number): Promise<ProjectCollaborator[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('project_collaborators')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching collaborators:', error);
        throw new Error('Failed to fetch collaborators');
    }
    return data || [];
}

export async function addCollaborator(projectId: number, email: string, role: CollaboratorRole) {
    const supabase = await createClient();
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // 1. Resolve email to user_id using RPC
    const { data: userId, error: rpcError } = await supabase.rpc('get_user_id_by_email', { user_email: email });

    if (rpcError) {
        console.error('Error resolving email:', rpcError);
        throw new Error('Failed to resolve user email');
    }

    if (!userId) {
        throw new Error('User not found. They must sign up for the app first.');
    }

    // 2. Insert into project_collaborators
    const { error } = await supabase.from('project_collaborators').insert({
        project_id: projectId,
        user_id: userId,
        email: email,
        role: role,
        invited_by: currentUser?.id
    });

    if (error) {
        if (error.code === '23505') { // Unique violation
            throw new Error('User is already a collaborator');
        }
        console.error('Error adding collaborator:', error);
        throw new Error('Failed to add collaborator');
    }

    revalidatePath(`/projects/${projectId}/settings`);
    return { success: true };
}

export async function removeCollaborator(collaboratorId: number, projectId: number) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('project_collaborators')
        .delete()
        .eq('id', collaboratorId);

    if (error) {
        console.error('Error removing collaborator:', error);
        throw new Error('Failed to remove collaborator');
    }
    revalidatePath(`/projects/${projectId}/settings`);
}

export async function updateCollaboratorRole(collaboratorId: number, role: CollaboratorRole, projectId: number) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('project_collaborators')
        .update({ role })
        .eq('id', collaboratorId);

    if (error) {
        console.error('Error updating collaborator role:', error);
        throw new Error('Failed to update role');
    }
    revalidatePath(`/projects/${projectId}/settings`);
}
