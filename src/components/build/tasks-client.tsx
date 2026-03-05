'use client';

import { useState, useMemo, useEffect } from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
// NOTE: The following imports from '@/lib/actions/tasks' remain unchanged as they are backend calls
// that use the original 'tasks' nomenclature. Only the frontend route and component names have changed to 'build'
import { createTask, deleteTask, updateTask } from '@/lib/actions/tasks';
import { createKanbanColumn, deleteKanbanColumn, updateKanbanColumn } from '@/lib/actions/kanban-columns';
import { useProjectRole } from '@/hooks/use-project-role';
// NOTE: The following imports are from the same './build' directory (renamed from './tasks')
import { TaskFilters } from './task-filters';
import { TaskProgressBar } from './task-progress-bar';
import { TaskViewToggle, type TaskView } from './task-view-toggle';
import { TasksTodoView } from './tasks-todo-view';
import TasksKanbanBoard from './tasks-kanban-board';
import { useQueryState } from 'nuqs';
import type { KanbanColumn, Task, TaskStatus, TaskCategory, Version, ProjectCollaborator } from '@/lib/types/database';

const DEFAULT_CATEGORIES = ['Website', 'Marketing', 'SEO', 'Content'];

interface TasksClientProps {
    initialTasks: Record<TaskStatus, Task[]>;
    initialColumns: KanbanColumn[];
    projectId: string;
    versions: Version[];
    collaborators?: ProjectCollaborator[];
    currentUserId?: string;
    initialView?: TaskView;
}

