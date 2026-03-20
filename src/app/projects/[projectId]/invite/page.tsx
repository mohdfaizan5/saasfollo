import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/server';
import { getProject, getUserProjectRole } from '@/lib/actions/projects';
import { getPendingInvitationForProject } from '@/lib/actions/collaborators';
import { ProjectInviteView } from '@/components/projects/project-invite-view';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeftFromLine } from 'lucide-react';

interface ProjectInvitePageProps {
    params: Promise<{ projectId: string }>;
}

export default async function ProjectInvitePage({ params }: ProjectInvitePageProps) {
    const { projectId } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    const [project, userRole, invitation] = await Promise.all([
        getProject(projectId),
        getUserProjectRole(projectId),
        getPendingInvitationForProject(projectId),
    ]);

    if (!project) {

        return (
            <div className='min-h-screen bg-background flex flex-col items-center justify-center'>
                <h1 className="text-2xl font-bold mb-1">Project Not Found</h1>
                <p className="text-muted-foreground">The project you are trying to access does not exist or has been deleted.</p>
                <Link href="/projects">
                    <Button variant="default" className="mt-4 px-6" >
                        <ArrowLeftFromLine className="h-4 w-4 ml-" />
                        Back to Projects
                    </Button>
                </Link>
            </div>)
    }

    if (userRole) {
        redirect(`/projects/${projectId}/dashboard`);
    }

    if (!invitation) {
        return (
            <div className='min-h-screen bg-background flex flex-col items-center justify-center'>
                <h1 className="text-2xl font-bold mb-1">Invitation Not Found</h1>
                <p className="text-muted-foreground">The invitation you are trying to access does not exist or has been deleted.</p>
                <Link href="/projects">
                    <Button variant="default" className="mt-4 px-6" >
                        <ArrowLeftFromLine className="h-4 w-4 ml-" />
                        Back to Projects
                    </Button>
                </Link>
            </div>)
    }

    return (
        <ProjectInviteView
            invitationNanoid={invitation.nanoid}
            projectId={projectId}
            projectName={invitation.projects?.name || project.name}
            role={invitation.role}
        />
    );
}
