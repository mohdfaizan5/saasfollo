'use client';

import { useState, useMemo, useEffect } from 'react';
import { CheckSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogPopup, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogClose, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
    BugIcon,
    CheckCircleIcon,
    CubeIcon,
    FileTextIcon,
    MagnifyingGlassIcon,
    RocketIcon,
    SparkleIcon,
    TargetIcon,
} from '@phosphor-icons/react';
// NOTE: The following imports from '@/lib/actions/tasks' remain unchanged as they are backend calls
// that use the original 'tasks' nomenclature. Only the frontend route and component names have changed to 'build'
import { createTask, deleteTask, updateTask, clearCategoryFromTasks } from '@/lib/actions/tasks';
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
import { BatteryMediumIcon, CellSignalLowIcon, FlagBannerFoldIcon, HourglassMediumIcon } from '@phosphor-icons/react/dist/ssr';
import Image from 'next/image';

const DEFAULT_CATEGORIES = ['Website', 'Marketing', 'SEO', 'Content'];
const ALL_VERSIONS_VALUE = 'all';
const UNASSIGNED_VERSION_VALUE = 'unassigned';
const UNASSIGNED_ASSIGNEE_VALUE = 'unassigned';
const TEAM_ASSIGNEE_VALUE = 'team';

type ColumnIconRule = {
    keywords: string[];
    icon: React.ComponentType<any>;
    weight: 'duotone';
};

const DONE_COLUMN_KEYWORDS = ['done', 'complete', 'completed', 'finish', 'finished', 'shipped', 'released', 'closed'];
const START_COLUMN_KEYWORDS = ['in progress', 'start here', 'doing', 'active', 'working', 'current', 'now'];

const COLUMN_ICON_RULES: ColumnIconRule[] = [
    { keywords: ['review left', 'review', 'qa', 'test', 'verify', 'verification'], icon: MagnifyingGlassIcon, weight: 'duotone' },
    { keywords: ['backlog', 'ideas', 'idea', 'brainstorm'], icon: SparkleIcon, weight: 'duotone' },
    { keywords: ['plan', 'planning', 'goal', 'milestone'], icon: TargetIcon, weight: 'duotone' },
    { keywords: ['spec', 'docs', 'documentation', 'notes'], icon: FileTextIcon, weight: 'duotone' },
    { keywords: ['bug', 'blocked', 'blocker', 'issue', 'fix'], icon: BugIcon, weight: 'duotone' },
    { keywords: ['build', 'dev', 'development', 'implement', 'coding'], icon: CubeIcon, weight: 'duotone' },
    { keywords: ['progress', 'start', 'doing', 'wip'], icon: RocketIcon, weight: 'duotone' },
];

function getColumnSemantic(title: string, isDoneColumn: boolean) {
    const normalizedTitle = title.toLowerCase().trim();
    const isDoneByName = DONE_COLUMN_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword));
    const isStartByName = START_COLUMN_KEYWORDS.some((keyword) => normalizedTitle.includes(keyword));

    const matchedRule = COLUMN_ICON_RULES.find((rule) =>
        rule.keywords.some((keyword) => normalizedTitle.includes(keyword)),
    );

    if (isDoneColumn || isDoneByName) {
        return {
            isDoneLike: true,
            isStartLike: false,
            icon: CheckCircleIcon,
            iconWeight: 'duotone' as const,
        };
    }

    return {
        isDoneLike: false,
        isStartLike: isStartByName,
        icon: matchedRule?.icon ?? CubeIcon,
        iconWeight: matchedRule?.weight ?? ('duotone' as const),
    };
}