export function TasksClient({
    initialTasks,
    initialColumns,
    projectId,
    versions,
    collaborators = [],
    currentUserId = '',
    initialView = 'kanban'
}: TasksClientProps) {
    const { canEdit } = useProjectRole();
    const [tasks, setTasks] = useState<Record<TaskStatus, Task[]>>(initialTasks);
    const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
    const [categoryOptions, setCategoryOptions] = useState<string[]>(() => {
        const initialTaskCategories = Object.values(initialTasks)
            .flat()
            .map((task) => task.category)
            .filter((category): category is string => Boolean(category));

        let localCategories: string[] = [];
        if (typeof window !== 'undefined') {
            try {
                localCategories = JSON.parse(localStorage.getItem(`projectCategories-${projectId}`) || '[]');
            } catch (e) {
                // ignore
            }
        }

        return Array.from(new Set([...DEFAULT_CATEGORIES, ...initialTaskCategories, ...localCategories]));
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newStatus, setNewStatus] = useState<TaskStatus>('next');
    const [newColumnNanoid, setNewColumnNanoid] = useState<string>(initialColumns[0]?.nanoid ?? '');
    const [newVersionId, setNewVersionId] = useState<string>('');
    const [newPriority, setNewPriority] = useState<string>('');
    const [newCategory, setNewCategory] = useState<TaskCategory>(null);
    const [newAssignee, setNewAssignee] = useState<string>('');
    const [newFilterNameInput, setNewFilterNameInput] = useState('');
    const [newFilterValuesInput, setNewFilterValuesInput] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // View state from URL
    const [currentView, setCurrentView] = useState<TaskView>(initialView);

    // Filter state from URL using Nuqs
    const [selectedCategory] = useQueryState('category');
    const [selectedVersionId] = useQueryState('version');
    const [selectedAssignee] = useQueryState('assignee');

    const defaultVersionId = useMemo(() => {
        const queryVersion = selectedVersionId && versions.some((version) => version.id.toString() === selectedVersionId)
            ? selectedVersionId
            : null;
        const activeVersion = versions.find((version) => version.is_active)?.id?.toString() ?? null;
        const firstVersion = versions[0]?.id?.toString() ?? '';

        return queryVersion || activeVersion || firstVersion;
    }, [selectedVersionId, versions]);

    const getColumnLabel = (columnNanoid: string) => {
        const column = columns.find((item) => item.nanoid === columnNanoid);
        return column?.title ?? 'Select column';
    };

    const getVersionLabel = (versionId: string) => {
        const version = versions.find((item) => item.id.toString() === versionId);
        return version?.name ?? 'Select version';
    };

    const initializeCreateForm = () => {
        setNewStatus('next');
        setNewColumnNanoid((prev) => {
            if (prev && columns.some((column) => column.nanoid === prev)) return prev;
            return columns[0]?.nanoid ?? '';
        });
        setNewVersionId(defaultVersionId);
        setNewPriority('medium');
        setNewCategory(null);
        setNewAssignee('unassigned');
        setNewFilterNameInput('');
        setNewFilterValuesInput('');
    };

    useEffect(() => {
        if (!isDialogOpen) return;

        if (!newColumnNanoid || !columns.some((column) => column.nanoid === newColumnNanoid)) {
            setNewColumnNanoid(columns[0]?.nanoid ?? '');
        }

        if (!newVersionId && defaultVersionId) {
            setNewVersionId(defaultVersionId);
        }
    }, [isDialogOpen, columns, newColumnNanoid, newVersionId, defaultVersionId]);

    const addCategoryOption = (categoryName: string) => {
        const normalized = categoryName.trim();
        if (!normalized) return;
        setCategoryOptions((prev) => {
            if (prev.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
                return prev;
            }
            const updated = [...prev, normalized];
            if (typeof window !== 'undefined') {
                localStorage.setItem(`projectCategories-${projectId}`, JSON.stringify(updated));
            }
            return updated;
        });
    };

    // Filter tasks
    const filteredTasks = useMemo(() => {
        const filtered: Record<TaskStatus, Task[]> = {
            now: [],
            next: [],
            later: [],
            done: [],
        };

        Object.entries(tasks).forEach(([status, statusTasks]) => {
            filtered[status as TaskStatus] = statusTasks.filter((task) => {
                // Category filter
                if (selectedCategory && task.category !== selectedCategory) {
                    return false;
                }
                // Version filter
                if (selectedVersionId && task.version_id?.toString() !== selectedVersionId) {
                    return false;
                }
                // Assignee filter
                if (selectedAssignee) {
                    if (selectedAssignee === 'unassigned' && task.assignee) {
                        return false;
                    }
                    if (selectedAssignee !== 'unassigned' && task.assignee !== selectedAssignee) {
                        return false;
                    }
                }
                return true;
            });
        });

        return filtered;
    }, [tasks, selectedCategory, selectedVersionId, selectedAssignee]);

    // Get the selected category label for progress bar
    const selectedCategoryLabel = selectedCategory
        ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
        : undefined;

    // Calculate progress
    const filteredTaskList = Object.values(filteredTasks).flat();
    const totalTasks = filteredTaskList.length;
    const completedTasks = filteredTaskList.filter((task) => task.is_completed).length;

    const handleCreate = async () => {
        if (!newTitle.trim()) {
            setError('Task title is required');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const selectedColumn = columns.find((column) => column.nanoid === newColumnNanoid);
            const effectiveVersionId = newVersionId || defaultVersionId;
            const taskData = {
                title: newTitle.trim(),
                description: newDescription.trim() || null,
                status: selectedColumn?.is_done_column ? 'done' : newStatus,
                kanban_column_nanoid: selectedColumn?.nanoid ?? null,
                version_id: effectiveVersionId ? parseInt(effectiveVersionId, 10) : null,
                priority: newPriority === 'none' ? null : (newPriority as Task['priority']) || null,
                category: newCategory,
                assignee: newAssignee === 'unassigned' ? null : (newAssignee || null),
                is_completed: selectedColumn?.is_done_column ? true : newStatus === 'done',
            };

            const task = await createTask(projectId, taskData);
            const targetStatus = task.status as TaskStatus;
            setTasks((prev) => ({
                ...prev,
                [targetStatus]: [task, ...prev[targetStatus]],
            }));
            if (task.category) {
                addCategoryOption(task.category);
            }
            setIsDialogOpen(false);
            resetForm();
        } catch (err) {
            console.error('Failed to create task:', err);
            setError('Failed to create task. Please check your input and try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const resetForm = () => {
        setNewTitle('');
        setNewDescription('');
        initializeCreateForm();
    };

    const handleAddCategoryToOptions = () => {
        const normalized = prompt('New category name')?.trim() ?? '';
        if (!normalized) return;

        addCategoryOption(normalized);
        setNewCategory(normalized as TaskCategory);
    };

    const handleCreateFilterParameter = () => {
        const filterName = newFilterNameInput.trim();
        const rawValues = newFilterValuesInput
            .split(',')
            .map((value) => value.trim())
            .filter(Boolean);

        if (!filterName || rawValues.length === 0) {
            setError('Please provide a filter name and at least one value.');
            return;
        }

        const generatedCategories = rawValues.map((value) => `${filterName}: ${value}`);
        generatedCategories.forEach((item) => addCategoryOption(item));
        setNewCategory(generatedCategories[0] as TaskCategory);
        setNewFilterNameInput('');
        setNewFilterValuesInput('');
        setError(null);
    };

    const handleQuickCreate = async (
        title: string,
        status: TaskStatus,
        columnNanoid?: string,
        priority?: string | null,
        category?: string | null
    ) => {
        try {
            const fallbackVersion = versions.find((version) => version.is_active)?.id?.toString() ?? '';
            const effectiveVersionId = selectedVersionId || fallbackVersion;
            
            let finalCategory = selectedCategory || null;
            if (category && category !== 'none') {
                finalCategory = category;
            } else if (category === 'none') {
                finalCategory = null;
            }

            let finalPriority = null;
            if (priority && priority !== 'none') {
                finalPriority = priority;
            }

            const taskData = {
                title: title.trim(),
                status: status,
                kanban_column_nanoid: columnNanoid ?? null,
                version_id: effectiveVersionId ? parseInt(effectiveVersionId, 10) : null,
                category: finalCategory,
                priority: finalPriority as Task['priority'] | null,
                assignee: selectedAssignee === 'unassigned' ? null : (selectedAssignee || null),
                is_completed: status === 'done', // Set is_completed based on status
            };

            const task = await createTask(projectId, taskData);
            setTasks((prev) => ({
                ...prev,
                [status]: [task, ...prev[status]],
            }));
            if (task.category) {
                addCategoryOption(task.category);
            }
        } catch (err) {
            console.error('Failed to create task:', err);
        }
    };

    const handleStatusChange = async (taskNanoid: string, oldStatus: TaskStatus, newStatus: TaskStatus) => {
        try {
            const task = tasks[oldStatus].find((t) => t.nanoid === taskNanoid);
            if (!task) return;

            // Update the task status and is_completed field
            const updatedTask = await updateTask(taskNanoid, projectId, {
                status: newStatus,
                is_completed: newStatus === 'done'
            });

            setTasks((prev) => ({
                ...prev,
                [oldStatus]: prev[oldStatus].filter((t) => t.nanoid !== taskNanoid),
                [newStatus]: [{ ...task, status: newStatus, is_completed: newStatus === 'done' }, ...prev[newStatus]],
            }));
        } catch (err) {
            console.error('Failed to update task status:', err);
        }
    };

    const handleDelete = async (taskNanoid: string, status: TaskStatus) => {
        try {
            await deleteTask(taskNanoid, projectId);
            setTasks((prev) => ({
                ...prev,
                [status]: prev[status].filter((t) => t.nanoid !== taskNanoid),
            }));
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    };

    const handleTaskUpdate = async (taskNanoid: string, status: TaskStatus, updates: Partial<Task>) => {
        let previousTasksState: Record<TaskStatus, Task[]> | null = null;

        setTasks((prev) => {
            previousTasksState = prev;

            const newTasks: Record<TaskStatus, Task[]> = {
                now: [...prev.now],
                next: [...prev.next],
                later: [...prev.later],
                done: [...prev.done],
            };

            const taskIndex = newTasks[status].findIndex((task) => task.nanoid === taskNanoid);
            if (taskIndex === -1) return prev;

            const originalTask = newTasks[status][taskIndex];
            const nextStatus = (updates.status ?? status) as TaskStatus;
            const optimisticallyUpdatedTask = {
                ...originalTask,
                ...updates,
                status: nextStatus,
            };

            if (nextStatus !== status) {
                newTasks[status] = newTasks[status].filter((task) => task.nanoid !== taskNanoid);
                newTasks[nextStatus] = [optimisticallyUpdatedTask, ...newTasks[nextStatus]];
                return newTasks;
            }

            newTasks[status][taskIndex] = optimisticallyUpdatedTask;
            return newTasks;
        });

        try {
            if (!taskNanoid || !status) return;

            // Update the task on the server
            const updatedTask = await updateTask(taskNanoid, projectId, updates);

            setTasks((prev) => {
                const newTasks = { ...prev };
                const statusKeys: TaskStatus[] = ['now', 'next', 'later', 'done'];

                for (const key of statusKeys) {
                    const taskIndex = newTasks[key].findIndex((task) => task.nanoid === taskNanoid);
                    if (taskIndex !== -1) {
                        const nextStatus = (updatedTask.status ?? key) as TaskStatus;
                        const mergedTask = { ...newTasks[key][taskIndex], ...updatedTask, status: nextStatus };

                        if (nextStatus !== key) {
                            newTasks[key] = newTasks[key].filter((task) => task.nanoid !== taskNanoid);
                            newTasks[nextStatus] = [mergedTask, ...newTasks[nextStatus]];
                            return newTasks;
                        }

                        newTasks[key][taskIndex] = mergedTask;
                        return newTasks;
                    }
                }

                return prev;
            });
        } catch (err) {
            console.error('Failed to update task:', err);
            if (previousTasksState) {
                setTasks(previousTasksState);
            }
        }
    };

    const handleCreateColumn = async () => {
        try {
            const column = await createKanbanColumn(projectId, {
                title: `Column ${columns.length + 1}`,
                description: '',
            });
            setColumns((prev) => [...prev, column]);
            if (!newColumnNanoid) {
                setNewColumnNanoid(column.nanoid);
            }
        } catch (err) {
            console.error('Failed to create column:', err);
        }
    };

    const handleUpdateColumn = async (columnNanoid: string, updates: Partial<KanbanColumn>) => {
        try {
            const updated = await updateKanbanColumn(projectId, columnNanoid, updates);
            setColumns((prev) => prev.map((column) => (column.nanoid === updated.nanoid ? updated : column)));
        } catch (err) {
            console.error('Failed to update column:', err);
        }
    };

    const handleDeleteColumn = async (columnNanoid: string) => {
        try {
            await deleteKanbanColumn(projectId, columnNanoid);
            setColumns((prev) => prev.filter((column) => column.nanoid !== columnNanoid));
            if (newColumnNanoid === columnNanoid) {
                setNewColumnNanoid('');
            }
        } catch (err) {
            console.error('Failed to delete column:', err);
        }
    };

    const persistColumnOrder = async (orderedColumns: KanbanColumn[]) => {
        await Promise.all(
            orderedColumns.map((column, index) => updateKanbanColumn(projectId, column.nanoid, { position: index }))
        );
    };

    const handleMoveColumnLeft = async (columnNanoid: string) => {
        const currentIndex = columns.findIndex((column) => column.nanoid === columnNanoid);
        if (currentIndex <= 0) return;

        const reordered = [...columns];
        [reordered[currentIndex - 1], reordered[currentIndex]] = [reordered[currentIndex], reordered[currentIndex - 1]];
        const withPositions = reordered.map((column, index) => ({ ...column, position: index }));

        const previous = columns;
        setColumns(withPositions);

        try {
            await persistColumnOrder(withPositions);
        } catch (err) {
            console.error('Failed to move column left:', err);
            setColumns(previous);
        }
    };

    const handleMoveColumnRight = async (columnNanoid: string) => {
        const currentIndex = columns.findIndex((column) => column.nanoid === columnNanoid);
        if (currentIndex === -1 || currentIndex >= columns.length - 1) return;

        const reordered = [...columns];
        [reordered[currentIndex], reordered[currentIndex + 1]] = [reordered[currentIndex + 1], reordered[currentIndex]];
        const withPositions = reordered.map((column, index) => ({ ...column, position: index }));

        const previous = columns;
        setColumns(withPositions);

        try {
            await persistColumnOrder(withPositions);
        } catch (err) {
            console.error('Failed to move column right:', err);
            setColumns(previous);
        }
    };

    const handleCreateTaskInColumn = async (
        columnNanoid: string,
        title: string,
        priority?: string | null,
        category?: string | null
    ) => {
        const column = columns.find((item) => item.nanoid === columnNanoid);
        if (!column || !title.trim()) return;

        const nextStatus: TaskStatus = column.is_done_column ? 'done' : 'next';
        await handleQuickCreate(title, nextStatus, columnNanoid, priority, category);
    };

    const handleMoveTaskToColumn = async (task: Task, column: KanbanColumn) => {
        const updates: Partial<Task> = {
            kanban_column_nanoid: column.nanoid,
        };

        if (column.is_done_column) {
            updates.status = 'done';
            updates.is_completed = true;
        } else if (task.status === 'done') {
            updates.status = 'next';
            updates.is_completed = false;
        }

        await handleTaskUpdate(task.nanoid, task.status, updates);
    };

    return (
        <div className=" space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <CheckSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Tasks</h1>
                        <p className="text-sm text-muted-foreground">
                            {currentView === 'todo' ? 'Checklist view' : 'Kanban board'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <TaskViewToggle currentView={currentView} onViewChange={setCurrentView} />

                    {canEdit && (
                        <AlertDialog
                            open={isDialogOpen}
                            onOpenChange={(open) => {
                                setIsDialogOpen(open);
                                if (open) {
                                    initializeCreateForm();
                                }
                            }}
                        >
                            <AlertDialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" />New Task</Button>} />
                            <AlertDialogContent className="data-[size=default]:sm:max-w-3xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-semibold">Create New Task</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Add a task to track work for this project.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-5 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="task-title">Title</Label>
                                        <Input
                                            id="task-title"
                                            placeholder="What needs to be done?"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            disabled={isCreating}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="task-description">Description</Label>
                                        <Textarea
                                            id="task-description"
                                            placeholder="Additional details..."
                                            value={newDescription}
                                            onChange={(e) => setNewDescription(e.target.value)}
                                            disabled={isCreating}
                                            rows={2}
                                            className="bg-card/60 border-border"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Column</Label>
                                            <Select value={newColumnNanoid} onValueChange={(v) => setNewColumnNanoid(v ?? '')}>
                                                <SelectTrigger className="bg-card/60 border-border">
                                                    <SelectValue>{getColumnLabel(newColumnNanoid)}</SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {columns.map((column) => (
                                                        <SelectItem key={column.nanoid} value={column.nanoid}>
                                                            {column.title}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Priority</Label>
                                            <Select value={newPriority} onValueChange={(v) => setNewPriority(v ?? '')}>
                                                <SelectTrigger className="bg-card/60 border-border">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="low">Low</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select
                                                value={newCategory ?? 'none'}
                                                onValueChange={(v) => {
                                                    if (v === '__add_category__') {
                                                        handleAddCategoryToOptions();
                                                        return;
                                                    }
                                                    setNewCategory(v === 'none' ? null : (v as TaskCategory));
                                                }}
                                            >
                                                <SelectTrigger className="bg-card/60 border-border">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    {categoryOptions.map((category) => (
                                                        <SelectItem key={category} value={category}>
                                                            {category}
                                                        </SelectItem>
                                                    ))}
                                                    <SelectItem value="__add_category__">
                                                        <span className="inline-flex items-center gap-2">
                                                            <Plus className="h-3.5 w-3.5" />
                                                            Add category
                                                        </span>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <div className="flex gap-2 pt-1">
                                                <Input
                                                    placeholder="New filter name (e.g. Stage)"
                                                    value={newFilterNameInput}
                                                    onChange={(e) => setNewFilterNameInput(e.target.value)}
                                                    disabled={isCreating}
                                                    className="bg-card/60 border-border"
                                                />
                                                <Input
                                                    placeholder="Values comma separated (e.g. Draft, Review, Final)"
                                                    value={newFilterValuesInput}
                                                    onChange={(e) => setNewFilterValuesInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleCreateFilterParameter();
                                                        }
                                                    }}
                                                    disabled={isCreating}
                                                    className="bg-card/60 border-border"
                                                />
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={handleCreateFilterParameter}
                                                    disabled={isCreating || !newFilterNameInput.trim() || !newFilterValuesInput.trim()}
                                                >
                                                    Add Filter
                                                </Button>
                                            </div>
                                        </div>
                                        {collaborators.length > 0 && (
                                            <div className="space-y-2">
                                                <Label>Assign to</Label>
                                                <Select
                                                    value={newAssignee}
                                                    onValueChange={(v) => setNewAssignee(v ?? '')}
                                                >
                                                    <SelectTrigger className="bg-card/60 border-border">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                                        {collaborators.map((collab) => (
                                                            <SelectItem key={collab.id} value={collab.user_id}>
                                                                {collab.email.split('@')[0]}
                                                                {collab.user_id === currentUserId && ' (You)'}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>

                                    {versions.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Version</Label>
                                            <Select value={newVersionId} onValueChange={(v) => setNewVersionId(v ?? '')}>
                                                <SelectTrigger className="bg-card/60 border-border">
                                                    <SelectValue>{getVersionLabel(newVersionId)}</SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {versions.map((v) => (
                                                        <SelectItem key={v.id} value={v.id.toString()}>
                                                            {v.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    {error && <p className="text-sm text-destructive">{error}</p>}
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel disabled={isCreating}>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleCreate} disabled={isCreating}>
                                        {isCreating ? 'Creating...' : 'Create Task'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <Card className="p-4">
                <TaskProgressBar
                    totalTasks={totalTasks}
                    completedTasks={completedTasks}
                    label={selectedCategoryLabel}
                />
            </Card>
            
            {/* Filters */}
            <TaskFilters
                versions={versions}
                collaborators={collaborators}
                currentUserId={currentUserId}
                categories={categoryOptions}
                onAddCategory={addCategoryOption}
            />


            {/* View Content */}
            {currentView === 'todo' ? (
                <Card className="p-4">
                    <TasksTodoView
                        tasks={filteredTasks}
                        canEdit={canEdit}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                        onQuickCreate={handleQuickCreate}
                        onTaskUpdate={handleTaskUpdate}
                    />
                </Card>
            ) : (
                /* Kanban View */
                <TasksKanbanBoard
                    tasks={filteredTaskList}
                    columns={columns}
                    canEdit={canEdit}
                    onCreateColumn={handleCreateColumn}
                    onUpdateColumn={handleUpdateColumn}
                    onDeleteColumn={handleDeleteColumn}
                    onMoveColumnLeft={handleMoveColumnLeft}
                    onMoveColumnRight={handleMoveColumnRight}
                    onCreateTaskInColumn={handleCreateTaskInColumn}
                    onMoveTaskToColumn={handleMoveTaskToColumn}
                    onTaskUpdate={handleTaskUpdate}
                    onDelete={handleDelete}
                    onEditTask={(task) => {
                        console.log('Edit task', task);
                    }}
                    categoryOptions={categoryOptions}
                    onAddCategory={addCategoryOption}
                />
            )}
        </div>
    );
}
