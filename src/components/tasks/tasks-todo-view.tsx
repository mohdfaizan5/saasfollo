'use client';

import { useState } from 'react';
import { Check, Plus, Circle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus, TaskCategory } from '@/lib/types/database';

interface TasksTodoViewProps {
    tasks: Record<TaskStatus, Task[]>;
    canEdit: boolean;
    onStatusChange: (taskId: number, oldStatus: TaskStatus, newStatus: TaskStatus) => void;
    onDelete: (taskId: number, status: TaskStatus) => void;
    onQuickCreate: (title: string, status: TaskStatus) => void;
}

// Map Kanban statuses to To-Do sections
const SECTION_MAP: { todoStatus: TaskStatus; label: string; color: string }[] = [
    { todoStatus: 'now', label: 'Todo', color: 'text-orange-500' },
    { todoStatus: 'next', label: 'In Progress', color: 'text-blue-500' },
    { todoStatus: 'done', label: 'Done', color: 'text-green-500' },
];

const CATEGORY_COLORS: Record<string, string> = {
    website: 'bg-purple-100 text-purple-700',
    marketing: 'bg-pink-100 text-pink-700',
    seo: 'bg-yellow-100 text-yellow-700',
    content: 'bg-cyan-100 text-cyan-700',
};

export function TasksTodoView({
    tasks,
    canEdit,
    onStatusChange,
    onDelete,
    onQuickCreate,
}: TasksTodoViewProps) {
    const [newTaskInputs, setNewTaskInputs] = useState<Record<TaskStatus, string>>({
        now: '',
        next: '',
        later: '',
        done: '',
    });
    const [expandedSections, setExpandedSections] = useState<Record<TaskStatus, boolean>>({
        now: true,
        next: true,
        later: true,
        done: true,
    });

    const handleQuickCreate = (status: TaskStatus) => {
        const title = newTaskInputs[status].trim();
        if (title) {
            onQuickCreate(title, status);
            setNewTaskInputs((prev) => ({ ...prev, [status]: '' }));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, status: TaskStatus) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleQuickCreate(status);
        }
    };

    const toggleComplete = (task: Task) => {
        if (task.status === 'done') {
            // Move back to "now" (Todo)
            onStatusChange(task.id, 'done', 'now');
        } else {
            // Mark as done
            onStatusChange(task.id, task.status, 'done');
        }
    };

    // Combine 'now' and 'later' into Todo section for display
    const getTodoSectionTasks = (status: TaskStatus): Task[] => {
        if (status === 'now') {
            return [...tasks.now, ...tasks.later];
        }
        return tasks[status];
    };

    return (
        <div className="space-y-6">
            {SECTION_MAP.map(({ todoStatus, label, color }) => {
                const sectionTasks = getTodoSectionTasks(todoStatus);
                const isExpanded = expandedSections[todoStatus];

                return (
                    <div key={todoStatus} className="space-y-2">
                        {/* Section Header */}
                        <div
                            className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-md p-2 -mx-2"
                            onClick={() =>
                                setExpandedSections((prev) => ({
                                    ...prev,
                                    [todoStatus]: !prev[todoStatus],
                                }))
                            }
                        >
                            <div className="flex items-center gap-2">
                                <span className={cn('font-semibold', color)}>{label}</span>
                                <Badge variant="secondary" className="text-xs">
                                    {sectionTasks.length}
                                </Badge>
                            </div>
                        </div>

                        {/* Task List */}
                        {isExpanded && (
                            <div className="space-y-1 pl-2">
                                {sectionTasks.map((task) => (
                                    <div
                                        key={task.id}
                                        className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 group"
                                    >
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => canEdit && toggleComplete(task)}
                                            disabled={!canEdit}
                                            className={cn(
                                                'mt-0.5 shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                                                task.status === 'done'
                                                    ? 'bg-green-500 border-green-500 text-white'
                                                    : 'border-muted-foreground/30 hover:border-green-500'
                                            )}
                                        >
                                            {task.status === 'done' && <Check className="h-3 w-3" />}
                                        </button>

                                        {/* Task Content */}
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={cn(
                                                    'text-sm',
                                                    task.status === 'done' && 'line-through text-muted-foreground'
                                                )}
                                            >
                                                {task.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                {task.category && (
                                                    <Badge
                                                        variant="secondary"
                                                        className={cn('text-xs', CATEGORY_COLORS[task.category])}
                                                    >
                                                        {task.category}
                                                    </Badge>
                                                )}
                                                {task.priority && (
                                                    <Badge
                                                        variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                                                        className="text-xs"
                                                    >
                                                        {task.priority}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Quick Add */}
                                {canEdit && todoStatus !== 'done' && (
                                    <div className="flex items-center gap-2 pl-2 pt-1">
                                        <Circle className="h-4 w-4 text-muted-foreground/30" />
                                        <Input
                                            placeholder="Add a task..."
                                            value={newTaskInputs[todoStatus]}
                                            onChange={(e) =>
                                                setNewTaskInputs((prev) => ({
                                                    ...prev,
                                                    [todoStatus]: e.target.value,
                                                }))
                                            }
                                            onKeyDown={(e) => handleKeyDown(e, todoStatus)}
                                            className="h-8 border-none bg-transparent focus-visible:ring-0 shadow-none placeholder:text-muted-foreground/50"
                                        />
                                        {newTaskInputs[todoStatus] && (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleQuickCreate(todoStatus)}
                                                className="h-7 px-2"
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {sectionTasks.length === 0 && (
                                    <p className="text-sm text-muted-foreground pl-7 py-2">No tasks</p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
