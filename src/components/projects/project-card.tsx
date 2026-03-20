'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Pin, PinOff, MoreVertical, Trash2, Pencil, Layers, CheckSquare, CircleAlertIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toggleProjectPin, deleteProject } from '@/lib/actions/projects';
import type { ProjectWithStats } from '@/lib/types/database';
import { SegmentedProgress } from '../ui/progress-bar';
import { CheckCircleIcon, GitBranchIcon } from '@phosphor-icons/react/dist/ssr';

interface ProjectCardProps {
    project: ProjectWithStats;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteInputValue, setDeleteInputValue] = useState('');
    const [hasCheckedRisk, setHasCheckedRisk] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

    useEffect(() => {
        if (countdown === null) return;

        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(c => c! - 1), 1000);
            return () => clearTimeout(timer);
        } else if (countdown === 0) {
            executeDelete();
        }
    }, [countdown]);

    const handleCardClick = () => {
        router.push(`/projects/${project.nanoid}/dashboard`);
    };

    const handlePinToggle = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsLoading(true);
        try {
            await toggleProjectPin(project.nanoid);
        } catch (error) {
            console.error('Failed to toggle pin:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartDelete = () => {
        setCountdown(3);
    };

    const executeDelete = async () => {
        setCountdown(null);
        setIsLoading(true);
        try {
            await deleteProject(project.nanoid);
            setIsDeleteDialogOpen(false);
        } catch (error) {
            console.error('Failed to delete project:', error);
            setIsLoading(false);
        }
    };

    const cancelDelete = () => {
        setCountdown(null);
        setIsDeleteDialogOpen(false);
        setDeleteInputValue('');
        setHasCheckedRisk(false);
    };

    const progressValue = project.progress_percentage ?? 0;
    const progressLabel = project.progress_label ?? `${project.completed_task_count ?? 0}/${project.task_count ?? 0} completed`;
    const collaboratorEmails = project.collaborator_emails ?? [];

    const getProgressColor = (value: number): string | null => {
        if (value < 50) return null;

        if (value >= 75) {
            const alpha = 0.7 + ((value - 75) / 25) * 0.3;
            return `rgb(34 211 101 / ${alpha.toFixed(3)})`;
        }

        const alpha = 0.7 + ((value - 50) / 25) * 0.3;
        return `rgb(244 76 1 / ${alpha.toFixed(3)})`;
    };

    const progressColor = getProgressColor(progressValue);

    const iconPool = [CheckCircleIcon, GitBranchIcon] as const;

    const hashString = (input: string): number => {
        let hash = 0;
        for (let index = 0; index < input.length; index += 1) {
            hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
        }
        return hash;
    };

    const ActiveVersionIcon = useMemo(() => {
        const seed = `${project.nanoid}|${project.active_version?.id ?? 'no-version'}|active`;
        return iconPool[hashString(seed) % iconPool.length];
    }, [project.nanoid, project.active_version?.id]);

    const TaskCountIcon = useMemo(() => {
        const seed = `${project.nanoid}|${project.task_count ?? 0}|tasks`;
        return iconPool[hashString(seed) % iconPool.length];
    }, [project.nanoid, project.task_count]);

    const getInitialsFromEmail = (email: string) => {
        const localPart = email.split('@')[0] ?? '';
        const compact = localPart.replace(/[^a-zA-Z0-9]/g, '');
        return (compact.slice(0, 2) || 'U').toUpperCase();
    };

    console.log("ProjectCard render:", project);
    // const activeVersionName = await supab

    return (
        <>
            <Card
                className="group relative justify-between bg-primary/5 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 p-5"
                onClick={handleCardClick}
            >
                {/* Pin indicator */}
                {project.is_pinned && (
                    <div className="absolute top-3 right-3">
                        <Pin className="h-4 w-4 text-primary fill-primary" />
                    </div>
                )}

                {/* Project name and description */}
                <div className="mb-4 pr-8 flex items-start gap-3">
                    {/* Project Icon */}
                    <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                        {project.icon_url ? (
                            <img
                                src={project.icon_url}
                                alt={project.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <span className="text-primary font-semibold text-lg">
                                {project.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-lg truncate">{project.name}</h3>
                        {project.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {project.description}
                            </p>
                        )}
                    </div>
                </div>

                <section>{/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {/* Active version badge */}
                        {project.active_version && (
                            <div className="">
                                <Badge variant="default" className="text-xs">
                                    <ActiveVersionIcon size={24} weight="duotone" />

                                    Active: {project.active_version.name}
                                </Badge>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            {/* <CheckSquare className="h-4 w-4" /> */}
                            {/* <CheckCircleIcon size={24} weight="duotone" /> */}


                            <span>{project.task_count ?? 0} tasks</span>
                        </div>
                        {/* <div className="-space-x-[0.45rem] flex">
                        <img
                            alt="Avatar 01"
                            className="rounded-full ring-2 ring-background"
                            height={24}
                            src="https://avatars.githubusercontent.com/u/79694828?v=4"
                            width={24}
                        />
                        <img
                            alt="Avatar 02"
                            className="rounded-full ring-2 ring-background"
                            height={24}
                            src="https://avatars.githubusercontent.com/u/79694828?v=4"
                            width={24}
                        />
                        <img
                            alt="Avatar 03"
                            className="rounded-full ring-2 ring-background"
                            height={24}
                            src="https://avatars.githubusercontent.com/u/79694828?v=4"
                            width={24}
                        />
                        <img
                            alt="Avatar 04"
                            className="rounded-full ring-2 ring-background"
                            height={24}
                            src="https://avatars.githubusercontent.com/u/79694828?v=4"
                            width={24}
                        />
                        <Button
                            className="flex size-10 items-center justify-center rounded-full bg-secondary text-muted-foreground text-xs ring-2 ring-background hover:bg-secondary hover:text-foreground"
                            size="icon"
                            variant="secondary"
                        >
                            +3
                        </Button>
                    </div> */}
                        <div className="-space-x-[0.45rem] flex">
                            {collaboratorEmails.slice(0, 2).map((email) => (
                                <div
                                    key={email}
                                    className="flex size-6 items-center justify-center rounded-full ring-1 ring-background bg-secondary text-[10px] font-semibold text-muted-foreground"
                                    title={email}
                                >
                                    {getInitialsFromEmail(email)}
                                </div>
                            ))}
                            {collaboratorEmails.length > 2 && (
                                <Button
                                    className="flex size-6 items-center justify-center rounded-full bg-secondary text-muted-foreground text-xs ring-2 ring-background hover:bg-secondary hover:text-foreground"
                                    size="icon"
                                    variant="secondary"
                                >
                                    +{collaboratorEmails.length - 2}
                                </Button>
                            )}
                        </div>
                    </div>


                    <div className="-space-y-3 w-full max-w-md">
                        <p className='text-end text-xs text-muted-foreground'>
                            {progressLabel} · {progressValue.toFixed(0)}%

                        </p>
                        <SegmentedProgress innerClassName='flex-'
                            // label='Version progress'
                            showPercentage={false}
                            value={progressValue}
                            color={progressColor ?? undefined}
                            showDemo={false} />
                    </div>
                </section>

                {/* Actions (visible on hover) */}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={handlePinToggle}
                        disabled={isLoading}
                    >
                        {project.is_pinned ? (
                            <PinOff className="h-4 w-4" />
                        ) : (
                            <Pin className="h-4 w-4" />
                        )}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={<Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()} />}
                        >
                            <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className={"w-full max-w-40"} align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem onClick={() => router.push(`/projects/${project.nanoid}/dashboard`)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Open Project
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Project
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </Card>

            <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => { if (!open) cancelDelete(); else setIsDeleteDialogOpen(true); }}>
                <DialogContent>
                    <div className="flex flex-col items-center gap-2">
                        <div
                            aria-hidden="true"
                            className="flex size-9 shrink-0 items-center justify-center rounded-full border"
                        >
                            <CircleAlertIcon className="opacity-80 text-destructive" size={16} />
                        </div>
                        <DialogHeader>
                            <DialogTitle className="sm:text-center">
                                Final confirmation
                            </DialogTitle>
                            <DialogDescription className="sm:text-center">
                                This action cannot be undone. To confirm, please type the project name <span className="text-foreground font-semibold px-1">{project.name}</span>.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                        <div className="*:not-first:mt-2">
                            <Label htmlFor="delete-input">Project name</Label>
                            <Input
                                id="delete-input"
                                onChange={(e) => setDeleteInputValue(e.target.value)}
                                placeholder={`Type ${project.name} to confirm`}
                                type="text"
                                value={deleteInputValue}
                                disabled={countdown !== null || isLoading}
                            />
                        </div>
                        <div className="flex items-center space-x-2 mt-4">
                            <Checkbox className={"border-primary"} id="terms" checked={hasCheckedRisk} onCheckedChange={(checked) => setHasCheckedRisk(checked === true)} disabled={countdown !== null || isLoading} />
                            <Label
                                htmlFor="terms"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                I understand that I cannot recover my data again
                            </Label>
                        </div>
                        <DialogFooter>
                            <Button className="flex-1" type="button" variant="outline" onClick={cancelDelete} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                disabled={deleteInputValue !== project.name || !hasCheckedRisk || countdown !== null || isLoading}
                                type="button"
                                variant="destructive"
                                onClick={handleStartDelete}
                            >
                                {countdown !== null ? `Deleting in ${countdown}...` : isLoading ? "Deleting..." : "Delete"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
