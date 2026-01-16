'use client';

import Link from 'next/link';
import { HelpCircle, Search } from 'lucide-react';
import Logo from '@/components/logo';
import { UserProfileDropdown } from '@/components/user-profile-dropdown';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ProjectsHeaderProps {
    userEmail: string;
}

export function ProjectsHeader({ userEmail }: ProjectsHeaderProps) {
    return (
        <header className="h-12 bg-[#1a1a1a] border-b border-[#2a2a2a] flex items-center justify-between px-4">
            {/* Left side - Logo and Projects */}
            <div className="flex items-center gap-2">
                <Logo full={false} width={24} height={24} href="/projects" />
                <span className="text-[#666] text-lg">/</span>
                <span className="text-white text-sm font-medium">Projects</span>
            </div>

            {/* Right side - Feedback, Search, Help, User */}
            <div className="flex items-center gap-4">
                {/* Feedback Link */}
                <Link
                    href="#"
                    className="text-[#4ade80] hover:text-[#22c55e] text-sm font-medium transition-colors"
                >
                    Feedback
                </Link>

                {/* Search */}
                <Tooltip>
                    <TooltipTrigger
                        className="flex items-center gap-2 text-[#666] hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-[#2a2a2a]"
                    >
                        <Search className="h-4 w-4" />
                        <span className="text-xs hidden sm:inline-flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-[#2a2a2a] rounded border border-[#3a3a3a]">⌘</kbd>
                            <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-[#2a2a2a] rounded border border-[#3a3a3a]">K</kbd>
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Search</p>
                    </TooltipContent>
                </Tooltip>

                {/* Help Icon */}
                <Tooltip>
                    <TooltipTrigger
                        className="text-[#666] hover:text-white transition-colors p-1.5 rounded-md hover:bg-[#2a2a2a]"
                    >
                        <HelpCircle className="h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Help</p>
                    </TooltipContent>
                </Tooltip>

                {/* User Profile */}
                <UserProfileDropdown email={userEmail} />
            </div>
        </header>
    );
}

