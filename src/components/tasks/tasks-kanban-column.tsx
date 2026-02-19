'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion } from 'motion/react';
import TasksKanbanCard from './tasks-kanban-card';
import type { Task, TaskStatus } from '@/lib/types/database';

import {
    Clock,
    ArrowRight,
    Archive,
    CheckCircle2,
} from 'lucide-react';

interface TasksKanbanColumnProps {
    column: TaskStatus;
    tasks: Task[];
    onTaskUpdate: (taskId: number, status: TaskStatus, updates: Partial<Task>) => void;
    onDelete: (taskId: number, status: TaskStatus) => void;
    onEdit: (task: Task) => void;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ReactNode; color: string }> = {
    now: { label: 'Now', icon: <Clock className="h-4 w-4" />, color: 'bg-orange-500/10 text-orange-500' },
    next: { label: 'Next', icon: <ArrowRight className="h-4 w-4" />, color: 'bg-blue-500/10 text-blue-500' },
    later: { label: 'Later', icon: <Archive className="h-4 w-4" />, color: 'bg-gray-500/10 text-gray-500' },
    done: { label: 'Done', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-green-500/10 text-green-500' },
};

export default function TasksKanbanColumn({ column, tasks, onTaskUpdate, onDelete, onEdit }: TasksKanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: column,
    });

    const statusInfo = STATUS_CONFIG[column];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "w-72 h-full rounded-2xl p-3 flex flex-col transition-colors border",
                isOver ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-[#101204] border-border'
            )}
        >
            {/* Column Header */}
            <div className="mb-3 px-1 flex items-center gap-2">
                <div className={cn("p-1.5 rounded-md", statusInfo.color)}>
                    {statusInfo.icon}
                </div>
                <div>
                    <h3 className="font-semibold text-base text-[#cecfd2]">{statusInfo.label}</h3>
                    <p className="text-xs text-muted-foreground">
                        {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                    </p>
                </div>
            </div>

            {/* Tasks - Droppable area */}
            <div
                ref={setNodeRef}
                className="min-h-[100px] flex-1 space-y-2 overflow-y-auto pr-1"
            >
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.length === 0 ? (
                        <div className={cn(
                            "text-center text-muted-foreground text-sm py-8 rounded-xl border-2 border-dashed transition-colors",
                            isOver ? 'border-primary/30 bg-primary/5' : 'border-transparent'
                        )}>
                            Drop tasks here
                        </div>
                    ) : (
                        tasks.map((task) => (
                                <TasksKanbanCard
                                    key={task.id}
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

// Helper utility for classnames since I missed importing it
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
