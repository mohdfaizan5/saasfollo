'use client';

import { useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, useReducedMotion } from 'motion/react';
import TasksKanbanCard from './tasks-kanban-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, MoreVertical, Plus, Trash2 } from 'lucide-react';
import type { KanbanColumn, Task, TaskStatus } from '@/lib/types/database';
import { cn } from '@/lib/utils';

interface TasksKanbanColumnProps {
    column: KanbanColumn;
    tasks: Task[];
    canEdit: boolean;
    canMoveLeft: boolean;
    canMoveRight: boolean;
    onUpdateColumn: (columnNanoid: string, updates: Partial<KanbanColumn>) => Promise<void>;
    onDeleteColumn: (columnNanoid: string) => Promise<void>;
    onMoveColumnLeft: (columnNanoid: string) => Promise<void>;
    onMoveColumnRight: (columnNanoid: string) => Promise<void>;
    onCreateTask: (title: string) => Promise<void>;
    onTaskUpdate: (taskNanoid: string, status: TaskStatus, updates: Partial<Task>) => void;
    onDelete: (taskNanoid: string, status: TaskStatus) => void;
    onEdit: (task: Task) => void;
}

export default function TasksKanbanColumn({
    column,
    tasks,
    canEdit,
    canMoveLeft,
    canMoveRight,
    onUpdateColumn,
    onDeleteColumn,
    onMoveColumnLeft,
    onMoveColumnRight,
    onCreateTask,
    onTaskUpdate,
    onDelete,
    onEdit,
}: TasksKanbanColumnProps) {
    const shouldReduceMotion = useReducedMotion();
    const { setNodeRef, isOver } = useDroppable({
        id: `column:${column.nanoid}`,
    });
    const [titleDraft, setTitleDraft] = useState(column.title);
    const [descriptionDraft, setDescriptionDraft] = useState(column.description ?? '');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        setTitleDraft(column.title);
        setDescriptionDraft(column.description ?? '');
    }, [column.nanoid, column.title, column.description]);

    const handleSaveColumnMeta = async () => {
        const nextTitle = titleDraft.trim();
        const nextDescription = descriptionDraft.trim() || null;

        if (!nextTitle || (nextTitle === column.title && nextDescription === column.description)) {
            setTitleDraft(column.title);
            setDescriptionDraft(column.description ?? '');
            return;
        }

        await onUpdateColumn(column.nanoid, {
            title: nextTitle,
            description: nextDescription,
        });
    };

    const handleCreateTask = async () => {
        const title = newTaskTitle.trim();
        if (!title) return;
        await onCreateTask(title);
        setNewTaskTitle('');
        setIsAddingTask(false);
    };

    return (
        <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            className={cn(
                "w-72 h-full rounded-2xl p-3 flex flex-col transition-colors border",
                isOver ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-[#101204] border-border'
            )}
        >
            {/* Column Header */}
            <div className="mb-3 pl-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <Input
                            value={titleDraft}
                            onChange={(event) => setTitleDraft(event.target.value)}
                            onBlur={handleSaveColumnMeta}
                            disabled={!canEdit}
                            className="h-8 bg-transparent border-none px-1 mb-0! text-[#cecfd2] text-lg! font-semibold shadow-none focus-visible:ring-1"
                        />
                        <Input
                            value={descriptionDraft}
                            onChange={(event) => setDescriptionDraft(event.target.value)}
                            onBlur={handleSaveColumnMeta}
                            disabled={!canEdit}
                            placeholder="Column description"
                            className="h-7 -mt-5 bg-transparent   border-none px-1 text-xs text-white/60 shadow-none focus-visible:ring-1"
                        />
                    </div>
                    {canEdit && (
                        <div className="flex items-center gap-1">
                            <Button variant="link" size="icon-sm" onClick={() => setIsAddingTask((prev) => !prev)}>
                                <Plus className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger render={<Button variant="link" size="icon-sm" />}>
                                    <MoreVertical className="h-4 w-4 text-white" />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem disabled={!canMoveLeft} onClick={() => void onMoveColumnLeft(column.nanoid)}>
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Move Left
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled={!canMoveRight} onClick={() => void onMoveColumnRight(column.nanoid)}>
                                        <ChevronRight className="h-4 w-4 mr-2" />
                                        Move Right
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        variant="destructive"
                                        disabled={tasks.length > 0}
                                        onClick={() => void onDeleteColumn(column.nanoid)}
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete Column
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                <div className="px-1 text-xs text-white/50">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                </div>

                {canEdit && isAddingTask && (
                    <div className="space-y-2 px-1">
                        <Input
                            value={newTaskTitle}
                            onChange={(event) => setNewTaskTitle(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    void handleCreateTask();
                                }
                            }}
                            placeholder="Add a task"
                            className="h-8"
                        />
                        <div className="flex gap-2">
                            <Button size="sm" onClick={() => void handleCreateTask()}>Add</Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsAddingTask(false)}>Cancel</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Tasks - Droppable area */}
            <div
                ref={setNodeRef}
                className="min-h-25 flex-1 space-y-2 overflow-y-auto pr-1"
            >
                <SortableContext items={tasks.map((task) => `task:${task.nanoid}`)} strategy={verticalListSortingStrategy}>
                    {tasks.length === 0 ? (
                        <div className={cn(
                            "text-center text-white/50 text-sm py-8 rounded-xl border-2 border-dashed transition-colors",
                            isOver ? 'border-primary/30 bg-primary/5' : 'border-transparent'
                        )}>
                            Drop tasks here
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <TasksKanbanCard
                                key={task.nanoid}
                                task={task}
                                onUpdate={onTaskUpdate}
                                onDelete={onDelete}
                                onEdit={onEdit}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </motion.div>
    );
}
