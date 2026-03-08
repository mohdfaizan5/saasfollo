import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { createClient } from '@/lib/server';
import { getProjects } from '@/lib/actions/projects';
import { ProjectCard, ProjectsHeader } from '@/components/projects';

export const metadata = {
    title: 'Projects | SaaSFollo',
};

export default async function ProjectsPage() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
        redirect('/auth/login');
    }

    const projects = await getProjects();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect('/auth/login');
    }
    return (
        <div className="min-h-screen bg-background">
            {/* <p className="font-serif text-center max-w-64">
                Voice-first AI powered productivity system for your daily life
            </p> */}
            <ProjectsHeader userEmail={user.email || ''} />

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <FolderKanban className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-me font-serif">Projects</h1>
                            <p className="text-sm text-muted-foreground">
                                Manage your SaaS products
                            </p>
                        </div>
                    </div>
                    <Link href="/projects/new" className={``}>
                        <Button>

                            New Project
                        </Button>
                    </Link>
                </div>

                {/* Projects Grid */}
                {projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="p-4 rounded-full bg-muted mb-4">
                            <FolderKanban className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h2 className="text-lg font-semibold mb-2">No projects yet</h2>
                        <p className="text-muted-foreground mb-6 max-w-md">
                            Create your first project to start tracking your SaaS product with clarity.
                        </p>
                        <Link href="/projects/new" className={``}>
                            New Project
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
