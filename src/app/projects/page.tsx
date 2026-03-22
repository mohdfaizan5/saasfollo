import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/server';
import { getProjects } from '@/lib/actions/projects';
import { ProjectCard, ProjectsHeader } from '@/components/projects';

export const metadata = {
    title: 'Projects | SaaSFollo',
};
import {
    BoxIcon,
    HouseIcon,
    PanelsTopLeftIcon,
} from "lucide-react";

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
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

    const allProjects = projects.filter((project) => !project.is_archived);
    const pinnedProjects = projects.filter(
        (project) => project.is_pinned && !project.is_archived,
    );
    const archivedProjects = projects.filter((project) => project.is_archived);

    const renderProjectGrid = (filteredProjects: typeof projects, emptyState: { title: string; description: string }) => {
        if (filteredProjects.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
                    <div className="p-4 rounded-full bg-muted mb-4">
                        <FolderKanban className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-semibold mb-2">{emptyState.title}</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        {emptyState.description}
                    </p>
                    <Link href="/projects/new">
                        <Button>New Project</Button>
                    </Link>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background">
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
                
                <Tabs defaultValue="all" className="space-y-6">
                    <ScrollArea>
                        <TabsList className="mb-3 h-auto gap-2 rounded-none border-b bg-transparent px-0 py-1 text-foreground">
                            <TabsTrigger
                                className="after:-mb-1 relative after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:hover:bg-accent data-[state=active]:after:bg-primary"
                                value="all"
                            >
                                <HouseIcon
                                    aria-hidden="true"
                                    className="-ms-0.5 me-1.5 opacity-60"
                                    size={16}
                                />
                                All
                            </TabsTrigger>
                            <TabsTrigger
                                className="after:-mb-1 relative after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:hover:bg-accent data-[state=active]:after:bg-primary"
                                value="pinned"
                            >
                                <PanelsTopLeftIcon
                                    aria-hidden="true"
                                    className="-ms-0.5 me-1.5 opacity-60"
                                    size={16}
                                />
                                Pinned
                                {/* <Badge
                                    className="ms-1.5 min-w-5 bg-primary/15 px-1"
                                    variant="secondary"
                                >
                                    3
                                </Badge> */}
                            </TabsTrigger>
                            <TabsTrigger
                                className="after:-mb-1 relative after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 hover:bg-accent hover:text-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:hover:bg-accent data-[state=active]:after:bg-primary"
                                value="archived"
                            >
                                <BoxIcon
                                    aria-hidden="true"
                                    className="-ms-0.5 me-1.5 opacity-60"
                                    size={16}
                                />
                                Archived
                                {/* <Badge className="ms-1.5">New</Badge> */}
                            </TabsTrigger>
                        </TabsList>
                        <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                    <TabsContent value="all" className="mt-0">
                        {renderProjectGrid(allProjects, {
                            title: 'No active projects yet',
                            description: 'Create a project to start organizing your work, or unarchive one to bring it back into the main list.',
                        })}
                    </TabsContent>
                    <TabsContent value="pinned" className="mt-0">
                        {renderProjectGrid(pinnedProjects, {
                            title: 'No pinned projects yet',
                            description: 'Pin the projects you want quick access to, and they will show up here.',
                        })}
                    </TabsContent>
                    <TabsContent value="archived" className="mt-0">
                        {renderProjectGrid(archivedProjects, {
                            title: 'No archived projects',
                            description: 'Archived projects stay out of the main list until you decide to restore them.',
                        })}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
