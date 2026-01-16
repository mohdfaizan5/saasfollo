'use client';

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut } from 'lucide-react';
import { createClient } from '@/lib/client';
import { useRouter } from 'next/navigation';

interface UserProfileDropdownProps {
    email: string;
}

export function UserProfileDropdown({ email }: UserProfileDropdownProps) {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/auth/login');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger nativeButton={false} render={<div className="outline-none cursor-pointer rounded-full" />}>
                <Avatar className="h-9 w-9 border hover:opacity-80 transition-opacity">
                    <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${email}`} />
                    <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuLabel className="font-normal text-xs text-muted-foreground pt-0 truncate">
                        {email}
                    </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
