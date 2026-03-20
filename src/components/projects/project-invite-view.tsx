'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { acceptInvitation, declineInvitation } from '@/lib/actions/collaborators';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProjectInviteViewProps {
    invitationNanoid: string;
    projectId: string;
    projectName: string;
    role: string;
}

export function ProjectInviteView({
    invitationNanoid,
    projectId,
    projectName,
    role,
}: ProjectInviteViewProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleAccept = () => {
        startTransition(async () => {
            try {
                await acceptInvitation(invitationNanoid);
                toast.success(`You joined ${projectName}`);
                router.push(`/projects/${projectId}/dashboard`);
                router.refresh();
            } catch {
                toast.error('Failed to accept invitation');
            }
        });
    };

    const handleDecline = () => {
        startTransition(async () => {
            try {
                await declineInvitation(invitationNanoid);
                toast.success('Invitation declined');
                router.push('/projects');
                router.refresh();
            } catch {
                toast.error('Failed to decline invitation');
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#F6F6F6] px-4 py-10">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-xl items-center justify-center">
                <div className="w-full rounded-3xl border bg-background p-8 shadow-sm">
                    <div className="space-y-4 text-center">
                        <Badge variant="destructive" className="mx-auto capitalize">
                            {role}
                        </Badge>
                        <div className="space-y-2">
                            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                Project invite
                            </p>
                            <h1 className="text-3xl font-semibold tracking-tight text-balance">
                                Join <strong>{projectName}</strong>
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                You&apos;ve been invited to collaborate on <strong>{projectName}</strong> as an{' '}
                                <strong className="capitalize">{role}</strong>.
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button
                            variant="destructive"
                            className="flex-1"
                            disabled={isPending}
                            onClick={handleAccept}
                        >
                            <Check className="mr-2 h-4 w-4" />
                            Accept invite
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            disabled={isPending}
                            onClick={handleDecline}
                        >
                            <X className="mr-2 h-4 w-4" />
                            Decline
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
