'use client';

import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import { updateTaskStatus } from '@/lib/actions/tasks';
import TasksKanbanColumn from './tasks-kanban-column';
import TasksKanbanCard from './tasks-kanban-card';
import type { Task, TaskStatus } from '@/lib/types/database';

interface TasksKanbanBoardProps {
    tasks: Record<TaskStatus, Task[]>;
    projectId: number;
    onStatusChange: (taskId: number, oldStatus: TaskStatus, newStatus: TaskStatus) => void;
    onTaskUpdate: (taskId: number, status: TaskStatus, updates: Partial<Task>) => void;
    onDelete: (taskId: number, status: TaskStatus) => void;
    onEditTask: (task: Task) => void;
}

const COLUMNS: TaskStatus[] = ['now', 'next', 'later', 'done'];

export default function TasksKanbanBoard({ tasks, projectId, onStatusChange, onTaskUpdate, onDelete, onEditTask }: TasksKanbanBoardProps) {
    const [activeTask, setActiveTask] = useState<Task | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const taskId = Number(active.id);
        // Find task across all statuses
        const task = Object.values(tasks).flat().find(t => t.id === taskId);
        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = Number(active.id);
        const overId = over.id; // Could be column ID (string) or task ID (number)

        // Find source task
        const sourceTask = Object.values(tasks).flat().find(t => t.id === activeId);
        if (!sourceTask) return;

        // Determine target status
        let targetStatus: TaskStatus | undefined;

        // If dropped directly on a column
        if (COLUMNS.includes(overId as TaskStatus)) {
            targetStatus = overId as TaskStatus;
        } else {
            // Dropped on another task? Find that task's status
            const overTask = Object.values(tasks).flat().find(t => t.id === Number(overId));
            if (overTask) {
                targetStatus = overTask.status;
            } else if (COLUMNS.includes(overId as TaskStatus)) {
                // Fallback if overId matches a column name but wasn't caught above (e.g. types)
                targetStatus = overId as TaskStatus;
            }
        }

        if (targetStatus && targetStatus !== sourceTask.status) {
            onStatusChange(activeId, sourceTask.status, targetStatus);
        }
    };

    return (
        <div className="h-[calc(100vh-280px)] min-h-[500px]">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="overflow-x-auto h-full pb-4 -mx-6 px-6">
                    <div className="flex gap-4 min-w-max h-full">
                        {COLUMNS.map((column) => (
                            <TasksKanbanColumn
                                key={column}
                                column={column}
                                tasks={tasks[column]}
                                onTaskUpdate={onTaskUpdate}
                                onDelete={onDelete}
                                onEdit={onEditTask}
                            />
                        ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeTask ? (
                        <div className="opacity-90 rotate-2 w-72">
                            <TasksKanbanCard
                                task={activeTask}
                                onUpdate={() => { }}
                                onDelete={() => { }}
                                onEdit={() => { }}
                                isDragging
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
