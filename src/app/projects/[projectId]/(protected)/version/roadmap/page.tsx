import { redirect } from 'next/navigation';

interface LegacyRoadmapPageProps {
  params: Promise<{ projectId: string }>;
}

export default async function LegacyRoadmapPage({ params }: LegacyRoadmapPageProps) {
  const { projectId } = await params;
  redirect(`/projects/${projectId}/versions/roadmap`);
}
