'use client';

import { useState, useMemo } from 'react';
import { CheckSquare, Plus, Clock, ArrowRight, Archive, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { createTask, updateTaskStatus, deleteTask, updateTask } from '@/lib/actions/tasks';
import { useProjectRole } from '@/hooks/use-project-role';
import { TaskFilters } from './task-filters';
import { TaskProgressBar } from './task-progress-bar';
import { TaskViewToggle, type TaskView } from './task-view-toggle';
import { TasksTodoView } from './tasks-todo-view';
import TasksKanbanBoard from './tasks-kanban-board';
import type { Task, TaskStatus, TaskCategory, Version, ProjectCollaborator } from '@/lib/types/database';

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ReactNode; color: string }> = {
    now: { label: 'Now', icon: <Clock className="h-4 w-4" />, color: 'bg-orange-500' },
    next: { label: 'Next', icon: <ArrowRight className="h-4 w-4" />, color: 'bg-blue-500' },
    later: { label: 'Later', icon: <Archive className="h-4 w-4" />, color: 'bg-gray-500' },
    done: { label: 'Done', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-green-500' },
};

const CATEGORIES: { value: TaskCategory; label: string }[] = [
    { value: 'website', label: 'Website' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'seo', label: 'SEO' },
    { value: 'content', label: 'Content' },
];

interface TasksClientProps {
    initialTasks: Record<TaskStatus, Task[]>;
    projectId: number;
    versions: Version[];
    collaborators?: ProjectCollaborator[];
    currentUserId?: string;
    initialView?: TaskView;
}

export function TasksClient({
    initialTasks,
    projectId,
    versions,
    collaborators = [],
    currentUserId = '',
    initialView = 'kanban'
}: TasksClientProps) {
    const { canEdit } = useProjectRole();
    const [tasks, setTasks] = useState<Record<TaskStatus, Task[]>>(initialTasks);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newStatus, setNewStatus] = useState<TaskStatus>('next');
    const [newVersionId, setNewVersionId] = useState<string>('');
    const [newPriority, setNewPriority] = useState<string>('');
    const [newCategory, setNewCategory] = useState<TaskCategory>(null);
    const [newAssignee, setNewAssignee] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // View state
    const [currentView, setCurrentView] = useState<TaskView>(initialView);

    // Filter state
    const [selectedCategory, setSelectedCategory] = useState<TaskCategory>(null);
    const [selectedVersionId, setSelectedVersionId] = useState<string>('');
    const [selectedAssignee, setSelectedAssignee] = useState<string>('');

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

    // Calculate progress
    const totalTasks = Object.values(filteredTasks).flat().length;
    const completedTasks = filteredTasks.done.length;

    const handleCreate = async () => {
        if (!newTitle.trim()) {
            setError('Task title is required');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const taskData = {
                project_id: projectId,
                title: newTitle.trim(),
                description: newDescription.trim() || null,
                status: newStatus,
                version_id: newVersionId ? parseInt(newVersionId, 10) : null,
                priority: (newPriority as Task['priority']) || null,
                category: newCategory,
                assignee: newAssignee || null,
                is_completed: newStatus === 'done', // Set is_completed based on status
            };

            const task = await createTask(taskData);
            setTasks((prev) => ({
                ...prev,
                [newStatus]: [task, ...prev[newStatus]],
            }));
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
        setNewStatus('next');
        setNewVersionId('');
        setNewPriority('');
        setNewCategory(null);
        setNewAssignee('');
    };

    const handleQuickCreate = async (title: string, status: TaskStatus) => {
        try {
            const taskData = {
                project_id: projectId,
                title: title.trim(),
                status: status,
                is_completed: status === 'done', // Set is_completed based on status
            };

            const task = await createTask(taskData);
            setTasks((prev) => ({
                ...prev,
                [status]: [task, ...prev[status]],
            }));
        } catch (err) {
            console.error('Failed to create task:', err);
        }
    };

    const handleStatusChange = async (taskId: number, oldStatus: TaskStatus, newStatus: TaskStatus) => {
        try {
            const task = tasks[oldStatus].find((t) => t.id === taskId);
            if (!task) return;

            // Update the task status and is_completed field
            const updatedTask = await updateTask(taskId, projectId, {
                status: newStatus,
                is_completed: newStatus === 'done'
            });

            setTasks((prev) => ({
                ...prev,
                [oldStatus]: prev[oldStatus].filter((t) => t.id !== taskId),
                [newStatus]: [{ ...task, status: newStatus, is_completed: newStatus === 'done' }, ...prev[newStatus]],
            }));
        } catch (err) {
            console.error('Failed to update task status:', err);
        }
    };

    const handleDelete = async (taskId: number, status: TaskStatus) => {
        try {
            await deleteTask(taskId, projectId);
            setTasks((prev) => ({
                ...prev,
                [status]: prev[status].filter((t) => t.id !== taskId),
            }));
        } catch (err) {
            console.error('Failed to delete task:', err);
        }
    };

    const handleTaskUpdate = async (taskId: number, status: TaskStatus, updates: Partial<Task>) => {
        try {
            if (!taskId || !status) return;

            // Update the task on the server
            const updatedTask = await updateTask(taskId, projectId, updates);

            // Optimistic update
            setTasks((prev) => {
                const newTasks = { ...prev };
                const taskIndex = newTasks[status].findIndex((t) => t.id === taskId);
                if (taskIndex !== -1) {
                    newTasks[status][taskIndex] = { ...newTasks[status][taskIndex], ...updatedTask };
                }
                return newTasks;
            });
        } catch (err) {
            console.error('Failed to update task:', err);
        }
    };

    return (
        <div className="p-6 space-y-6">
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
                        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <AlertDialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" />New Task</Button>} />
                            <AlertDialogContent className="max-w-md">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Create New Task</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Add a task to track work for this project
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4 py-4">
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
                                        <Label htmlFor="task-description">Description (optional)</Label>
                                        <Textarea
                                            id="task-description"
                                            placeholder="Additional details..."
                                            value={newDescription}
                                            onChange={(e) => setNewDescription(e.target.value)}
                                            disabled={isCreating}
                                            rows={2}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TaskStatus)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="now">Now</SelectItem>
                                                    <SelectItem value="next">Next</SelectItem>
                                                    <SelectItem value="later">Later</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Priority</Label>
                                            <Select value={newPriority} onValueChange={(v) => setNewPriority(v ?? '')}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="high">High</SelectItem>
                                                    <SelectItem value="medium">Medium</SelectItem>
                                                    <SelectItem value="low">Low</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select
                                                value={newCategory || ''}
                                                onValueChange={(v) => setNewCategory(v as TaskCategory || null)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CATEGORIES.map((cat) => (
                                                        <SelectItem key={cat.value} value={cat.value!}>
                                                            {cat.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {collaborators.length > 0 && (
                                            <div className="space-y-2">
                                                <Label>Assign to</Label>
                                                <Select
                                                    value={newAssignee}
                                                    onValueChange={(v) => setNewAssignee(v ?? '')}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
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
                                            <Label>Version (optional)</Label>
                                            <Select value={newVersionId} onValueChange={(v) => setNewVersionId(v ?? '')}>
                                                <SelectTrigger>
                                                    <SelectValue />
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

            {/* Filters */}
            <TaskFilters
                versions={versions}
                collaborators={collaborators}
                currentUserId={currentUserId}
                selectedCategory={selectedCategory}
                selectedVersionId={selectedVersionId}
                selectedAssignee={selectedAssignee}
                onCategoryChange={setSelectedCategory}
                onVersionChange={setSelectedVersionId}
                onAssigneeChange={setSelectedAssignee}
            />

            {/* Progress Bar */}
            <Card className="p-4">
                <TaskProgressBar
                    totalTasks={totalTasks}
                    completedTasks={completedTasks}
                    label={selectedCategory ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) : undefined}
                />
            </Card>

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
                    tasks={filteredTasks}
                    projectId={projectId}
                    onStatusChange={handleStatusChange}
                    onTaskUpdate={handleTaskUpdate}
                    onDelete={handleDelete}
                    onEditTask={(task) => {
                        console.log('Edit task', task);
                    }}
                />
            )}
        </div>
    );
}
