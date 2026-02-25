'use client';

import * as React from "react"
import { usePathname, useRouter } from 'next/navigation';
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
import {
    SquaresFourIcon,
    CheckSquareIcon,
    TrendUpIcon,
    CubeIcon,
    LinkIcon,
    FileTextIcon,
    BrainIcon,
    GearIcon
} from '@phosphor-icons/react';

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<any>;
    hideForReader?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { href: 'dashboard', label: 'Dashboard', icon: SquaresFourIcon },
    // NOTE: Changed from 'tasks' to 'build' for frontend nomenclature while backend remains unchanged
    // The href is now 'build' but the underlying backend calls still use the original 'tasks' logic
    { href: 'build', label: 'Build', icon: CheckSquareIcon },
    { href: 'growth', label: 'Growth', icon: TrendUpIcon },
    { href: 'versions', label: 'Versions', icon: CubeIcon },
    { href: 'aicofounder', label: 'AI Cofounder', icon: BrainIcon },
    { href: 'links', label: 'Links', icon: LinkIcon },
    { href: 'notes', label: 'Notes', icon: FileTextIcon },
    // { href: 'secrets', label: 'Secrets', icon: Lock, hideForReader: true },
];

interface ProjectSidebarProps {
    project: Project;
    userRole?: UserProjectRole;
}

export function ProjectSidebar({ project, userRole = 'owner' }: ProjectSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const baseUrl = `/projects/${project.nanoid}`;
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
                                <item.icon size={56} weight="duotone"  />
                                <span className="inline-flex items-center gap-2">
                                    <span>{item.label}</span>
                                    {item.href === 'aicofounder' && (
                                        <span className="rounded-full border border-amber-300 bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-700">
                                            Beta
                                        </span>
                                    )}
                                </span>
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
                                <GearIcon weight="duotone" />
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
