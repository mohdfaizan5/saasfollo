'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/server';
import type { KanbanColumn, KanbanColumnUpdate } from '@/lib/types/database';

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

export async function getKanbanColumns(projectNanoid: string): Promise<KanbanColumn[]> {
  const supabase = await createClient();
  const projectId = await resolveProjectId(projectNanoid);

  let { data, error } = await supabase
    .from('kanban_columns')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching kanban columns:', error);
    throw new Error('Failed to fetch kanban columns');
  }

  if (!data || data.length === 0) {
    const { data: inserted, error: insertError } = await supabase
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
      throw new Error('Failed to initialize kanban columns');
    }

    data = inserted || [];
  }

  return data || [];
}

export async function createKanbanColumn(
  projectNanoid: string,
  input: { title: string; description?: string | null }
): Promise<KanbanColumn> {
  const supabase = await createClient();
  const projectId = await resolveProjectId(projectNanoid);

  const { data: lastColumn } = await supabase
    .from('kanban_columns')
    .select('position')
    .eq('project_id', projectId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (lastColumn?.position ?? -1) + 1;

  const { data, error } = await supabase
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
  const supabase = await createClient();

  const sanitizedUpdates: KanbanColumnUpdate = { ...updates };

  if (typeof sanitizedUpdates.title === 'string') {
    sanitizedUpdates.title = sanitizedUpdates.title.trim();
  }

  if (typeof sanitizedUpdates.description === 'string') {
    sanitizedUpdates.description = sanitizedUpdates.description.trim() || null;
  }

  const { data, error } = await supabase
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
  const supabase = await createClient();

  const { count, error: countError } = await supabase
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

  const { error } = await supabase
    .from('kanban_columns')
    .delete()
    .eq('nanoid', columnNanoid);

  if (error) {
    console.error('Error deleting kanban column:', error);
    throw new Error('Failed to delete kanban column');
  }

  revalidatePath(`/projects/${projectNanoid}`);
}
