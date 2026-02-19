'use client';

import { useState, useTransition } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircle, Circle, Trash } from '@phosphor-icons/react';
import type { Task, TaskStatus } from '@/lib/types/database';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TasksKanbanCardProps {
    task: Task;
    onUpdate: (taskId: number, status: TaskStatus, updates: Partial<Task>) => void;
    onDelete: (taskId: number, status: TaskStatus) => void;
    onEdit: (task: Task) => void;
    isDragging?: boolean;
}

const PRIORITY_COLORS: Record<string, string> = {
    high: 'text-red-400 bg-red-400/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    low: 'text-blue-400 bg-blue-400/10',
};

export default function TasksKanbanCard({ task, onUpdate, onDelete, onEdit, isDragging }: TasksKanbanCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isPending, startTransition] = useTransition();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this task?')) {
            onDelete(task.id, task.status);
        }
    };

    const handleToggleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Toggle completion status
        const newIsCompleted = !task.is_completed;
        // If marking as complete, move to 'done' status
        // If marking as incomplete, move to 'now' status
        const newStatus = newIsCompleted ? 'done' : 'now';
        
        // Update both is_completed and status
        onUpdate(task.id, task.status, { 
            is_completed: newIsCompleted, 
            status: newStatus 
        });
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cn(
                "group relative p-3 rounded-xl bg-[#242528] transition-all cursor-grab active:cursor-grabbing border border-transparent hover:border-primary/20 hover:shadow-sm",
                isSortableDragging || isDragging ? 'opacity-50 shadow-lg ring-2 ring-primary/20' : '',
                task.is_completed ? 'opacity-60' : ''
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onEdit(task);
            }}
        >
            {/* Title & Checkbox */}
            <div className="flex gap-2 items-start mb-2">
                <div
                    className="mt-0.5 cursor-pointer text-muted-foreground hover:text-primary transition-colors"
                    onClick={handleToggleComplete}
                >
                    {task.is_completed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" weight="fill" />
                    ) : (
                        <Circle className="w-4 h-4" />
                    )}
                </div>

                <h4 className={cn(
                    "font-medium text-sm text-[#cecfd2] line-clamp-2 leading-tight select-none flex-1",
                    task.is_completed ? "line-through text-muted-foreground" : ""
                )}>
                    {task.title}
                </h4>

                {/* Delete button (Top Right, visible on hover) */}
                {isHovered && (
                    <button
                        onClick={handleDelete}
                        disabled={isPending}
                        className="text-muted-foreground hover:text-destructive transition-colors p-0.5 -mt-1 -mr-1"
                    >
                        <Trash className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            {/* Footer: Metadata */}
            <div className="flex items-center justify-between text-[10px] mt-2">
                <div className="flex flex-wrap gap-1">
                    {task.category && (
                        <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium capitalize select-none">
                            {task.category}
                        </span>
                    )}

                    {task.priority && (
                        <span className={cn(
                            "px-1.5 py-0.5 rounded font-medium capitalize select-none",
                            PRIORITY_COLORS[task.priority] || 'bg-secondary text-secondary-foreground'
                        )}>
                            {task.priority}
                        </span>
                    )}
                </div>

                {task.assignee && (
                    <div className="text-muted-foreground font-medium truncate max-w-[40%] text-right select-none ml-auto">
                        {/* We might want to show avatar or initials here later */}
                        {/* For now just a placeholder or icon could work if we had user details */}
                    </div>
                )}
            </div>
        </div>
    );
}
