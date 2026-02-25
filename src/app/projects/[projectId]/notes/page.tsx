import { getNotes } from '@/lib/actions/notes';
import { NotesClient } from '@/components/notes/notes-client';

export const metadata = {
    title: 'Notes',
};

interface NotesPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function NotesPage({ params }: NotesPageProps) {
    const { projectId } = await params;

    // projectId is now the nanoid string
    const notes = await getNotes(projectId);

    return <NotesClient initialNotes={notes} projectId={projectId} />;
}
