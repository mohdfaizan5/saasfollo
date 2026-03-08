import { notFound } from 'next/navigation';
import { getNote } from '@/lib/actions/notes';
import { getVersion } from '@/lib/actions/versions';
import { NoteEditor } from '@/components/notes/note-editor';
import { Note } from '@/lib/types/database'; // Using actual type

export const metadata = {
    title: 'Note',
};

interface NotePageProps {
    params: Promise<{ projectId: string; noteId: string }>;
    searchParams: Promise<{ type?: string }>;
}

export default async function NotePage({ params, searchParams }: NotePageProps) {
    const { projectId, noteId } = await params;
    const { type } = await searchParams;
    const isPRD = type === 'prd';

    let note: Note | null = null;

    if (isPRD) {
        const version = await getVersion(noteId);
        if (version) {
            // Mock a Note object for the editor
            note = {
                id: version.id,
                nanoid: version.nanoid,
                project_id: version.project_id,
                title: `${version.name} PRD`,
                content: version.prd || '', // Passed as string for prdData initialization
                created_at: version.created_at,
                updated_at: version.updated_at,
            } as any; 
        }
    } else {
        note = await getNote(noteId);
    }

    if (!note) {
        notFound();
    }

    return <NoteEditor note={note} projectId={projectId} isPRD={isPRD} />;
}
