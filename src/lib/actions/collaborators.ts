/**
 * Server actions for Project Collaborators
 * Uses project nanoid for project lookups, collaborator nanoid for individual operations.
 */
'use server';

import { createAdminClient } from '@/lib/admin';
import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';
import type { ProjectCollaborator, CollaboratorRole } from '@/lib/types/database';

type InvitationProject = {
    name: string;
    nanoid: string;
    icon_url: string | null;
} | null;

export interface PendingInvitation extends ProjectCollaborator {
    projects?: InvitationProject;
}

async function getProjectsForInvitations(projectIds: number[]) {
    if (projectIds.length === 0) {
        return new Map<number, NonNullable<InvitationProject>>();
    }

    const admin = createAdminClient();
    const { data, error } = await admin
        .from('projects')
        .select('id, name, nanoid, icon_url')
        .in('id', projectIds);

    if (error) {
        console.error('Error fetching invitation project details:', error);
        return new Map<number, NonNullable<InvitationProject>>();
    }

    return new Map(
        (data || []).map((project) => [
            project.id,
            {
                name: project.name,
                nanoid: project.nanoid,
                icon_url: project.icon_url,
            },
        ]),
    );
}

async function getPendingInvitationRecord(collaboratorNanoid: string, userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('project_collaborators')
        .select('id, nanoid, project_id, user_id, accepted_at')
        .eq('nanoid', collaboratorNanoid)
        .eq('user_id', userId)
        .is('accepted_at', null)
        .maybeSingle();

    if (error) {
        console.error('Error loading invitation record:', error);
        throw new Error('Failed to load invitation');
    }

    if (!data) {
        throw new Error('Invitation not found');
    }

    return data;
}

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
 * Get all collaborators for a project (by project nanoid)
 */
export async function getProjectCollaborators(projectNanoid: string): Promise<ProjectCollaborator[]> {
    const supabase = await createClient();
    const projectId = await resolveProjectId(projectNanoid);

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

/**
 * Add a collaborator to a project (by project nanoid)
 */
export async function addCollaborator(projectNanoid: string, email: string, role: CollaboratorRole) {
    const supabase = await createClient();
    const projectId = await resolveProjectId(projectNanoid);
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // Resolve email to user_id using RPC
    const { data: userId, error: rpcError } = await supabase.rpc('get_user_id_by_email', { user_email: email });

    if (rpcError) {
        console.error('Error resolving email:', rpcError);
        throw new Error('Failed to resolve user email');
    }

    if (!userId) {
        throw new Error('User not found. They must sign up for the app first.');
    }

    // Insert into project_collaborators
    const { error } = await supabase.from('project_collaborators').insert({
        project_id: projectId,
        user_id: userId,
        email: email,
        role: role,
        invited_by: currentUser?.id
    });

    if (error) {
        if (error.code === '23505') {
            throw new Error('User is already a collaborator');
        }
        console.error('Error adding collaborator:', error);
        throw new Error('Failed to add collaborator');
    }

    revalidatePath(`/projects/${projectNanoid}/settings`);
    revalidatePath(`/projects/${projectNanoid}/invite`);
    return { success: true };
}

/**
 * Remove a collaborator (by collaborator nanoid)
 */
export async function removeCollaborator(collaboratorNanoid: string, projectNanoid: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('project_collaborators')
        .delete()
        .eq('nanoid', collaboratorNanoid);

    if (error) {
        console.error('Error removing collaborator:', error);
        throw new Error('Failed to remove collaborator');
    }
    revalidatePath(`/projects/${projectNanoid}/settings`);
}

/**
 * Update a collaborator's role (by collaborator nanoid)
 */
export async function updateCollaboratorRole(collaboratorNanoid: string, role: CollaboratorRole, projectNanoid: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('project_collaborators')
        .update({ role })
        .eq('nanoid', collaboratorNanoid);

    if (error) {
        console.error('Error updating collaborator role:', error);
        throw new Error('Failed to update role');
    }
    revalidatePath(`/projects/${projectNanoid}/settings`);
}
/**
 * Get pending invitations for the current user
 */
export async function getPendingInvitations() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('project_collaborators')
        .select('*')
        .eq('user_id', user.id)
        .is('accepted_at', null)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching invitations:', error);
        return [];
    }

    const invitations = (data || []) as PendingInvitation[];
    const projectMap = await getProjectsForInvitations(
        Array.from(new Set(invitations.map((inv) => inv.project_id))),
    );

    return invitations.map((invitation) => ({
        ...invitation,
        projects: projectMap.get(invitation.project_id) || null,
    }));
}

