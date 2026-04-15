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
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TasksKanbanColumn from './tasks-kanban-column';
import TasksKanbanCard from './tasks-kanban-card';
import type { KanbanColumn, Task, TaskStatus, Version } from '@/lib/types/database';

interface TasksKanbanBoardProps {
    tasks: Task[];
    columns: KanbanColumn[];
    canEdit: boolean;
    onCreateColumn: () => Promise<void>;
    onUpdateColumn: (columnNanoid: string, updates: Partial<KanbanColumn>) => Promise<void>;
    onDeleteColumn: (columnNanoid: string) => Promise<void>;
    onMoveColumnLeft: (columnNanoid: string) => Promise<void>;
    onMoveColumnRight: (columnNanoid: string) => Promise<void>;
    onCreateTaskInColumn: (columnNanoid: string, title: string, priority: string | null, category: string | null) => Promise<void>;
    onMoveTaskToColumn: (task: Task, column: KanbanColumn) => Promise<void>;
    onReorderTaskInColumn: (taskNanoid: string, overTaskNanoid: string, columnNanoid: string) => void;
    onTaskUpdate: (taskNanoid: string, status: TaskStatus, updates: Partial<Task>) => void;
    onDelete: (taskNanoid: string, status: TaskStatus) => void;
    onEditTask: (task: Task) => void;
    assigneeLabelById?: Record<string, string>;
    categoryOptions?: string[];
    onAddCategory?: (category: string) => void;
    versions?: Version[];
}

export default function TasksKanbanBoard({
    tasks,
    columns,
    canEdit,
    onCreateColumn,
    onUpdateColumn,
    onDeleteColumn,
    onMoveColumnLeft,
    onMoveColumnRight,
    onCreateTaskInColumn,
    onMoveTaskToColumn,
    onReorderTaskInColumn,
    onTaskUpdate,
    onDelete,
    onEditTask,
    assigneeLabelById,
    categoryOptions = [],
    onAddCategory,
    versions = [],
}: TasksKanbanBoardProps) {
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
        const taskId = String(active.id).replace('task:', '');
        const task = tasks.find(t => t.nanoid === taskId);
        if (task) {
            setActiveTask(task);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = String(active.id).replace('task:', '');
        const overId = String(over.id);

        const sourceTask = tasks.find(t => t.nanoid === activeId);
        if (!sourceTask) return;

        if (overId.startsWith('column:')) {
            const columnNanoid = overId.replace('column:', '');
            const targetColumn = columns.find((column) => column.nanoid === columnNanoid);
            if (targetColumn && sourceTask.kanban_column_nanoid !== targetColumn.nanoid) {
                await onMoveTaskToColumn(sourceTask, targetColumn);
            }
            return;
        }

        if (overId.startsWith('task:')) {
            const overTaskId = overId.replace('task:', '');
            const overTask = tasks.find((task) => task.nanoid === overTaskId);
            if (overTask) {
                if (overTask.nanoid === sourceTask.nanoid) return;

                const targetColumn = columns.find((column) => column.nanoid === overTask.kanban_column_nanoid);
                if (!targetColumn) return;

                if (sourceTask.kanban_column_nanoid === targetColumn.nanoid) {
                    onReorderTaskInColumn(sourceTask.nanoid, overTask.nanoid, targetColumn.nanoid);
                    return;
                }

                await onMoveTaskToColumn(sourceTask, targetColumn);
            }
        }
    };

    return (
        <div className="h-[calc(100vh-280px)] min-h-125">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="overflow-x-auto h-full pb-4 -mx-6 px-6">
                    <div className="flex gap-4 min-w-max h-full">
                        {columns.map((column, columnIndex) => {
                            const canMoveLeft = columnIndex > 0;
                            const canMoveRight = columnIndex < columns.length - 1;

                            return (
                                <TasksKanbanColumn
                                    key={column.nanoid}
                                    column={column}
                                    tasks={tasks.filter((task) => task.kanban_column_nanoid === column.nanoid)}
                                    canEdit={canEdit}
                                    canMoveLeft={canMoveLeft}
                                    canMoveRight={canMoveRight}
                                    onUpdateColumn={onUpdateColumn}
                                    onDeleteColumn={onDeleteColumn}
                                    onMoveColumnLeft={onMoveColumnLeft}
                                    onMoveColumnRight={onMoveColumnRight}
                                    onCreateTask={(title, priority, category) => onCreateTaskInColumn(column.nanoid, title, priority, category)}
                                    onTaskUpdate={onTaskUpdate}
                                    onDelete={onDelete}
                                    onEdit={onEditTask}
                                    assigneeLabelById={assigneeLabelById}
                                    categoryOptions={categoryOptions}
                                    onAddCategory={onAddCategory}
                                    versions={versions}
                                />
                            );
                        })}

                        {canEdit && (
                            <div className="w-72 h-fit">
                                <Button variant="outline" className="w-full" onClick={onCreateColumn}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Column
                                </Button>
                            </div>
                        )}
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
                                assigneeLabel={activeTask.assignee ? assigneeLabelById?.[activeTask.assignee] : undefined}
                                versions={versions}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
