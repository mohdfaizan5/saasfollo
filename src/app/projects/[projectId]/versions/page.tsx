import { getVersions } from '@/lib/actions/versions';
import { getProject } from '@/lib/actions/projects';
import { getTasks } from '@/lib/actions/tasks';
import { getProjectCollaborators } from '@/lib/actions/collaborators';
import { VersionsClient } from '@/components/versions/versions-client';
import { createClient } from '@/lib/server';

interface VersionsPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function VersionsPage({ params }: VersionsPageProps) {
    const { projectId } = await params;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [versions, project, tasks, collaborators] = await Promise.all([
        getVersions(projectId),
        getProject(projectId),
        getTasks(projectId),
        getProjectCollaborators(projectId),
    ]);

    const activeVersionNanoid = versions.find(v => v.id === project?.active_version_id)?.nanoid ?? null;

    return (
        <VersionsClient
            initialVersions={versions}
            projectId={projectId}
            activeVersionId={activeVersionNanoid}
            tasks={tasks}
            collaborators={collaborators}
            currentUserId={user?.id || ''}
        />
    );
}
