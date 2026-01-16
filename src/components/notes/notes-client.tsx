'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Trash2, Users, Target, FileQuestion, Lightbulb, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { createNote, createNoteFromTemplate, deleteNote } from '@/lib/actions/notes';
import { NOTE_TEMPLATES, type NoteTemplateKey } from '@/lib/constants/note-templates';
import { useProjectRole } from '@/hooks/use-project-role';
import type { Note } from '@/lib/types/database';

// Template card configuration with icons and colors
const TEMPLATE_CONFIG: Record<NoteTemplateKey, { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }> = {
    icp: { icon: Target, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    blank: { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100' },
    meetingNotes: { icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    productRequirements: { icon: ClipboardList, color: 'text-green-600', bgColor: 'bg-green-100' },
    brainstorm: { icon: Lightbulb, color: 'text-amber-600', bgColor: 'bg-amber-100' },
};

interface NotesClientProps {
    initialNotes: Note[];
    projectId: number;
}

// Helper to get preview text from note content (handles both plain text and potential JSON)
function getPreviewText(content: string | null): string {
    if (!content) return '';
    // Try to parse as JSON (Editor.js format) - fall back to plain text
    try {
        const parsed = JSON.parse(content);
        if (parsed.blocks && Array.isArray(parsed.blocks)) {
            return parsed.blocks
                .slice(0, 3)
                .map((block: { data?: { text?: string } }) => block.data?.text || '')
                .filter(Boolean)
                .join(' ');
        }
    } catch {
        // Not JSON, return as plain text
    }
    return content;
}

export function NotesClient({ initialNotes, projectId }: NotesClientProps) {
    const router = useRouter();
    const { canEdit } = useProjectRole();
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!newTitle.trim()) {
            setError('Note title is required');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const note = await createNote({
                project_id: projectId,
                title: newTitle.trim(),
            });
            setNotes((prev) => [note, ...prev]);
            setIsDialogOpen(false);
            setNewTitle('');
            router.push(`/projects/${projectId}/notes/${note.id}`);
        } catch (err) {
            console.error('Failed to create note:', err);
            setError('Failed to create note');
        } finally {
            setIsCreating(false);
        }
    };

    const handleCreateFromTemplate = async (templateKey: NoteTemplateKey) => {
        if (!canEdit) return;
        try {
            const note = await createNoteFromTemplate(projectId, templateKey);
            setNotes((prev) => [note, ...prev]);
            router.push(`/projects/${projectId}/notes/${note.id}`);
        } catch (err) {
            console.error('Failed to create note from template:', err);
        }
    };

    const handleDelete = async (noteId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!canEdit) return;
        if (!confirm('Are you sure you want to delete this note?')) return;
        try {
            await deleteNote(noteId, projectId);
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
        } catch (err) {
            console.error('Failed to delete note:', err);
        }
    };

    const templateKeys = Object.keys(NOTE_TEMPLATES) as NoteTemplateKey[];

    return (
        <div className="p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-linear-to-br from-primary/20 to-primary/5">
                        <FileText className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
                        <p className="text-muted-foreground">
                            Capture thoughts and ideas
                        </p>
                    </div>
                </div>

                {canEdit && (
                    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <AlertDialogTrigger render={<Button size="lg"><Plus className="h-5 w-5 mr-2" />New Note</Button>} />
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Create New Note</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Add a note to capture ideas and thoughts
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="note-title">Title</Label>
                                    <Input
                                        id="note-title"
                                        placeholder="Note title..."
                                        value={newTitle}
                                        onChange={(e) => setNewTitle(e.target.value)}
                                        disabled={isCreating}
                                    />
                                </div>
                                {error && <p className="text-sm text-destructive">{error}</p>}
                            </div>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isCreating}>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCreate} disabled={isCreating}>
                                    {isCreating ? 'Creating...' : 'Create Note'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            {/* Template Cards */}
            {canEdit && (
                <div className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Quick Start Templates</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {templateKeys.map((key) => {
                            const template = NOTE_TEMPLATES[key];
                            const config = TEMPLATE_CONFIG[key] || { icon: FileQuestion, color: 'text-gray-600', bgColor: 'bg-gray-100' };
                            const IconComponent = config.icon;

                            return (
                                <button
                                    key={key}
                                    onClick={() => handleCreateFromTemplate(key)}
                                    className="group flex flex-col items-start gap-3 p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 text-left hover:shadow-md"
                                >
                                    <div className={`p-2.5 rounded-lg ${config.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                                        <IconComponent className={`h-5 w-5 ${config.color}`} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm leading-tight">{template.title}</p>
                                        {template.description && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{template.description}</p>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Notes Masonry Grid */}
            {notes.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <div className="inline-flex p-6 rounded-full bg-muted/50 mb-6">
                        <FileText className="h-12 w-12 opacity-50" />
                    </div>
                    <p className="text-lg font-medium">No notes yet</p>
                    <p className="text-sm mt-1">
                        {canEdit ? 'Create a note or use a template above to get started' : 'No notes have been created in this project'}
                    </p>
                </div>
            ) : (
                <div className="notes-masonry">
                    {notes.map((note) => {
                        const preview = getPreviewText(note.content);
                        return (
                            <Link key={note.id} href={`/projects/${projectId}/notes/${note.id}`}>
                                <Card className="note-card p-5 hover:shadow-lg transition-all duration-200 hover:border-primary/40 group cursor-pointer bg-card hover:-translate-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-base leading-snug">{note.title}</h3>
                                        {canEdit && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                onClick={(e) => handleDelete(note.id, e)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                    {preview && (
                                        <p className="text-sm text-muted-foreground mt-3 line-clamp-6 leading-relaxed">
                                            {preview.slice(0, 250)}{preview.length > 250 ? '...' : ''}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground/70 mt-4 pt-3 border-t">
                                        {new Date(note.updated_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
