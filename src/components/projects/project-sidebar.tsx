'use client';

import * as React from "react"
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Link2,
    Layers,
    CheckSquare,
    FileText,
    Lock,
    Settings
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import Logo from '@/components/logo';
import type { Project } from '@/lib/types/database';
import type { UserProjectRole } from '@/lib/actions/projects';

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType;
    hideForReader?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { href: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: 'tasks', label: 'Tasks', icon: CheckSquare },
    { href: 'versions', label: 'Versions', icon: Layers },
    { href: 'links', label: 'Links', icon: Link2 },
    { href: 'notes', label: 'Notes', icon: FileText },
    // { href: 'secrets', label: 'Secrets', icon: Lock, hideForReader: true },
];

interface ProjectSidebarProps {
    project: Project;
    userRole?: UserProjectRole;
}

export function ProjectSidebar({ project, userRole = 'owner' }: ProjectSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const baseUrl = `/projects/${project.id}`;
    const isReader = userRole === 'reader';
    const canManage = userRole === 'owner';

    const isActive = (href: string) => {
        const fullHref = `${baseUrl}/${href}`;
        if (href === 'dashboard') {
            return pathname === baseUrl || pathname === fullHref || pathname === `${fullHref}/`;
        }
        return pathname.startsWith(fullHref);
    };

    // Filter nav items based on role
    const filteredNavItems = NAV_ITEMS.filter(item => {
        if (item.hideForReader && isReader) return false;
        return true;
    });

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader className="border-b">
                {/* Logo + Slash + Project Name */}
                <div className="h-12 flex items-center  group-data-[collapsible=icon]:justify-center">
                    {/* Full expanded view */}
                    <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
                        <Logo full={false} width={28} height={28} href="/projects" />
                        <span className="text-muted-foreground text-lg">/</span>
                        <div className="flex items-center gap-2">
                            <div className="shrink-0 w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center overflow-hidden">
                                {project.icon_url ? (
                                    <img
                                        src={project.icon_url}
                                        alt={project.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-primary font-semibold text-xs">
                                        {project.name.charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <span className="text-sm font-medium truncate max-w-[120px]">{project.name}</span>
                        </div>
                    </div>
                    {/* Collapsed icon view */}
                    <div className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
                        <Logo full={false} width={28} height={28} href="/projects" />
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu className="mx-2 mt-2">
                    {filteredNavItems.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                isActive={isActive(item.href)}
                                tooltip={item.label}
                                onClick={() => router.push(`${baseUrl}/${item.href}`)}
                            >
                                <item.icon />
                                <span>{item.label}</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            {canManage && (
                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={pathname.startsWith(`${baseUrl}/settings`)}
                                tooltip="Settings"
                                onClick={() => router.push(`${baseUrl}/settings`)}
                            >
                                <Settings />
                                <span>Settings</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            )}
            <SidebarRail />
        </Sidebar>
    );
}