/**
 * Get a pending invitation for the current user and project
 */
export async function getPendingInvitationForProject(projectNanoid: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const admin = createAdminClient();
    const { data: project, error: projectError } = await admin
        .from('projects')
        .select('id, name, nanoid, icon_url')
        .eq('nanoid', projectNanoid)
        .maybeSingle();

    if (projectError) {
        console.error('Error loading invite project details:', projectError);
        return null;
    }

    if (!project) return null;

    const { data, error } = await supabase
        .from('project_collaborators')
        .select('*')
        .eq('project_id', project.id)
        .eq('user_id', user.id)
        .is('accepted_at', null)
        .maybeSingle();

    if (error) {
        console.error('Error fetching project invitation:', error);
        return null;
    }

    if (!data) return null;

    return {
        ...(data as ProjectCollaborator),
        projects: {
            name: project.name,
            nanoid: project.nanoid,
            icon_url: project.icon_url,
        },
    } as PendingInvitation;
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(collaboratorNanoid: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const invitation = await getPendingInvitationRecord(collaboratorNanoid, user.id);
    const { error } = await supabase.rpc('accept_project_invitation', {
        collaborator_nanoid: collaboratorNanoid,
    });

    if (error) {
        const shouldFallback = error.code === 'PGRST202';

        if (!shouldFallback) {
            console.error('Accept invitation error:', error);
            throw new Error('Failed to accept invitation');
        }

        const admin = createAdminClient();
        const { error: fallbackError } = await admin
            .from('project_collaborators')
            .update({ accepted_at: new Date().toISOString() })
            .eq('nanoid', collaboratorNanoid)
            .eq('user_id', user.id)
            .is('accepted_at', null);

        if (fallbackError) {
            console.error('Accept invitation fallback error:', fallbackError);
            throw new Error('Failed to accept invitation');
        }
    }

    const projectMap = await getProjectsForInvitations([invitation.project_id]);
    const project = projectMap.get(invitation.project_id);
    revalidatePath('/projects');
    if (project?.nanoid) {
        revalidatePath(`/projects/${project.nanoid}/invite`);
        revalidatePath(`/projects/${project.nanoid}/dashboard`);
    }
}

/**
 * Decline an invitation
 */
export async function declineInvitation(collaboratorNanoid: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const invitation = await getPendingInvitationRecord(collaboratorNanoid, user.id);
    const { error } = await supabase.rpc('decline_project_invitation', {
        collaborator_nanoid: collaboratorNanoid,
    });

    if (error) {
        const shouldFallback = error.code === 'PGRST202';

        if (!shouldFallback) {
            console.error('Decline invitation error:', error);
            throw new Error('Failed to decline invitation');
        }

        const admin = createAdminClient();
        const { error: fallbackError } = await admin
            .from('project_collaborators')
            .delete()
            .eq('nanoid', collaboratorNanoid)
            .eq('user_id', user.id)
            .is('accepted_at', null);

        if (fallbackError) {
            console.error('Decline invitation fallback error:', fallbackError);
            throw new Error('Failed to decline invitation');
        }
    }

    const projectMap = await getProjectsForInvitations([invitation.project_id]);
    const project = projectMap.get(invitation.project_id);
    revalidatePath('/projects');
    if (project?.nanoid) {
        revalidatePath(`/projects/${project.nanoid}/invite`);
    }
}
