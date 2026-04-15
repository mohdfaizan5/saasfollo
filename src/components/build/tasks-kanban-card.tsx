'use client';

import { useMemo, useState, useTransition } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircleIcon, CircleIcon, Trash } from '@phosphor-icons/react';
import { Plus, ArrowDown, ArrowRight, ArrowUp, GripVertical, UserRound } from 'lucide-react';
import type { Task, TaskStatus, Version } from '@/lib/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface TasksKanbanCardProps {
    task: Task;
    onUpdate: (taskNanoid: string, status: TaskStatus, updates: Partial<Task>) => void;
    onDelete: (taskNanoid: string, status: TaskStatus) => void;
    onEdit: (task: Task) => void;
    isDragging?: boolean;
    assigneeLabel?: string;
    categoryOptions?: string[];
    onAddCategory?: (category: string) => void;
    versions?: Version[];
}

const PRIORITY_COLORS: Record<string, string> = {
    high: 'text-red-400 bg-red-400/10',
    medium: 'text-yellow-400 bg-yellow-400/10',
    low: 'text-blue-400 bg-blue-400/10',
};

export default function TasksKanbanCard({
    task,
    onUpdate,
    onDelete,
    onEdit,
    isDragging,
    assigneeLabel,
    categoryOptions = [],
    onAddCategory,
    versions = [],
}: TasksKanbanCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [titleDraft, setTitleDraft] = useState(task.title);
    const [descriptionDraft, setDescriptionDraft] = useState(task.description ?? '');
    const [priorityDraft, setPriorityDraft] = useState(task.priority ?? 'none');
    const [categoryDraft, setCategoryDraft] = useState(task.category ?? 'none');
    const [versionDraft, setVersionDraft] = useState<string>(task.version_id ? task.version_id.toString() : 'none');
    const [isPending, startTransition] = useTransition();

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: `task:${task.nanoid}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isDirty = useMemo(() => {
        return (
            titleDraft.trim() !== task.title ||
            (descriptionDraft.trim() || null) !== task.description ||
            (priorityDraft === 'none' ? null : priorityDraft) !== task.priority ||
            (categoryDraft === 'none' ? null : categoryDraft) !== task.category ||
            (versionDraft === 'none' ? null : parseInt(versionDraft)) !== task.version_id
        );
    }, [titleDraft, descriptionDraft, priorityDraft, categoryDraft, versionDraft, task]);

    const openDetails = (e: React.MouseEvent) => {
        if (isDragging || isSortableDragging) return;
        e.stopPropagation();
        setTitleDraft(task.title);
        setDescriptionDraft(task.description ?? '');
        setPriorityDraft(task.priority ?? 'none');
        setCategoryDraft(task.category ?? 'none');
        setVersionDraft(task.version_id ? task.version_id.toString() : 'none');
        setIsDetailsOpen(true);
        onEdit(task);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this task?')) {
            onDelete(task.nanoid, task.status);
            setIsDetailsOpen(false);
        }
    };

    const handleDeleteFromDialog = () => {
        if (confirm('Delete this task?')) {
            onDelete(task.nanoid, task.status);
            setIsDetailsOpen(false);
        }
    };

    const handleToggleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Toggle completion status
        const newIsCompleted = !task.is_completed;
        // If marking as complete, move to 'done' status
        // If marking as incomplete, move to active work status
        const newStatus = newIsCompleted ? 'done' : 'next';

        // Update both is_completed and status
        onUpdate(task.nanoid, task.status, {
            is_completed: newIsCompleted,
            status: newStatus
        });
    };

    const handleSaveDetails = () => {
        const nextTitle = titleDraft.trim();
        if (!nextTitle) return;

        onUpdate(task.nanoid, task.status, {
            title: nextTitle,
            description: descriptionDraft.trim() || null,
            priority: priorityDraft === 'none' ? null : (priorityDraft as Task['priority']),
            category: categoryDraft === 'none' ? null : (categoryDraft as Task['category']),
            version_id: versionDraft === 'none' ? null : parseInt(versionDraft),
        });

        setIsDetailsOpen(false);
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className={cn(
                    "group relative p-3 rounded-xl bg-[#242528] transition-all cursor-pointer border border-transparent hover:border-primary/20 hover:shadow-sm",
                    isSortableDragging || isDragging ? 'opacity-50 shadow-lg ring-2 ring-primary/20' : '',
                    task.is_completed ? 'opacity-60' : ''
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={openDetails}
            >
                {/* Title & Checkbox */}
                <div className="flex flex-wrap items-start mb-2 overflow-hidden" style={{ maxHeight: '2.6em' }}>
                    <div
                        className={cn(
                            "mt-0.5 cursor-pointer transition-all duration-200 shrink-0",
                            task.is_completed
                                ? "text-green-500 w-5 mr-1"
                                : "text-muted-foreground hover:text-primary w-0 opacity-0 group-hover:w-5 group-hover:mr-1 group-hover:opacity-100 overflow-hidden"
                        )}
                        onClick={handleToggleComplete}
                    >
                        {task.is_completed ? (
                            <CheckCircleIcon className="w-4 h-4 " weight="duotone"  color='#fff'/>
                        ) : (
                            <CircleIcon className="w-4 h-4 group-hover:opacity-100" weight="duotone" color="white" />
                        )}
                    </div>

                    <h4 className={cn(
                        "font-medium text-sm text-[#cecfd2] line-clamp-2 leading-tight select-none flex-1 min-w-0 transition-all duration-200",
                        task.is_completed ? "line-through" : ""
                    )}>
                        {task.title}
                    </h4>

                    <button
                        type="button"
                        {...attributes}
                        {...listeners}
                        onClick={(event) => event.stopPropagation()}
                        className="text-muted-foreground/70 hover:text-foreground transition-colors p-0.5 -mt-1 shrink-0 cursor-grab active:cursor-grabbing"
                        aria-label="Drag task"
                    >
                        <GripVertical className="w-3.5 h-3.5" />
                    </button>

                    {isHovered && (
                        <button
                            onClick={handleDelete}
                            disabled={isPending}
                            className="text-muted-foreground hover:text-destructive transition-colors p-0.5 -mt-1 -mr-1 shrink-0"
                        >
                            <Trash className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {task.description && (
                    <p className="text-xs text-white/60 line-clamp-2 mb-2">
                        {task.description}
                    </p>
                )}

                <div className="flex items-center justify-between text-[10px] mt-2">
                    <div className="flex flex-wrap gap-1">
                        {task.category && (
                            // CATEGORY STYLE HOOK: tweak these classes if you want stronger/lighter category contrast.
                            <span className="px-1.5 py-0.5 rounded border border-white/25 bg-white/10 text-white font-medium capitalize select-none">
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

                        {task.assignee && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-white/20 bg-white/5 text-white/80 font-medium select-none">
                                <UserRound className="h-3 w-3" />
                                {assigneeLabel ?? (task.assignee === 'team' ? 'Team' : task.assignee)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <Dialog open={isDetailsOpen} onOpenChange={(open) => {
                if (!open && isDirty) {
                    if (!confirm('Changes made will be lost. Are you sure?')) return;
                }
                setIsDetailsOpen(open);
            }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Task Details</DialogTitle>
                        <DialogDescription>View and update task information.</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <Label>Title</Label>
                            <Input value={titleDraft} onChange={(event) => setTitleDraft(event.target.value)} />
                        </div>

                        <div className="space-y-1.5">
                            <Label>Description</Label>
                            <Textarea
                                rows={5}
                                value={descriptionDraft}
                                onChange={(event) => setDescriptionDraft(event.target.value)}
                                placeholder="Add a description"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label>Priority</Label>
                                <ToggleGroup
                                    className="justify-start inline-flex w-full border rounded-md p-1 bg-muted/20"
                                    // type="single"
                                    value={priorityDraft === 'none' ? [] : [priorityDraft]}
                                    onValueChange={(val) => setPriorityDraft(val[0] ?? 'none')}
                                >
                                    <ToggleGroupItem value="low" aria-label="Toggle low" className="flex-1 gap-2 data-[state=on]:bg-green-500/15 data-[state=on]:text-green-600 dark:data-[state=on]:text-green-400 hover:bg-green-500/10 hover:text-green-600 dark:hover:text-green-400">
                                        <ArrowDown size={16} />
                                        Low
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="medium" aria-label="Toggle medium" className="flex-1 gap-2 data-[state=on]:bg-yellow-500/15 data-[state=on]:text-yellow-600 dark:data-[state=on]:text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-600 dark:hover:text-yellow-400">
                                        <ArrowRight size={16} />
                                        Medium
                                    </ToggleGroupItem>
                                    <ToggleGroupItem value="high" aria-label="Toggle high" className="flex-1 gap-2 data-[state=on]:bg-red-500/15 data-[state=on]:text-red-600 dark:data-[state=on]:text-red-400 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400">
                                        <ArrowUp size={16} />
                                        High
                                    </ToggleGroupItem>
                                </ToggleGroup>
                            </div>
                            <div className="space-y-1.5">
                                <Label>Category</Label>
                                <Select 
                                    value={categoryDraft} 
                                    onValueChange={(value) => {
                                        if (value === '__add_category__') {
                                            const newCat = prompt('New category name')?.trim();
                                            if (newCat) {
                                                onAddCategory?.(newCat);
                                                setCategoryDraft(newCat);
                                            }
                                            return;
                                        }
                                        setCategoryDraft(value ?? 'none');
                                    }}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {categoryOptions.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                        {/* Added from legacy logic if not in options */}
                                        {task.category && !categoryOptions.includes(task.category) && (
                                            <SelectItem value={task.category}>{task.category}</SelectItem>
                                        )}
                                        <SelectItem value="__add_category__">
                                            <span className="inline-flex items-center gap-2">
                                                <Plus className="h-3.5 w-3.5" />
                                                Add category
                                            </span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {versions && versions.length > 0 && (
                            <div className="space-y-1.5">
                                <Label>Version</Label>
                                <Select
                                    value={versionDraft}
                                    onValueChange={(value) => setVersionDraft(value ?? 'none')}
                                >
                                    <SelectTrigger>
                                        <SelectValue>{versionDraft !== 'none' ? versions.find((version) => version.id.toString() === versionDraft)?.name ?? 'Select version' : 'Select version'}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {versions.map(version => (
                                            <SelectItem key={version.id} value={version.id.toString()}>
                                                {version.name} {version.is_active ? '(Active)' : ''}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteFromDialog}
                        >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                        <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveDetails} disabled={!isDirty || !titleDraft.trim()}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
