import type { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/lib/server';
import { getProject, getUserProjectRole } from '@/lib/actions/projects';
import { ProjectSidebar } from '@/components/projects/project-sidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { UserProfileDropdown } from '@/components/user-profile-dropdown';
import { Separator } from '@/components/ui/separator';
import { ProjectRoleProvider } from '@/hooks/use-project-role';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';

interface ProjectLayoutProps {
    children: React.ReactNode;
    params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: ProjectLayoutProps): Promise<Metadata> {
    const { projectId } = await params;
    const project = await getProject(projectId);

    if (!project) {
        return {
            title: 'SaaSFollo',
        };
    }

    return {
        title: {
            template: `%s | ${project.name} | SaaSFollo`,
            default: `${project.name} | SaaSFollo`,
        },
    };
}

const roleColors: Record<string, string> = {
    owner: 'bg-purple-100 text-purple-700 border-purple-200',
    editor: 'bg-blue-100 text-blue-700 border-blue-200',
    reader: 'bg-gray-100 text-gray-700 border-gray-200',
};

const roleLabels: Record<string, string> = {
    owner: 'Owner',
    editor: 'Editor',
    reader: 'View Only',
};

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/auth/login');
    }

    // projectId from URL is now the nanoid string - no parseInt needed
    const { projectId } = await params;
    const [project, userRole] = await Promise.all([
        getProject(projectId),
        getUserProjectRole(projectId),
    ]);

    if (!project || !userRole) {
        notFound();
    }

    const isReader = userRole === 'reader';

    return (
        <ProjectRoleProvider role={userRole}>
            <SidebarProvider>
                <ProjectSidebar project={project} userRole={userRole} />
                <SidebarInset className="flex flex-col h-screen overflow-hidden bg-[#F6F6F6]">
                    {/* Read-only banner for readers */}
                    {isReader && (
                        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-sm">
                            <Eye className="h-4 w-4" />
                            <span>You have view-only access to this project</span>
                        </div>
                    )}
                    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background px-4">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <Separator orientation="vertical" className="mr-2 h-4" />
                            <span className="font-medium text-sm">{project.name}</span>
                            <Badge variant="outline" className={`text-xs ${roleColors[userRole]}`}>
                                {roleLabels[userRole]}
                            </Badge>
                        </div>
                        <UserProfileDropdown email={user.email!} />
                    </header>
                    <main className="flex-1 overflow-auto p-6">
                        {children}
                    </main>
                </SidebarInset>
            </SidebarProvider>
        </ProjectRoleProvider>
    );
}
