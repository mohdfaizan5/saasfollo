'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pin, PinOff, MoreVertical, Trash2, Pencil, Layers, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { toggleProjectPin, deleteProject } from '@/lib/actions/projects';
import type { ProjectWithStats } from '@/lib/types/database';

interface ProjectCardProps {
    project: ProjectWithStats;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

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

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            return;
        }
        setIsLoading(true);
        try {
            await deleteProject(project.nanoid);
        } catch (error) {
            console.error('Failed to delete project:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card
            className="group relative cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 p-5"
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
                <div className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4" />
                    <span>{project.version_count ?? 0} versions</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <CheckSquare className="h-4 w-4" />
                    <span>{project.task_count ?? 0} tasks</span>
                </div>
            </div>

            {/* Active version badge */}
            {project.active_version && (
                <div className="mt-3">
                    <Badge variant="secondary" className="text-xs">
                        Active: {project.active_version.name}
                    </Badge>
                </div>
            )}

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
                        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </Card>
    );
}
