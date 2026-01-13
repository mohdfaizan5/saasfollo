'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Link2,
    Layers,
    CheckSquare,
    FileText,
    Lock,
    ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Project } from '@/lib/types/database';

const NAV_ITEMS = [
    { href: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: 'tasks', label: 'Tasks', icon: CheckSquare },
    { href: 'versions', label: 'Versions', icon: Layers },
    { href: 'links', label: 'Links', icon: Link2 },
    { href: 'notes', label: 'Notes', icon: FileText },
    { href: 'secrets', label: 'Secrets', icon: Lock },
];

interface ProjectSidebarProps {
    project: Project;
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
    const pathname = usePathname();
    const baseUrl = `/projects/${project.id}`;

    return (
        <aside className="w-64 border-r bg-card min-h-[calc(100vh-64px)] flex flex-col">
            {/* Back to projects */}
            <div className="p-4 border-b">
                <Link
                    href="/projects"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="h-4 w-4" />
                    All Projects
                </Link>
            </div>

            {/* Project name */}
            <div className="p-4 border-b">
                <h2 className="font-semibold truncate">{project.name}</h2>
                {project.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {project.description}
                    </p>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3">
                <ul className="space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const href = `${baseUrl}/${item.href}`;
                        const isActive = pathname === href ||
                            (item.href === 'dashboard' && pathname === baseUrl);

                        return (
                            <li key={item.href}>
                                <Link
                                    href={href}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}
