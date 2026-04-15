'use client';

import { useEffect, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, useReducedMotion } from 'motion/react';
import TasksKanbanCard from './tasks-kanban-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, MoreVertical, Plus, Trash2 } from 'lucide-react';
import type { KanbanColumn, Task, TaskStatus, Version } from '@/lib/types/database';
import { cn } from '@/lib/utils';
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
    onCreateTask: (title: string, priority: string | null, category: string | null) => Promise<void>;
    onTaskUpdate: (taskNanoid: string, status: TaskStatus, updates: Partial<Task>) => void;
    onDelete: (taskNanoid: string, status: TaskStatus) => void;
    onEdit: (task: Task) => void;
    assigneeLabelById?: Record<string, string>;
    categoryOptions?: string[];
    onAddCategory?: (category: string) => void;
    versions?: Version[];
}

type ColumnIconRule = {
    keywords: string[];
    icon: React.ComponentType<any>;
    weight: 'duotone';
};

const DONE_COLUMN_KEYWORDS = ['done', 'complete', 'completed', 'finish', 'finished', 'shipped', 'released', 'closed'];
const START_COLUMN_KEYWORDS = ['in progress', 'start here', 'doing', 'active', 'working', 'current', 'now'];

// Column icon keyword rules (editable): add your own keywords/icon pairs here.
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
    assigneeLabelById,
    categoryOptions = [],
    onAddCategory,
    versions = [],
}: TasksKanbanColumnProps) {
    const shouldReduceMotion = useReducedMotion();
    const { setNodeRef, isOver } = useDroppable({
        id: `column:${column.nanoid}`,
    });
    const [titleDraft, setTitleDraft] = useState(column.title);
    const [descriptionDraft, setDescriptionDraft] = useState(column.description ?? '');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<string>('none');
    const [newTaskCategory, setNewTaskCategory] = useState<string>('none');
    const semantic = getColumnSemantic(column.title, column.is_done_column);
    const Icon = semantic.icon;

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
        const priority = newTaskPriority === 'none' ? null : newTaskPriority;
        const category = newTaskCategory === 'none' ? null : newTaskCategory;
        await onCreateTask(title, priority, category);
        setNewTaskTitle('');
        setNewTaskPriority('none');
        setNewTaskCategory('none');
        setIsAddingTask(false);
    };

    return (
        <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : undefined}
            className={cn(
                "w-72 h-full rounded-2xl p-3 flex flex-col transition-colors border relative",
                // COLUMN STYLE HOOK: tweak these classes to control done-column appearance.
                semantic.isDoneLike ? 'bg-[#10140f] border-white/15' : '',
                // COLUMN STYLE HOOK: tweak these classes to control "start from here" emphasis.
                semantic.isStartLike ? 'bg-[#14150f] border-white/20 ring-1 ring-white/15' : '',
                isOver ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-[#101204] border-border'
            )}
        >
            {/* Column Header */}
            <div className="mb-3 pl-1 space-y-2 ">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <div className="flex items-center gap-1 text-[#cecfd2]">
                            <Icon className="h-4 w-4 shrink-0 opacity-70" weight={semantic.iconWeight} />
                            <Input
                                value={titleDraft}
                                onChange={(event) => setTitleDraft(event.target.value)}
                                onBlur={handleSaveColumnMeta}
                                disabled={!canEdit}
                                className="h-8 bg-transparent border-none px-1 mb-0! text-[#cecfd2] text-lg! font-semibold shadow-none focus-visible:ring-1"
                            />
                        </div>
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

                {semantic.isStartLike && !semantic.isDoneLike && (
                    // COLUMN STYLE HOOK: tweak this callout copy/classes for your "start here" lane.
                    <div className="px-2 py-1 rounded-md text-[10px] font-medium bg-white/8 text-white/80 w-fit">
                        Start from here
                    </div>
                )}
                {semantic.isStartLike && !semantic.isDoneLike && (
                    // COLUMN STYLE HOOK: tweak this callout copy/classes for your "start here" lane.
                    <span className="text-xs size-2 animate-pulse bg-green-700 absolute top-0 right-0 rounded-full">
                    </span>
                    
                )}

                {semantic.isDoneLike && (
                    // COLUMN STYLE HOOK: tweak this done-lane marker to adjust finished column UI.
                    <div className="px-2 py-1 rounded-md text-[10px] font-medium bg-white/8 text-white/80 w-fit">
                        Completed lane
                    </div>
                )}

                <div className="px-1 text-xs text-white/50">
                    {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                </div>

                {canEdit && isAddingTask && (
                    <div className="space-y-2 px-1 pb-2">
                        <Input
                            autoFocus
                            value={newTaskTitle}
                            onChange={(event) => setNewTaskTitle(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    void handleCreateTask();
                                }
                            }}
                            placeholder="Add a task"
                            className="h-8 mb-2"
                        />
                        <div className="flex gap-2">
                            <Select value={newTaskPriority} onValueChange={(val) => setNewTaskPriority(val ?? 'none')}>
                                <SelectTrigger className={cn("h-7 text-xs px-2 min-w-22.5 border", newTaskPriority === 'none' ? "border-dashed" : "bg-muted font-medium")}>
                                    <SelectValue>{newTaskPriority !== 'none' ? <span className="capitalize">{newTaskPriority}</span> : "Priority"}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Priority: None</SelectItem>
                                    <SelectItem value="high">
                                        <span className="text-red-500 font-medium">High</span>
                                    </SelectItem>
                                    <SelectItem value="medium">
                                        <span className="text-yellow-500 font-medium">Medium</span>
                                    </SelectItem>
                                    <SelectItem value="low">
                                        <span className="text-green-500 font-medium">Low</span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>

                            <Select 
                                value={newTaskCategory}
                                onValueChange={(val) => {
                                    if (val === '__add_category__') {
                                        const newCat = prompt('New category name')?.trim();
                                        if (newCat) {
                                            onAddCategory?.(newCat);
                                            setNewTaskCategory(newCat);
                                        }
                                        return;
                                    }
                                    setNewTaskCategory(val ?? 'none');
                                }}
                            >
                                <SelectTrigger className="h-7 text-xs px-2 min-w-22.5 border-dashed"><SelectValue>{newTaskCategory !== 'none' ? newTaskCategory : "Category"}</SelectValue></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Category: None</SelectItem>
                                    {categoryOptions?.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                    <SelectItem value="__add_category__">
                                        <span className="inline-flex items-center gap-2">
                                            <Plus className="h-3.5 w-3.5" />
                                            Add category
                                        </span>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2 pt-1">
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
                                assigneeLabel={task.assignee ? assigneeLabelById?.[task.assignee] : undefined}
                                categoryOptions={categoryOptions}
                                onAddCategory={onAddCategory}
                                versions={versions}
                            />
                        ))
                    )}
                </SortableContext>
            </div>
        </motion.div>
    );
}
