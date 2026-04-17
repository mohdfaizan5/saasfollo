'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Trash2, Users, Target, FileQuestion, Lightbulb, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogPopup, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogClose, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { createNote, createNoteFromTemplate, deleteNote } from '@/lib/actions/notes';
import { NOTE_TEMPLATES, type NoteTemplateKey } from '@/lib/constants/note-templates';
import { useProjectRole } from '@/hooks/use-project-role';
import type { Note, Version } from '@/lib/types/database';
import { updateVersion } from '@/lib/actions/versions';
import { TargetIcon } from '@phosphor-icons/react';
import { FolderIcon } from '@phosphor-icons/react/dist/ssr';
import Image from 'next/image';

// Template card configuration with icons and colors
const TEMPLATE_CONFIG: Record<NoteTemplateKey, { icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }> = {
    icp: { icon: TargetIcon, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    blank: { icon: FileText, color: 'text-gray-600', bgColor: 'bg-gray-100' },
    meetingNotes: { icon: Users, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    productRequirements: { icon: ClipboardList, color: 'text-green-600', bgColor: 'bg-green-100' },
    brainstorm: { icon: Lightbulb, color: 'text-amber-600', bgColor: 'bg-amber-100' },
};

interface NotesClientProps {
    initialNotes: Note[];
    initialVersions?: Version[];
    projectId: string;
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

export function NotesClient({ initialNotes, initialVersions = [], projectId }: NotesClientProps) {
    const router = useRouter();
    const { canEdit } = useProjectRole();
    const [notes, setNotes] = useState<Note[]>(initialNotes);
    const [versions, setVersions] = useState<Version[]>(initialVersions);

    // Dialog state for PRD
    const [editingVersion, setEditingVersion] = useState<Version | null>(null);
    const [prdDraft, setPrdDraft] = useState('');
    const [isSavingPrd, setIsSavingPrd] = useState(false);

    // Notes states
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
            const note = await createNote(projectId, {
                title: newTitle.trim(),
            });
            setNotes((prev) => [note, ...prev]);
            setIsDialogOpen(false);
            setNewTitle('');
            router.push(`/projects/${projectId}/notes/${note.nanoid}`);
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
            router.push(`/projects/${projectId}/notes/${note.nanoid}`);
        } catch (err) {
            console.error('Failed to create note from template:', err);
        }
    };

    const handleDelete = async (noteNanoid: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!canEdit) return;
        if (!confirm('Are you sure you want to delete this note?')) return;
        try {
            await deleteNote(noteNanoid, projectId);
            setNotes((prev) => prev.filter((n) => n.nanoid !== noteNanoid));
        } catch (err) {
            console.error('Failed to delete note:', err);
        }
    };

    const templateKeys = Object.keys(NOTE_TEMPLATES) as NoteTemplateKey[];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between ">
                <div className="flex items-center gap-0 relative">
                    <div className="p-3 pr-0 relative">
                        <span className='bg-primary absolute left-8 rounded-full size-20'></span>
                        {/* <FileText className="h-8 w-8 text-primary" /> */}
                    <Image src={"/notes-ideas.png"} alt="Tied Wires" width={120} height={120} className="absolute2 -bottom-4 -right-2 -rotate-6" />
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
                        <AlertDialogPopup>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Create New Note</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Add a note to capture ideas and thoughts
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <div className="space-y-4 px-6 py-4">
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
                                <AlertDialogClose render={<Button variant="outline" disabled={isCreating} />}>
                                    Cancel
                                </AlertDialogClose>
                                <Button onClick={handleCreate} disabled={isCreating}>
                                    {isCreating ? 'Creating...' : 'Create Note'}
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogPopup>
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
                                    className="group flex flex- items-start gap-3 p-4 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-200 text-left hover:shadow-md"
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
            {notes.length === 0 && !isCreating ? (
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
                    {isCreating && (
                        <Card className="note-card p-5 bg-card mb-4 break-inside-avoid">
                            <div className="space-y-3">
                                <Skeleton className="h-5 w-2/3" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-11/12" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-3 w-24 mt-6" />
                            </div>
                        </Card>
                    )}
                    {notes.map((note) => {
                        const preview = getPreviewText(note.content);
                        return (
                            <Link key={note.nanoid} href={`/projects/${projectId}/notes/${note.nanoid}`}>
                                <Card className="note-card p-5 hover:shadow-lg transition-all duration-200 hover:border-primary/40 group cursor-pointer bg-card hover:-translate-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="font-semibold text-base leading-snug">{note.title}</h3>
                                        {canEdit && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                onClick={(e) => handleDelete(note.nanoid, e)}
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

            {/* Version PRDs Section */}
            {versions.length > 0 && (
                <div className="pt-8">
                    <h2 className="text-xl font-bold tracking-tight mb-4">Version PRDs</h2>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                        {versions.map((version) => {
                            const preview = version.prd ? version.prd.substring(0, 250) + (version.prd.length > 250 ? '...' : '') : 'No PRD written yet.';
                            return (<Link key={version.nanoid} href={`/projects/${projectId}/notes/${version.nanoid}?type=prd`} className="block">
                                <Card
                                    className="note-card bg-primary/5 p-5 hover:shadow-lg transition-all duration-200 hover:border-primary/40 group cursor-pointer  hover:-translate-y-1 break-inside-avoid"
                                >
                                    <div className="flex items-start gap-2">
                                        <FolderIcon size={32} weight="duotone" />

                                        <div>
                                            <h3 className="font-semibold text-base leading-snug">{version.name} PRD</h3>
                                            {/* <p className="text-[10px] text-muted-foreground uppercase opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                                                {canEdit ? "Click to edit" : "Click to view"}
                                            </p> */}
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-3 line-clamp-6 leading-relaxed">
                                        {preview}
                                    </p>
                                    <p className="text-xs text-muted-foreground/70 mt-4 pt-3 border-t">
                                        {new Date(version.updated_at).toLocaleDateString('en-US', {
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

                </div>
            )
            }


        </div>)
}
