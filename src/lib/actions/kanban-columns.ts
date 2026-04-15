'use server';

import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/admin';
import { createClient } from '@/lib/server';
import type { KanbanColumn, KanbanColumnUpdate } from '@/lib/types/database';

type ProjectColumnAccess = {
  projectId: number;
  projectNanoid: string;
  role: 'owner' | 'editor' | 'reader';
};

function getAdminClientOrNull() {
  try {
    return createAdminClient();
  } catch {
    return null;
  }
}

async function resolveProjectAccess(projectNanoid: string): Promise<ProjectColumnAccess> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const admin = getAdminClientOrNull();
  const client = admin ?? supabase;

  const { data, error } = await client
    .from('projects')
    .select('id, nanoid, user_id')
    .eq('nanoid', projectNanoid)
    .maybeSingle();

  if (error || !data) {
    throw new Error('Project not found');
  }

  if (data.user_id === user.id) {
    return {
      projectId: data.id,
      projectNanoid: data.nanoid,
      role: 'owner',
    };
  }

  const { data: collaborator, error: collaboratorError } = await client
    .from('project_collaborators')
    .select('role')
    .eq('project_id', data.id)
    .eq('user_id', user.id)
    .not('accepted_at', 'is', null)
    .maybeSingle();

  if (collaboratorError || !collaborator) {
    throw new Error('Project not found');
  }

  return {
    projectId: data.id,
    projectNanoid: data.nanoid,
    role: collaborator.role as 'owner' | 'editor' | 'reader',
  };
}

function assertCanEdit(role: ProjectColumnAccess['role']) {
  if (role === 'reader') {
    throw new Error('You do not have permission to edit kanban columns');
  }
}

export async function getKanbanColumns(projectNanoid: string): Promise<KanbanColumn[]> {
  const admin = getAdminClientOrNull();
  const client = admin ?? await createClient();
  const { projectId, role } = await resolveProjectAccess(projectNanoid);

  const { data: initialData, error } = await client
    .from('kanban_columns')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching kanban columns:', error);
    throw new Error('Failed to fetch kanban columns');
  }

  let data = initialData;

  if (!data || data.length === 0) {
    if (role === 'reader') {
      return [];
    }

    const { data: inserted, error: insertError } = await client
      .from('kanban_columns')
      .insert([
        { project_id: projectId, title: 'Backlog', description: 'Ideas and upcoming work', position: 0, is_done_column: false },
        { project_id: projectId, title: 'In Progress', description: 'Work currently moving', position: 1, is_done_column: false },
        { project_id: projectId, title: 'Review', description: 'QA or final checks', position: 2, is_done_column: false },
        { project_id: projectId, title: 'Done', description: 'Completed tasks', position: 3, is_done_column: true },
      ])
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: true });

    if (insertError) {
      console.error('Error creating default kanban columns:', insertError);
      const { data: retryData, error: retryError } = await client
        .from('kanban_columns')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true });

      if (retryError) {
        console.error('Error refetching kanban columns:', retryError);
        throw new Error('Failed to initialize kanban columns');
      }

      return retryData || [];
    }

    data = inserted || [];
  }

  return data || [];
}

export async function createKanbanColumn(
  projectNanoid: string,
  input: { title: string; description?: string | null }
): Promise<KanbanColumn> {
  const admin = getAdminClientOrNull();
  const client = admin ?? await createClient();
  const access = await resolveProjectAccess(projectNanoid);
  assertCanEdit(access.role);
  const projectId = access.projectId;

  const { data: lastColumn } = await client
    .from('kanban_columns')
    .select('position')
    .eq('project_id', projectId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (lastColumn?.position ?? -1) + 1;

  const { data, error } = await client
    .from('kanban_columns')
    .insert({
      project_id: projectId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      position: nextPosition,
      is_done_column: false,
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error('Error creating kanban column:', error);
    throw new Error('Failed to create kanban column');
  }

  revalidatePath(`/projects/${projectNanoid}`);
  return data;
}

export async function updateKanbanColumn(
  projectNanoid: string,
  columnNanoid: string,
  updates: KanbanColumnUpdate
): Promise<KanbanColumn> {
  const admin = getAdminClientOrNull();
  const client = admin ?? await createClient();
  const access = await resolveProjectAccess(projectNanoid);
  assertCanEdit(access.role);

  const sanitizedUpdates: KanbanColumnUpdate = { ...updates };

  if (typeof sanitizedUpdates.title === 'string') {
    sanitizedUpdates.title = sanitizedUpdates.title.trim();
  }

  if (typeof sanitizedUpdates.description === 'string') {
    sanitizedUpdates.description = sanitizedUpdates.description.trim() || null;
  }

  const { data, error } = await client
    .from('kanban_columns')
    .update({
      ...sanitizedUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('nanoid', columnNanoid)
    .select('*')
    .single();

  if (error || !data) {
    console.error('Error updating kanban column:', error);
    throw new Error('Failed to update kanban column');
  }

  revalidatePath(`/projects/${projectNanoid}`);
  return data;
}

export async function deleteKanbanColumn(projectNanoid: string, columnNanoid: string): Promise<void> {
  const admin = getAdminClientOrNull();
  const client = admin ?? await createClient();
  const access = await resolveProjectAccess(projectNanoid);
  assertCanEdit(access.role);

  const { count, error: countError } = await client
    .from('tasks')
    .select('id', { count: 'exact', head: true })
    .eq('kanban_column_nanoid', columnNanoid);

  if (countError) {
    console.error('Error checking kanban column usage:', countError);
    throw new Error('Failed to validate kanban column');
  }

  if ((count ?? 0) > 0) {
    throw new Error('Column must be empty before deleting');
  }

  const { error } = await client
    .from('kanban_columns')
    .delete()
    .eq('nanoid', columnNanoid);

  if (error) {
    console.error('Error deleting kanban column:', error);
    throw new Error('Failed to delete kanban column');
  }

  revalidatePath(`/projects/${projectNanoid}`);
}
