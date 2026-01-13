'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FileText, Plus, Trash2, FileType } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { createNote, createNoteFromTemplate, deleteNote } from '@/lib/actions/notes';
import { NOTE_TEMPLATES } from '@/lib/constants/note-templates';
import type { Note } from '@/lib/types/database';

interface NotesClientProps {
    initialNotes: Note[];
    projectId: number;
}

export function NotesClient({ initialNotes, projectId }: NotesClientProps) {
    const router = useRouter();
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

    const handleCreateFromTemplate = async (templateKey: keyof typeof NOTE_TEMPLATES) => {
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
        if (!confirm('Are you sure you want to delete this note?')) return;
        try {
            await deleteNote(noteId, projectId);
            setNotes((prev) => prev.filter((n) => n.id !== noteId));
        } catch (err) {
            console.error('Failed to delete note:', err);
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Notes</h1>
                        <p className="text-sm text-muted-foreground">
                            Capture thoughts and ideas
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="outline"><FileType className="h-4 w-4 mr-2" />Templates</Button>} />
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleCreateFromTemplate('icp')}>
                                ICP (Ideal Customer Profile)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCreateFromTemplate('blank')}>
                                Blank Note
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <AlertDialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" />New Note</Button>} />
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
                </div>
            </div>

            {/* Notes Grid */}
            {notes.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No notes yet</p>
                    <p className="text-sm">Create a note or use a template</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {notes.map((note) => (
                        <Link key={note.id} href={`/projects/${projectId}/notes/${note.id}`}>
                            <Card className="p-4 hover:shadow-md transition-all hover:border-primary/30 group cursor-pointer">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-medium truncate">{note.title}</h3>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                                        onClick={(e) => handleDelete(note.id, e)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                {note.content && (
                                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                                        {note.content.slice(0, 150)}...
                                    </p>
                                )}
                                <p className="text-xs text-muted-foreground mt-3">
                                    Updated {new Date(note.updated_at).toLocaleDateString()}
                                </p>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
