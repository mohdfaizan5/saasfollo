import { notFound } from 'next/navigation';
import { getNote } from '@/lib/actions/notes';
import { NoteEditor } from '@/components/notes/note-editor';

interface NotePageProps {
    params: Promise<{ projectId: string; noteId: string }>;
}

export default async function NotePage({ params }: NotePageProps) {
    const { projectId, noteId } = await params;
    const projectIdNum = parseInt(projectId, 10);
    const noteIdNum = parseInt(noteId, 10);

    const note = await getNote(noteIdNum);

    if (!note) {
        notFound();
    }

    return <NoteEditor note={note} projectId={projectIdNum} />;
}
