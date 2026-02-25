import { redirect } from 'next/navigation';

export const metadata = {
    title: 'SaaSFollo',
};

interface ProjectPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
    const { projectId } = await params;
    redirect(`/projects/${projectId}/dashboard`);
}
