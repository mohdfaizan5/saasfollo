'use client';

import { useState } from 'react';
import { CheckSquare, Plus, Clock, ArrowRight, Archive, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { createTask, updateTaskStatus, deleteTask } from '@/lib/actions/tasks';
import type { Task, TaskStatus, Version } from '@/lib/types/database';

const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: React.ReactNode; color: string }> = {
    now: { label: 'Now', icon: <Clock className="h-4 w-4" />, color: 'bg-orange-500' },
    next: { label: 'Next', icon: <ArrowRight className="h-4 w-4" />, color: 'bg-blue-500' },
    later: { label: 'Later', icon: <Archive className="h-4 w-4" />, color: 'bg-gray-500' },
    done: { label: 'Done', icon: <CheckCircle2 className="h-4 w-4" />, color: 'bg-green-500' },
};

interface TasksClientProps {
    initialTasks: Record<TaskStatus, Task[]>;
    projectId: number;
    versions: Version[];
}

export function TasksClient({ initialTasks, projectId, versions }: TasksClientProps) {
    const [tasks, setTasks] = useState<Record<TaskStatus, Task[]>>(initialTasks);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newStatus, setNewStatus] = useState<TaskStatus>('next');
    const [newVersionId, setNewVersionId] = useState<string>('');
    const [newPriority, setNewPriority] = useState<string>('');
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async () => {
        if (!newTitle.trim()) {
            setError('Task title is required');
            return;
        }

        setIsCreating(true);
        setError(null);

        try {
            const task = await createTask({
                project_id: projectId,
                title: newTitle.trim(),
                description: newDescription.trim() || null,
                status: newStatus,
                version_id: newVersionId ? parseInt(newVersionId, 10) : null,
                priority: (newPriority as Task['priority']) || null,
            });
            setTasks((prev) => ({
                ...prev,
                [newStatus]: [task, ...prev[newStatus]],
            }));
            setIsDialogOpen(false);
            setNewTitle('');
            setNewDescription('');
            setNewStatus('next');
            setNewVersionId('');
            setNewPriority('');
        } catch (err) {
            console.error('Failed to create task:', err);
            setError('Failed to create task');
        } finally {
            setIsCreating(false);
        }
    };

    const handleStatusChange = async (taskId: number, oldStatus: TaskStatus, newStatus: TaskStatus) => {
        try {
            const task = tasks[oldStatus].find((t) => t.id === taskId);
            if (!task) return;

            await updateTaskStatus(taskId, projectId, newStatus);

            setTasks((prev) => ({
                ...prev,
                [oldStatus]: prev[oldStatus].filter((t) => t.id !== taskId),
                [newStatus]: [{ ...task, status: newStatus }, ...prev[newStatus]],
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

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                        <CheckSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Tasks</h1>
                        <p className="text-sm text-muted-foreground">
                            Organize by Now / Next / Later / Done
                        </p>
                    </div>
                </div>

                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogTrigger render={<Button><Plus className="h-4 w-4 mr-2" />New Task</Button>} />
                    <AlertDialogContent>
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
            </div>

            {/* Task Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(['now', 'next', 'later', 'done'] as TaskStatus[]).map((status) => (
                    <div key={status} className="space-y-3">
                        <div className="flex items-center gap-2 p-2">
                            <div className={`p-1.5 rounded ${STATUS_CONFIG[status].color}`}>
                                {STATUS_CONFIG[status].icon}
                            </div>
                            <span className="font-medium">{STATUS_CONFIG[status].label}</span>
                            <Badge variant="secondary" className="ml-auto">
                                {tasks[status].length}
                            </Badge>
                        </div>
                        <div className="space-y-2">
                            {tasks[status].map((task) => (
                                <Card key={task.id} className="p-3">
                                    <p className="font-medium text-sm">{task.title}</p>
                                    {task.description && (
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        {task.priority && (
                                            <Badge
                                                variant={task.priority === 'high' ? 'destructive' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {task.priority}
                                            </Badge>
                                        )}
                                        {status !== 'done' && (
                                            <Select
                                                value={status}
                                                onValueChange={(v) => handleStatusChange(task.id, status, v as TaskStatus)}
                                            >
                                                <SelectTrigger className="h-6 text-xs w-20">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="now">Now</SelectItem>
                                                    <SelectItem value="next">Next</SelectItem>
                                                    <SelectItem value="later">Later</SelectItem>
                                                    <SelectItem value="done">Done</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </Card>
                            ))}
                            {tasks[status].length === 0 && (
                                <div className="text-center py-4 text-xs text-muted-foreground border border-dashed rounded-md">
                                    No tasks
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
