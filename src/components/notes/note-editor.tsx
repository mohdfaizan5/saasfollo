'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateNote } from '@/lib/actions/notes';
import type { Note } from '@/lib/types/database';

interface NoteEditorProps {
    note: Note;
    projectId: number;
}

export function NoteEditor({ note, projectId }: NoteEditorProps) {
    const router = useRouter();
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content || '');
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Track changes
    useEffect(() => {
        const titleChanged = title !== note.title;
        const contentChanged = content !== (note.content || '');
        setHasChanges(titleChanged || contentChanged);
    }, [title, content, note.title, note.content]);

    // Auto-save with debounce
    const saveNote = useCallback(async () => {
        if (!hasChanges) return;

        setIsSaving(true);
        try {
            await updateNote(note.id, projectId, {
                title,
                content,
            });
            setHasChanges(false);
        } catch (err) {
            console.error('Failed to save note:', err);
        } finally {
            setIsSaving(false);
        }
    }, [note.id, projectId, title, content, hasChanges]);

    // Auto-save on blur or every 5 seconds if there are changes
    useEffect(() => {
        if (!hasChanges) return;

        const timer = setTimeout(() => {
            saveNote();
        }, 5000);

        return () => clearTimeout(timer);
    }, [hasChanges, saveNote]);

    const handleBack = async () => {
        if (hasChanges) {
            await saveNote();
        }
        router.push(`/projects/${projectId}/notes`);
    };

    return (
        <div className="p-6 space-y-4 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Notes
                </Button>
                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <span className="text-xs text-muted-foreground">Unsaved changes</span>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={saveNote}
                        disabled={isSaving || !hasChanges}
                    >
                        <Save className="h-4 w-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Title */}
            <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold border-0 px-0 focus-visible:ring-0"
                placeholder="Note title..."
            />

            {/* Content */}
            <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing..."
                className="min-h-[60vh] resize-none border-0 px-0 focus-visible:ring-0"
                onBlur={saveNote}
            />
        </div>
    );
}
