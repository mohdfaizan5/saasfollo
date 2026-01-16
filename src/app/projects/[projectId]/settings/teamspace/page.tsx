import { getProject } from '@/lib/actions/projects';
import { getProjectCollaborators } from '@/lib/actions/collaborators';
import { notFound, redirect } from 'next/navigation';
import { CollaboratorsClient } from '@/components/projects/collaborators-client';
import { createClient } from '@/lib/server';

interface TeamspaceSettingsPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function TeamspaceSettingsPage({ params }: TeamspaceSettingsPageProps) {
    const { projectId } = await params;
    const project = await getProject(parseInt(projectId, 10));

    if (!project) notFound();

    // Get current user email
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/auth/login');

    const collaborators = await getProjectCollaborators(project.id);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-lg font-semibold mb-1">Teamspace Settings</h2>
                <p className="text-sm text-muted-foreground">
                    Manage team members and their access levels.
                </p>
            </div>

            <CollaboratorsClient
                projectId={project.id}
                collaborators={collaborators}
                currentUserEmail={user.email || ''}
            />
        </div>
    );
}
