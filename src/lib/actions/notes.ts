/**
 * Server actions for Notes
 * Uses project nanoid for project lookups, note nanoid for individual note operations.
 */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/server';
import { NOTE_TEMPLATES } from '@/lib/constants/note-templates';
import type { Note, NoteInsert, NoteUpdate } from '@/lib/types/database';
import type { NoteTemplateKey } from '@/lib/constants/note-templates';

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
 * Get all notes for a project (by project nanoid)
 */
export async function getNotes(projectNanoid: string): Promise<Note[]> {
    const supabase = await createClient();
    const projectId = await resolveProjectId(projectNanoid);

    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });

    if (error) {
        console.error('Error fetching notes:', error);
        throw new Error('Failed to fetch notes');
    }

    return data || [];
}

/**
 * Get a single note by nanoid
 */
export async function getNote(noteNanoid: string): Promise<Note | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('nanoid', noteNanoid)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('Error fetching note:', error);
        throw new Error('Failed to fetch note');
    }

    return data;
}

/**
 * Create a new note
 * Accepts project nanoid, resolves internally
 */
export async function createNote(projectNanoid: string, note: Omit<NoteInsert, 'project_id'>): Promise<Note> {
    const supabase = await createClient();
    const projectId = await resolveProjectId(projectNanoid);

    const { data, error } = await supabase
        .from('notes')
        .insert({
            ...note,
            project_id: projectId,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating note:', error);
        throw new Error('Failed to create note');
    }

    revalidatePath(`/projects/${projectNanoid}`);
    return data;
}

/**
 * Create a note from a template
 */
export async function createNoteFromTemplate(
    projectNanoid: string,
    templateKey: NoteTemplateKey
): Promise<Note> {
    const template = NOTE_TEMPLATES[templateKey];

    return createNote(projectNanoid, {
        title: template.title,
        content: template.content,
    });
}

/**
 * Update an existing note (lookup by note nanoid)
 */
export async function updateNote(noteNanoid: string, projectNanoid: string, updates: NoteUpdate): Promise<Note> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('notes')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('nanoid', noteNanoid)
        .select()
        .single();

    if (error) {
        console.error('Error updating note:', error);
        throw new Error('Failed to update note');
    }

    revalidatePath(`/projects/${projectNanoid}`);
    return data;
}

/**
 * Delete a note (lookup by note nanoid)
 */
export async function deleteNote(noteNanoid: string, projectNanoid: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('notes')
        .delete()
        .eq('nanoid', noteNanoid);

    if (error) {
        console.error('Error deleting note:', error);
        throw new Error('Failed to delete note');
    }

    revalidatePath(`/projects/${projectNanoid}`);
}
