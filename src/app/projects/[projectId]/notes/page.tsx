import { getNotes } from '@/lib/actions/notes';
import { getVersions } from '@/lib/actions/versions';
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
    const [notes, versions] = await Promise.all([
        getNotes(projectId),
        getVersions(projectId)
    ]);

    return <NotesClient initialNotes={notes} initialVersions={versions} projectId={projectId} />;
}
