'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { getPendingInvitations, declineInvitation, type PendingInvitation } from '@/lib/actions/collaborators';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export function NotificationsBell() {
    const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;
        getPendingInvitations().then(data => {
            if (mounted) setInvitations(data || []);
        });
        return () => { mounted = false; };
    }, []);

    const handleAccept = (projectNanoid?: string) => {
        if (!projectNanoid) {
            toast.error('Invite link is unavailable right now');
            return;
        }

        setOpen(false);
        router.push(`/projects/${projectNanoid}/invite`);
    };

    const handleDecline = async (nanoid: string) => {
        try {
            await declineInvitation(nanoid);
            toast.success('Invitation declined');
            setInvitations(prev => prev.filter(inv => inv.nanoid !== nanoid));
        } catch {
            toast.error('Failed to decline invitation');
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger className="relative text-[#666] hover:text-white transition-colors p-1.5 rounded-md hover:bg-[#2a2a2a]">
                <Bell className="h-4 w-4" />
                {invitations.length > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                )}
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                </div>
                <div className="max-h-75 overflow-y-auto">
                    {invitations.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground text-center">
                            No new notifications
                        </div>
                    ) : (
                        invitations.map((inv) => (
                            <div key={inv.nanoid} className="p-4 border-b last:border-0 hover:bg-muted/50 transition-colors">
                                <p className="text-sm mb-3">
                                    You&apos;ve been invited to join <strong className="font-semibold">{inv.projects?.name || 'this project'}</strong> as{' '}
                                    <Badge variant="destructive" className="text-xs ml-1 capitalize">{inv.role}</Badge>
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button size="sm" variant="default" onClick={() => handleAccept(inv.projects?.nanoid)} className="flex-1 col-span-2">
                                        <Check className="h-4 w-4 mr-1" /> Accept
                                    </Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleDecline(inv.nanoid)} className="flex-1 col-span-1">
                                        <X className="h-4 w-4 mr-1" /> Decline
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
