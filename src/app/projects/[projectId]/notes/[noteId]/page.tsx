import { notFound } from 'next/navigation';
import { getNote } from '@/lib/actions/notes';
import { NoteEditor } from '@/components/notes/note-editor';

interface NotePageProps {
    params: Promise<{ projectId: string; noteId: string }>;
}

export default async function NotePage({ params }: NotePageProps) {
    const { projectId, noteId } = await params;

    // noteId is now the nanoid string - pass directly
    const note = await getNote(noteId);

    if (!note) {
        notFound();
    }

    return <NoteEditor note={note} projectId={projectId} />;
}
