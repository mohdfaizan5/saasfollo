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
    useSidebar,
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
import { FeedbackModal } from '@/components/feedback-modal';

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
    { href: 'version/roadmap', label: 'Roadmaps', icon: FileTextIcon },
    { href: 'aicofounder', label: 'AI Cofounder', icon: BrainIcon },
    { href: 'links', label: 'Links', icon: LinkIcon },
    { href: 'notes', label: 'Notes', icon: FileTextIcon },
    // { href: 'secrets', label: 'Secrets', icon: Lock, hideForReader: true },
];

interface ProjectSidebarProps {
    project: Project;
    userRole?: UserProjectRole;
    userEmail?: string;
}

export function ProjectSidebar({ project, userRole = 'owner', userEmail = '' }: ProjectSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { isMobile, setOpenMobile } = useSidebar();
    const [feedbackOpen, setFeedbackOpen] = React.useState(false);
    const baseUrl = `/projects/${project.nanoid}`;
    const isReader = userRole === 'reader';
    const canManage = userRole === 'owner';

    // On mobile the sidebar is a slide-in Sheet; router.push alone navigates
    // but leaves the sheet open over the new page, so close it explicitly.
    const navigate = (href: string) => {
        router.push(href);
        if (isMobile) {
            setOpenMobile(false);
        }
    };

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
                            <span className="text-sm font-medium truncate max-w-30">{project.name}</span>
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
                                onClick={() => navigate(`${baseUrl}/${item.href}`)}
                            >
                                <item.icon size={56} weight="duotone" />
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
                    <div className="mx-2 p-3 rounded-xl bg-linear-to-br from-blue-500/90 to-blue-600/90 text-white group-data-[collapsible=icon]:hidden">
                        <p className="text-sm font-medium leading-snug">
                            We're actively building this tool!
                        </p>
                        <p className="text-xs text-white/80 mt-1">
                            Got feedback or questions? We'd love to hear from you.
                        </p>
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            <button
                                onClick={() => setFeedbackOpen(true)}
                                className="flex-1 col-span-2 px-3 py-1.5 text-xs font-medium bg-white text-blue-600 rounded-lg hover:bg-white/90 transition-colors"
                            >
                                Give Feedback
                            </button>
                            <button className="flex-1 px-3 py-1.5 text-xs font-medium bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
                                Learn More
                            </button>
                        </div>
                    </div>

                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={pathname.startsWith(`${baseUrl}/settings`)}
                                tooltip="Settings"
                                onClick={() => navigate(`${baseUrl}/settings`)}
                            >
                                <GearIcon weight="duotone" />
                                <span>Settings</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            )}
            <SidebarRail />
            <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} userEmail={userEmail} />
        </Sidebar>
    );
}
