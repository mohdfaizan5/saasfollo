import { getNotes } from '@/lib/actions/notes';
import { NotesClient } from '@/components/notes/notes-client';

interface NotesPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function NotesPage({ params }: NotesPageProps) {
    const { projectId } = await params;
    const projectIdNum = parseInt(projectId, 10);

    const notes = await getNotes(projectIdNum);

    return <NotesClient initialNotes={notes} projectId={projectIdNum} />;
}
