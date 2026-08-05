'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { updateNote } from '@/lib/actions/notes';
import { useProjectRole } from '@/hooks/use-project-role';
import { updateVersion } from '@/lib/actions/versions';
import type { Note } from '@/lib/types/database';

interface NoteEditorProps {
    note: Note;
    projectId: string;
    isPRD?: boolean;
}

type EditorJsBlock = {
    type?: string;
    data?: Record<string, unknown>;
};

function editorJsToMarkdown(content: string | null): string {
    if (!content) return '';

    try {
        const parsed = JSON.parse(content) as { blocks?: EditorJsBlock[] };
        if (!parsed || !Array.isArray(parsed.blocks)) {
            return content;
        }

        const parts = parsed.blocks
            .map((block) => {
                const data = block.data ?? {};

                switch (block.type) {
                    case 'header': {
                        const level = Math.min(Math.max(Number(data.level ?? 2), 1), 6);
                        const text = String(data.text ?? '').trim();
                        return text ? `${'#'.repeat(level)} ${text}` : '';
                    }
                    case 'list': {
                        const items = Array.isArray(data.items) ? data.items : [];
                        const isOrdered = String(data.style ?? '').toLowerCase() === 'ordered';
                        return items
                            .map((item, index) => {
                                const text = typeof item === 'string' ? item : String((item as { content?: string; text?: string }).content ?? (item as { text?: string }).text ?? '');
                                if (!text.trim()) return '';
                                return isOrdered ? `${index + 1}. ${text.trim()}` : `- ${text.trim()}`;
                            })
                            .filter(Boolean)
                            .join('\n');
                    }
                    case 'checklist': {
                        const items = Array.isArray(data.items) ? data.items : [];
                        return items
                            .map((item) => {
                                const checked = Boolean((item as { checked?: boolean }).checked);
                                const text = String((item as { text?: string }).text ?? '').trim();
                                return text ? `- [${checked ? 'x' : ' '}] ${text}` : '';
                            })
                            .filter(Boolean)
                            .join('\n');
                    }
                    case 'quote': {
                        const text = String(data.text ?? '').trim();
                        return text ? `> ${text}` : '';
                    }
                    case 'code': {
                        const code = String(data.code ?? '').trim();
                        if (!code) return '';
                        const language = String(data.language ?? '').trim();
                        return `\
\
${'```'}${language}\n${code}\n${'```'}\n\
\
`;
                    }
                    case 'image': {
                        const url = String((data.file as { url?: string } | undefined)?.url ?? data.url ?? '').trim();
                        if (!url) return '';
                        const alt = String(data.caption ?? data.alt ?? '').trim();
                        return `![${alt}](${url})`;
                    }
                    case 'paragraph':
                    default: {
                        const text = String(data.text ?? '').trim();
                        return text;
                    }
                }
            })
            .filter(Boolean)
            .join('\n\n');

        return parts.trim();
    } catch {
        return content;
    }
}

export function NoteEditor({ note, projectId, isPRD = false }: NoteEditorProps) {
    const router = useRouter();
    const { canEdit } = useProjectRole();
    const [title, setTitle] = useState(note.title);
    const [savedTitle, setSavedTitle] = useState(note.title);
    const [content, setContent] = useState(() => editorJsToMarkdown(note.content));
    const [savedContent, setSavedContent] = useState(() => editorJsToMarkdown(note.content));
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTitle(note.title);
        setSavedTitle(note.title);
        const nextContent = editorJsToMarkdown(note.content);
        setContent(nextContent);
        setSavedContent(nextContent);
    }, [note.title, note.content, note.nanoid]);

    const hasChanges = isPRD
        ? content !== savedContent
        : title !== savedTitle || content !== savedContent;

    const saveNote = useCallback(async () => {
        if (!canEdit) return;

        setIsSaving(true);
        try {
            const nextContent = content.trim() ? content : null;
            if (isPRD) {
                await updateVersion(note.nanoid, projectId, { prd: nextContent });
            } else {
                await updateNote(note.nanoid, projectId, { title, content: nextContent });
            }
            setSavedTitle(title);
            setSavedContent(content);
        } catch (err) {
            console.error(isPRD ? 'Failed to save PRD:' : 'Failed to save note:', err);
        } finally {
            setIsSaving(false);
        }
    }, [canEdit, content, isPRD, note.nanoid, projectId, title]);

    useEffect(() => {
        if (!hasChanges || !canEdit) return;

        const timer = setTimeout(() => {
            void saveNote();
        }, 10000);

        return () => clearTimeout(timer);
    }, [hasChanges, saveNote, canEdit]);

    const handleBack = async () => {
        if (hasChanges && canEdit) {
            await saveNote();
        }
        router.push(`/projects/${projectId}/notes`);
    };

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-6">
            <div className="flex items-center justify-between gap-4">
                <Button variant="ghost" onClick={handleBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Notes
                </Button>
                <div className="flex items-center gap-2">
                    {!canEdit && (
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                            <Eye className="mr-1 h-3 w-3" />
                            View Only
                        </Badge>
                    )}
                    {canEdit && (
                        <>
                            {hasChanges && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
                            <Button variant="outline" size="sm" onClick={saveNote} disabled={isSaving || !hasChanges}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                        </>
                    )}
                </div>
            </div>

            <textarea
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="no-scrollbar w-full resize-none border-0 bg-transparent px-0 text-4xl font-bold focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
                placeholder={isPRD ? 'PRD Title' : 'Note title...'}
                maxLength={80}
                readOnly={!canEdit || isPRD}
                rows={1}
            />

            <RichTextEditor
                value={content}
                onChange={setContent}
                projectNanoid={projectId}
                placeholder={canEdit ? 'Start writing... Use / shortcuts, markdown, and image uploads.' : 'No content yet'}
                editable={canEdit}
                className="min-h-[50vh]"
            />
        </div>
    );
}







