import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/server';
import { getProject } from '@/lib/actions/projects';
import { ProjectSidebar } from '@/components/projects/project-sidebar';

interface ProjectLayoutProps {
    children: React.ReactNode;
    params: Promise<{ projectId: string }>;
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect('/auth/login');
    }

    const { projectId } = await params;
    const project = await getProject(parseInt(projectId, 10));

    if (!project) {
        notFound();
    }

    return (
        <div className="flex min-h-screen bg-background">
            <ProjectSidebar project={project} />
            <main className="flex-1 overflow-auto">
                {children}
            </main>
        </div>
    );
}
