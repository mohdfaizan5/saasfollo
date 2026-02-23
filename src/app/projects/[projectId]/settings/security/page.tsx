import { getProject } from '@/lib/actions/projects';
import { notFound } from 'next/navigation';
import { DeleteProjectSection } from '@/components/projects/delete-project-section';

interface SecuritySettingsPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function SecuritySettingsPage({ params }: SecuritySettingsPageProps) {
    const { projectId } = await params;
    const project = await getProject(projectId);

    if (!project) notFound();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-lg font-semibold mb-1">Security Settings</h2>
                <p className="text-sm text-muted-foreground">
                    Manage security options and access controls.
                </p>
            </div>

            {/* Access Logs Section */}
            <div className="border rounded-lg p-6 bg-card">
                <h3 className="text-sm font-medium mb-2">Access Logs</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    View recent access activity for this project.
                </p>
                <div className="border rounded-md divide-y">
                    <div className="p-3 flex items-center justify-between text-sm">
                        <div>
                            <span className="font-medium">Project accessed</span>
                            <p className="text-muted-foreground text-xs">by you</p>
                        </div>
                        <span className="text-muted-foreground text-xs">Just now</span>
                    </div>
                    <div className="p-3 flex items-center justify-between text-sm">
                        <div>
                            <span className="font-medium">Settings updated</span>
                            <p className="text-muted-foreground text-xs">by you</p>
                        </div>
                        <span className="text-muted-foreground text-xs">2 hours ago</span>
                    </div>
                    <div className="p-3 flex items-center justify-between text-sm">
                        <div>
                            <span className="font-medium">Team member added</span>
                            <p className="text-muted-foreground text-xs">by you</p>
                        </div>
                        <span className="text-muted-foreground text-xs">Yesterday</span>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="border border-destructive/50 rounded-lg p-6 bg-destructive/5">
                <h3 className="text-sm font-medium text-destructive mb-2">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Irreversible and destructive actions.
                </p>
                <DeleteProjectSection project={project} />
            </div>
        </div>
    );
}
