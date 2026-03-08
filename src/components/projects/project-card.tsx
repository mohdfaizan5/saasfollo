'use client';

import { useState, useEffect } from 'react';
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

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {/* Active version badge */}
                {project.active_version && (
                    <div className="">
                        <Badge variant="default" className="text-xs">
                            <Layers className="h-4 w-4" />

                            Active: {project.active_version.name}
                        </Badge>
                    </div>
                )}
                <div className="flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4" />
                    <span>{project.task_count ?? 0} tasks</span>
                </div>
            </div>



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
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
