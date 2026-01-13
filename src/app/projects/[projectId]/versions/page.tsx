import { getVersions } from '@/lib/actions/versions';
import { getProject } from '@/lib/actions/projects';
import { VersionsClient } from '@/components/versions/versions-client';

interface VersionsPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function VersionsPage({ params }: VersionsPageProps) {
    const { projectId } = await params;
    const projectIdNum = parseInt(projectId, 10);

    const [versions, project] = await Promise.all([
        getVersions(projectIdNum),
        getProject(projectIdNum),
    ]);

    return (
        <VersionsClient
            initialVersions={versions}
            projectId={projectIdNum}
            activeVersionId={project?.active_version_id ?? null}
        />
    );
}
