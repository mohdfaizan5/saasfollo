'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { updateNote } from '@/lib/actions/notes';
import { useProjectRole } from '@/hooks/use-project-role';
import { EditorJSWrapper, parseEditorContent, stringifyEditorContent } from './editorjs-wrapper';
import { updateVersion } from '@/lib/actions/versions';
import type { Note } from '@/lib/types/database';
import type { OutputData } from '@editorjs/editorjs';

interface NoteEditorProps {
    note: Note;
    projectId: string;
    isPRD?: boolean;
}

const NOTES_EDITOR_BLOCK_GAP = '0.5rem';

export function NoteEditor({ note, projectId, isPRD = false }: NoteEditorProps) {
    const router = useRouter();
    const { canEdit } = useProjectRole();
    const [title, setTitle] = useState(note.title);
    const [editorData, setEditorData] = useState<OutputData | null>(() => parseEditorContent(note.content));
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    // Track title changes
    useEffect(() => {
        if (!canEdit || isPRD) return;
        const titleChanged = title !== note.title;
        setHasChanges(titleChanged);
    }, [title, note.title, canEdit, isPRD]);

    // Handle editor content changes
    const handleEditorChange = useCallback((data: OutputData) => {
        setEditorData(data);
        if (canEdit) {
            setHasChanges(true);
        }
    }, [canEdit]);

    // Save note
    const saveNote = useCallback(async () => {
        if (!canEdit) return;

        setIsSaving(true);
        try {
            const content = editorData ? stringifyEditorContent(editorData) : null;
            if (isPRD) {
                // For PRD, nanoid is the version nanoid
                await updateVersion(note.nanoid, projectId, { prd: content });
            } else {
                await updateNote(note.nanoid, projectId, { title, content });
            }
            setHasChanges(false);
        } catch (err) {
            console.error(isPRD ? 'Failed to save PRD:' : 'Failed to save note:', err);
        } finally {
            setIsSaving(false);
        }
    }, [isPRD, note.nanoid, projectId, title, editorData, canEdit]);

    // Auto-save every 10 seconds if there are changes
    useEffect(() => {
        if (!hasChanges || !canEdit) return;

        const timer = setTimeout(() => {
            saveNote();
        }, 10000);

        return () => clearTimeout(timer);
    }, [hasChanges, saveNote, canEdit]);

    const handleBack = async () => {
        if (hasChanges && canEdit) {
            await saveNote();
        }
        router.push(`/projects/${projectId}/notes`);
    };

    // Memoize initial data to prevent re-renders
    const initialEditorData = useMemo(() =>
        parseEditorContent(note.content),
        [note.content]
    );

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Notes
                </Button>
                <div className="flex items-center gap-2">
                    {!canEdit && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                            <Eye className="h-3 w-3 mr-1" />
                            View Only
                        </Badge>
                    )}
                    {canEdit && (
                        <>
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
                        </>
                    )}
                </div>
            </div>

            {/* Title - Bigger and Editable */}
            <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="no-scrollbar w-full text-4xl font-bold border-0 bg-transparent px-0 focus:outline-none focus:ring-0 placeholder:text-muted-foreground resize-none"
                placeholder={isPRD ? "PRD Title" : "Note title..."}
                maxLength={80}
                readOnly={!canEdit || isPRD}
                rows={1}
            />

            {/* Content Editor */}
            <div
                    className="notes-editor-shell border-none rounded-lg p-4 bg-transparent min-h-[50vh]"
                    style={{ ['--notes-editor-block-gap' as string]: NOTES_EDITOR_BLOCK_GAP }}
                >
                    <EditorJSWrapper
                        data={initialEditorData}
                        onChange={handleEditorChange}
                        readOnly={!canEdit}
                        placeholder={canEdit ? "Start writing... Use '/' for block commands" : "No content yet"}
                    />
                </div>
        </div>
    );
}







