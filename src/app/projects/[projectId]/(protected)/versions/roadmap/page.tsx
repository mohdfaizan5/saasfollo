import { notFound } from 'next/navigation';
import { getVersions } from '@/lib/actions/versions';
import { getProject } from '@/lib/actions/projects';
import RoadmapTimeline from '@/components/roadmap-timeline';

export const metadata = {
  title: 'Roadmap',
};

interface VersionsPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function VersionsPage({ params }: VersionsPageProps) {
  const { projectId } = await params;

  const [versions, project] = await Promise.all([
    getVersions(projectId),
    getProject(projectId),
  ]);

  if (!project) {
    notFound();
  }

  const activeVersionId =
    project.active_version_id ??
    versions.find((version) => version.status === 'active')?.id ??
    null;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4 ml-8">Roadmap</h1>
      <RoadmapTimeline
      versions={versions}
      activeVersionId={activeVersionId}
      projectNanoid={projectId}
    />
    </div>
  );
}
