import { getProject } from '@/lib/actions/projects';
import { notFound } from 'next/navigation';
import { ProjectIconUpload } from '@/components/projects/project-icon-upload';

interface GeneralSettingsPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function GeneralSettingsPage({ params }: GeneralSettingsPageProps) {
    const { projectId } = await params;
    const project = await getProject(parseInt(projectId, 10));

    if (!project) notFound();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-lg font-semibold mb-1">General Settings</h2>
                <p className="text-sm text-muted-foreground">
                    Manage your project's general configuration.
                </p>
            </div>

            {/* Project Icon Section */}
            <div className="space-y-4">
                <div className="border rounded-lg p-6 bg-card">
                    <h3 className="text-sm font-medium mb-2">Project Icon</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Upload a custom icon for your project. This will be displayed in the dashboard and project list.
                    </p>
                </div>
                giiii
                <ProjectIconUpload project={project} />

                {/* Project Name Section */}
                <div className="border rounded-lg p-6 bg-card">
                    <h3 className="text-sm font-medium mb-2">Project Name</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        The name of your project as it appears throughout the platform.
                    </p>
                    <div className="flex items-center gap-4">
                        <input
                            type="text"
                            defaultValue={project.name}
                            className="flex-1 px-3 py-2 text-sm border rounded-md bg-background"
                            placeholder="Project name"
                        />
                        <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                            Save
                        </button>
                    </div>
                </div>

                {/* Project Description Section */}
                <div className="border rounded-lg p-6 bg-card">
                    <h3 className="text-sm font-medium mb-2">Project Description</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        A brief description of your project.
                    </p>
                    <div className="space-y-4">
                        <textarea
                            defaultValue={project.description || ''}
                            className="w-full px-3 py-2 text-sm border rounded-md bg-background min-h-[100px] resize-none"
                            placeholder="Add a description for your project..."
                        />
                        <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