function sortTasksByPositionThenNewest(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => {
        const positionA = a.position ?? Number.MAX_SAFE_INTEGER;
        const positionB = b.position ?? Number.MAX_SAFE_INTEGER;

        if (positionA !== positionB) {
            return positionA - positionB;
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
}

function getNextTaskPosition(tasks: Task[], columnNanoid: string | null | undefined): number | undefined {
    if (!columnNanoid) {
        return undefined;
    }

    const columnTasks = tasks.filter((task) => task.kanban_column_nanoid === columnNanoid);
    let hasNumericPosition = false;
    let maxPosition = 0;

    for (const task of columnTasks) {
        if (typeof task.position === 'number') {
            hasNumericPosition = true;
            maxPosition = Math.max(maxPosition, task.position);
        }
    }

    return hasNumericPosition ? maxPosition + 1 : columnTasks.length + 1;
}

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
    const [newAssignee, setNewAssignee] = useState<string>(UNASSIGNED_ASSIGNEE_VALUE);
    const [newFilterNameInput, setNewFilterNameInput] = useState('');
    const [newFilterValuesInput, setNewFilterValuesInput] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // View state from URL
    const [currentView, setCurrentView] = useState<TaskView>(initialView);

    // Filter state from URL using Nuqs
    const [selectedCategory, setSelectedCategory] = useQueryState('category');
    const [selectedVersionId] = useQueryState('version');
    const [selectedAssignee] = useQueryState('assignee');
    const [newTaskParam, setNewTaskParam] = useQueryState('newTask');

    useEffect(() => {
        if (newTaskParam === 'true') {
            setIsDialogOpen(true);
            setNewTaskParam(null); // Clear param after triggering modal
        }
    }, [newTaskParam, setNewTaskParam]);

    const defaultVersionId = useMemo(() => {
        const queryVersion = selectedVersionId && versions.some((version) => version.id.toString() === selectedVersionId)
            ? selectedVersionId
            : null;
        const activeVersion = versions.find((version) => version.is_active)?.id?.toString() ?? null;
        const firstVersion = versions[0]?.id?.toString() ?? '';

        return queryVersion || activeVersion || firstVersion;
    }, [selectedVersionId, versions]);

    const effectiveVersionFilter = useMemo(() => {
        if (selectedVersionId === ALL_VERSIONS_VALUE) {
            return ALL_VERSIONS_VALUE;
        }

        if (selectedVersionId === UNASSIGNED_VERSION_VALUE) {
            return UNASSIGNED_VERSION_VALUE;
        }

        if (selectedVersionId && versions.some((version) => version.id.toString() === selectedVersionId)) {
            return selectedVersionId;
        }

        return versions.find((version) => version.is_active)?.id?.toString() ?? ALL_VERSIONS_VALUE;
    }, [selectedVersionId, versions]);

    const getColumnLabel = (columnNanoid: string) => {
        const column = columns.find((item) => item.nanoid === columnNanoid);
        if (!column) return 'Select column';
        const semantic = getColumnSemantic(column.title, column.is_done_column);
        const Icon = semantic.icon;
        return (
            <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 shrink-0 opacity-70" weight={semantic.iconWeight} />
                <span>{column.title}</span>
            </div>
        );
    };

    const getVersionLabel = (versionId: string) => {
        const version = versions.find((item) => item.id.toString() === versionId);
        return version?.name ?? 'Select version';
    };

    const assigneeOptions = useMemo(() => {
        const options: Array<{ value: string; label: string }> = [
            { value: UNASSIGNED_ASSIGNEE_VALUE, label: 'Unassigned' },
            { value: TEAM_ASSIGNEE_VALUE, label: 'Team' },
        ];

        if (currentUserId) {
            options.push({ value: currentUserId, label: 'You' });
        }

        const seen = new Set(options.map((option) => option.value));
        for (const collaborator of collaborators) {
            if (seen.has(collaborator.user_id)) continue;
            options.push({
                value: collaborator.user_id,
                label: collaborator.user_id === currentUserId
                    ? 'You'
                    : collaborator.email.split('@')[0],
            });
            seen.add(collaborator.user_id);
        }

        return options;
    }, [collaborators, currentUserId]);

    const assigneeLabelById = useMemo(() => {
        return assigneeOptions.reduce<Record<string, string>>((acc, option) => {
            acc[option.value] = option.label;
            return acc;
        }, {});
    }, [assigneeOptions]);

    const normalizeAssignee = (value: string | null | undefined) => {
        if (!value || value === UNASSIGNED_ASSIGNEE_VALUE) return null;
        return value;
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
        setNewAssignee(UNASSIGNED_ASSIGNEE_VALUE);
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

    const deleteCategoryOption = async (categoryName: string) => {
        const normalized = categoryName.trim();
        if (!normalized) return;
        
        setCategoryOptions((prev) => {
            const updated = prev.filter((item) => item.toLowerCase() !== normalized.toLowerCase());
            if (typeof window !== 'undefined') {
                localStorage.setItem(`projectCategories-${projectId}`, JSON.stringify(updated));
            }
            return updated;
        });

        // Set category filter to null if it was the selected one
        if (selectedCategory === normalized) {
            setSelectedCategory(null);
        }

        try {
            await clearCategoryFromTasks(projectId, normalized);
            setTasks((prev) => ({
                now: prev.now.map((task) =>
                    task.category?.toLowerCase() === normalized.toLowerCase()
                        ? { ...task, category: null }
                        : task,
                ),
                next: prev.next.map((task) =>
                    task.category?.toLowerCase() === normalized.toLowerCase()
                        ? { ...task, category: null }
                        : task,
                ),
                later: prev.later.map((task) =>
                    task.category?.toLowerCase() === normalized.toLowerCase()
                        ? { ...task, category: null }
                        : task,
                ),
                done: prev.done.map((task) =>
                    task.category?.toLowerCase() === normalized.toLowerCase()
                        ? { ...task, category: null }
                        : task,
                ),
            }));
        } catch (error) {
            console.error('Failed to clear categories from tasks:', error);
        }
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
                if (effectiveVersionFilter === UNASSIGNED_VERSION_VALUE) {
                    if (task.version_id !== null) {
                        return false;
                    }
                } else if (effectiveVersionFilter !== ALL_VERSIONS_VALUE && task.version_id?.toString() !== effectiveVersionFilter) {
                    return false;
                }
                // Assignee filter
                if (selectedAssignee) {
                    if (selectedAssignee === UNASSIGNED_ASSIGNEE_VALUE && task.assignee) {
                        return false;
                    }
                    if (selectedAssignee !== UNASSIGNED_ASSIGNEE_VALUE && task.assignee !== selectedAssignee) {
                        return false;
                    }
                }
                return true;
            });
        });

        return filtered;
    }, [tasks, selectedCategory, effectiveVersionFilter, selectedAssignee]);

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
            const nextPosition = getNextTaskPosition(Object.values(tasks).flat(), selectedColumn?.nanoid ?? null);
            const taskData = {
                title: newTitle.trim(),
                description: newDescription.trim() || null,
                status: selectedColumn?.is_done_column ? 'done' : newStatus,
                kanban_column_nanoid: selectedColumn?.nanoid ?? null,
                position: nextPosition,
                version_id: effectiveVersionId ? parseInt(effectiveVersionId, 10) : null,
                priority: newPriority === 'none' ? null : (newPriority as Task['priority']) || null,
                category: newCategory,
                assignee: normalizeAssignee(newAssignee),
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
            const effectiveVersionId = effectiveVersionFilter === ALL_VERSIONS_VALUE || effectiveVersionFilter === UNASSIGNED_VERSION_VALUE
                ? fallbackVersion
                : effectiveVersionFilter;

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

            const nextPosition = getNextTaskPosition(Object.values(tasks).flat(), columnNanoid ?? null);

            const taskData = {
                title: title.trim(),
                status: status,
                kanban_column_nanoid: columnNanoid ?? null,
                position: nextPosition,
                version_id: effectiveVersionId ? parseInt(effectiveVersionId, 10) : null,
                category: finalCategory,
                priority: finalPriority as Task['priority'] | null,
                assignee: normalizeAssignee(selectedAssignee),
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
        const nextPosition = getNextTaskPosition(
            Object.values(tasks)
                .flat()
                .filter((item) => item.nanoid !== task.nanoid),
            column.nanoid,
        );

        const updates: Partial<Task> = {
            kanban_column_nanoid: column.nanoid,
            position: nextPosition,
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

    const handleReorderTaskInColumn = (taskNanoid: string, overTaskNanoid: string, columnNanoid: string) => {
        if (taskNanoid === overTaskNanoid) return;

        let positionUpdates: Array<{ nanoid: string; position: number }> = [];

        setTasks((prev) => {
            const columnTasks = sortTasksByPositionThenNewest(Object.values(prev).flat()).filter(
                (task) => task.kanban_column_nanoid === columnNanoid,
            );

            const fromIndex = columnTasks.findIndex((task) => task.nanoid === taskNanoid);
            const toIndex = columnTasks.findIndex((task) => task.nanoid === overTaskNanoid);

            if (fromIndex === -1 || toIndex === -1) return prev;

            const reordered = [...columnTasks];
            const [movedTask] = reordered.splice(fromIndex, 1);
            reordered.splice(toIndex, 0, movedTask);

            positionUpdates = reordered.map((task, index) => ({
                nanoid: task.nanoid,
                position: index + 1,
            }));

            const positionByNanoid = new Map(positionUpdates.map((item) => [item.nanoid, item.position]));

            return {
                now: prev.now.map((task) =>
                    positionByNanoid.has(task.nanoid)
                        ? { ...task, position: positionByNanoid.get(task.nanoid)! }
                        : task,
                ),
                next: prev.next.map((task) =>
                    positionByNanoid.has(task.nanoid)
                        ? { ...task, position: positionByNanoid.get(task.nanoid)! }
                        : task,
                ),
                later: prev.later.map((task) =>
                    positionByNanoid.has(task.nanoid)
                        ? { ...task, position: positionByNanoid.get(task.nanoid)! }
                        : task,
                ),
                done: prev.done.map((task) =>
                    positionByNanoid.has(task.nanoid)
                        ? { ...task, position: positionByNanoid.get(task.nanoid)! }
                        : task,
                ),
            };
        });

        if (positionUpdates.length === 0) {
            return;
        }

        void Promise.all(
            positionUpdates.map((update) =>
                updateTask(update.nanoid, projectId, { position: update.position }),
            ),
        ).catch((err) => {
            console.error('Failed to persist task order:', err);
        });
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
                            <AlertDialogPopup className="sm:max-w-xl">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-xl font-semibold">Create New Task</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Add a task to track work for this project.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-5 px-6 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="task-title">Title</Label>
                                        <Input
                                            id="task-title"
                                            placeholder="What needs to be done?"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            disabled={isCreating}
                                            className='border-muted-foreground/10'
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="task-description">Description</Label>
                                        <RichTextEditor
                                            value={newDescription}
                                            onChange={setNewDescription}
                                            projectNanoid={projectId}
                                            placeholder="Additional details, checklists, code, images…"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Column</Label>
                                            <Select value={newColumnNanoid} onValueChange={(v) => setNewColumnNanoid(v ?? '')}>
                                                <SelectTrigger className="bg-input/10 border-border w-full!">
                                                    <SelectValue>{getColumnLabel(newColumnNanoid)}</SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {columns.map((column) => {
                                                        const semantic = getColumnSemantic(column.title, column.is_done_column);
                                                        const Icon = semantic.icon;
                                                        return (
                                                            <SelectItem key={column.nanoid} value={column.nanoid}>
                                                                <div className="flex items-center gap-2">
                                                                    <Icon className="h-4 w-4 shrink-0 opacity-70" weight={semantic.iconWeight} />
                                                                    <span>{column.title}</span>
                                                                </div>
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Priority</Label>
                                            <ToggleGroup
                                                className="justify-start inline-flex w-full border rounded-md  bg-muted/20"
                                                multiple={false}
                                                value={newPriority ? [newPriority] : []}
                                                onValueChange={(val) => setNewPriority(val[0] ?? '')}
                                            >
                                                <ToggleGroupItem value="low" aria-label="Toggle low" className="flex-1 p-1 gap-2 data-[state=on]:bg-green-500/15 data-[state=on]:text-green-600 dark:data-[state=on]:text-green-400 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400">
                                                    {/* <ArrowDown size={16} /> */}
                                                    <CellSignalLowIcon size={16} />

                                                    Low
                                                </ToggleGroupItem>
                                                <ToggleGroupItem value="medium" aria-label="Toggle medium" className="flex-1  p-1 gap-2 data-[state=on]:bg-yellow-500/15 data-[state=on]:text-yellow-600 dark:data-[state=on]:text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-600 dark:hover:text-yellow-400">
                                                    {/* <ArrowRight size={16} /> */}
                                                    {/* <BatteryMediumIcon size={32} /> */}
                                                    <HourglassMediumIcon size={16} />


                                                    Medium
                                                </ToggleGroupItem>
                                                <ToggleGroupItem value="high" aria-label="Toggle high" className="flex-1 p-1 gap-2 data-[state=on]:bg-red-500/15 data-[state=on]:text-red-600 dark:data-[state=on]:text-red-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400">
                                                    {/* <ArrowUp size={16} /> */}
                                                    <FlagBannerFoldIcon size={16} />


                                                    High
                                                </ToggleGroupItem>
                                            </ToggleGroup>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2 ">
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
                                                <SelectTrigger className="bg-input/10 border-border w-full!">
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
                                            {/* <div className="flex gap-2 pt-1">
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
                                            </div> */}

                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Assign to</Label>
                                            <Select
                                                value={newAssignee || UNASSIGNED_ASSIGNEE_VALUE}
                                                onValueChange={(value) => setNewAssignee(value ?? UNASSIGNED_ASSIGNEE_VALUE)}
                                            >
                                                <SelectTrigger className="bg-input/10 border-border w-full!">
                                                    <SelectValue placeholder="Unassigned" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {assigneeOptions.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {versions.length > 0 && (
                                            <div className="space-y-2">
                                                <Label>Version</Label>
                                                <Select value={newVersionId} onValueChange={(v) => setNewVersionId(v ?? '')}>
                                                    <SelectTrigger className="bg-input/10 border-border w-full!">
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
                                    </div>


                                    {error && <p className="text-sm text-destructive">{error}</p>}
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogClose render={<Button variant="outline" disabled={isCreating} />}>
                                        Cancel
                                    </AlertDialogClose>
                                    <Button onClick={handleCreate} disabled={isCreating}>
                                        {isCreating ? 'Creating...' : 'Create Task'}
                                    </Button>
                                </AlertDialogFooter>
                            </AlertDialogPopup>
                        </AlertDialog>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <Card className="p-4 relative overflow-hidden">
                <TaskProgressBar
                    totalTasks={totalTasks}
                    completedTasks={completedTasks}
                    label={selectedCategoryLabel}
                />
                <Image
                    className="pointer-events-none select-none absolute -bottom-8 -right-9 -rotate-6"
                    src="/completed-todolist.png"
                    alt="Task completion"
                    width={160}
                    height={160}
                />

            </Card>

            {/* Filters */}
            <TaskFilters
                versions={versions}
                collaborators={collaborators}
                currentUserId={currentUserId}
                categories={categoryOptions}
                onAddCategory={addCategoryOption}
                onDeleteCategory={deleteCategoryOption}
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
                    projectNanoid={projectId}
                    canEdit={canEdit}
                    onCreateColumn={handleCreateColumn}
                    onUpdateColumn={handleUpdateColumn}
                    onDeleteColumn={handleDeleteColumn}
                    onMoveColumnLeft={handleMoveColumnLeft}
                    onMoveColumnRight={handleMoveColumnRight}
                    onCreateTaskInColumn={handleCreateTaskInColumn}
                    onMoveTaskToColumn={handleMoveTaskToColumn}
                    onReorderTaskInColumn={handleReorderTaskInColumn}
                    onTaskUpdate={handleTaskUpdate}
                    onDelete={handleDelete}
                    onEditTask={(task) => {
                        console.log('Edit task', task);
                    }}
                    assigneeLabelById={assigneeLabelById}
                    categoryOptions={categoryOptions}
                    onAddCategory={addCategoryOption}
                    versions={versions}
                />
            )}
        </div>
    );
}
