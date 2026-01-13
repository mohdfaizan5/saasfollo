'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/server';
import { NOTE_TEMPLATES } from '@/lib/constants/note-templates';
import type { Note, NoteInsert, NoteUpdate } from '@/lib/types/database';
import type { NoteTemplateKey } from '@/lib/constants/note-templates';

/**
 * Get all notes for a project
 */
export async function getNotes(projectId: number): Promise<Note[]> {
    const supabase = await createClient();

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
 * Get a single note by ID
 */
export async function getNote(noteId: number): Promise<Note | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', noteId)
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
 */
export async function createNote(note: NoteInsert): Promise<Note> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('notes')
        .insert(note)
        .select()
        .single();

    if (error) {
        console.error('Error creating note:', error);
        throw new Error('Failed to create note');
    }

    revalidatePath(`/projects/${note.project_id}`);
    return data;
}

/**
 * Create a note from a template
 */
export async function createNoteFromTemplate(
    projectId: number,
    templateKey: NoteTemplateKey
): Promise<Note> {
    const template = NOTE_TEMPLATES[templateKey];

    return createNote({
        project_id: projectId,
        title: template.title,
        content: template.content,
    });
}

/**
 * Update an existing note
 */
export async function updateNote(noteId: number, projectId: number, updates: NoteUpdate): Promise<Note> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('notes')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)
        .select()
        .single();

    if (error) {
        console.error('Error updating note:', error);
        throw new Error('Failed to update note');
    }

    revalidatePath(`/projects/${projectId}`);
    return data;
}

/**
 * Delete a note
 */
export async function deleteNote(noteId: number, projectId: number): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

    if (error) {
        console.error('Error deleting note:', error);
        throw new Error('Failed to delete note');
    }

    revalidatePath(`/projects/${projectId}`);
}
