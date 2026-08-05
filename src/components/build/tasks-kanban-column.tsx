'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, useReducedMotion } from 'motion/react';
import TasksKanbanCard from './tasks-kanban-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Loader2, Minimize2, MoreVertical, Plus, Trash2 } from 'lucide-react';
import type { KanbanColumn, Task, TaskStatus, Version } from '@/lib/types/database';
import { cn } from '@/lib/utils';
import {
    BugIcon,
    CellSignalLowIcon,
    CheckCircleIcon,
    CubeIcon,
    FileTextIcon,
    FlagBannerFoldIcon,
    HourglassMediumIcon,
    MagnifyingGlassIcon,
    RocketIcon,
    SparkleIcon,
    TargetIcon,
} from '@phosphor-icons/react';

interface TasksKanbanColumnProps {
    column: KanbanColumn;
    projectNanoid: string;
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
    isCollapsed?: boolean;
    onToggleCollapsed?: () => void;
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
    projectNanoid,
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
    isCollapsed = false,
    onToggleCollapsed,
}: TasksKanbanColumnProps) {
    const shouldReduceMotion = useReducedMotion();
    // Same droppable id whether collapsed or expanded, so a card dropped on the
    // collapsed strip still resolves to this column in the board's onDragEnd.
    const { setNodeRef, isOver } = useDroppable({
        id: `column:${column.nanoid}`,
    });
    const [titleDraft, setTitleDraft] = useState(column.title);
    const [descriptionDraft, setDescriptionDraft] = useState(column.description ?? '');
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState<string>('none');
    const [newTaskCategory, setNewTaskCategory] = useState<string>('none');
    const [isSubmittingTask, setIsSubmittingTask] = useState(false);
    const semantic = getColumnSemantic(column.title, column.is_done_column);
    const Icon = semantic.icon;
    const sortedTasks = useMemo(
        () =>
            [...tasks].sort((a, b) => {
                const positionA = a.position ?? Number.MAX_SAFE_INTEGER;
                const positionB = b.position ?? Number.MAX_SAFE_INTEGER;

                if (positionA !== positionB) {
                    return positionA - positionB;
                }

                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            }),
        [tasks],
    );

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
        if (!title || isSubmittingTask) return;
        const priority = newTaskPriority === 'none' ? null : newTaskPriority;
        const category = newTaskCategory === 'none' ? null : newTaskCategory;

        // Show a spinner on the Add button while the task persists. The parent
        // prepends the created task to the board on success, so the card appears
        // as soon as this resolves; we keep the composer open on failure.
        setIsSubmittingTask(true);
        try {
            await onCreateTask(title, priority, category);
            setNewTaskTitle('');
            setNewTaskPriority('none');
            setNewTaskCategory('none');
            setIsAddingTask(false);
        } catch (error) {
            console.error('Failed to add task to column:', error);
        } finally {
            setIsSubmittingTask(false);
        }
    };

    // Collapsed state: the column shrinks to a narrow vertical strip showing just
    // the task count and title. It keeps the same droppable id as the expanded
    // column, so a card dragged onto the strip still lands in this column.
    if (isCollapsed) {
        return (
            <motion.div
                ref={setNodeRef}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={shouldReduceMotion ? { duration: 0 } : undefined}
                onClick={onToggleCollapsed}
                role="button"
                aria-label={`Expand ${column.title} column`}
                title={`Expand ${column.title}`}
                className={cn(
                    "w-11 h-full shrink-0 rounded-xl border flex flex-col items-center gap-3 py-4 cursor-pointer transition-colors bg-[#101204]",
                    isOver ? 'border-primary/50 ring-2 ring-primary/30 bg-primary/10' : 'border-border hover:border-white/30'
                )}
            >
                <span className="text-xs font-semibold text-[#cecfd2]">{tasks.length}</span>
                <span className="flex-1 flex items-center justify-center">
                    <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-semibold uppercase tracking-widest text-white/60 whitespace-nowrap">
                        {column.title}
                    </span>
                </span>
            </motion.div>
        );
    }

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
                            <Button
                                variant="link"
                                size="icon-sm"
                                onClick={() => setIsAddingTask((prev) => !prev)}
                                className="rounded-md text-white/80 opacity-100 hover:bg-white/10 hover:text-white"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="link"
                                size="icon-sm"
                                onClick={onToggleCollapsed}
                                title="Collapse column"
                                className="rounded-md text-white/80 opacity-100 hover:bg-white/10 hover:text-white"
                            >
                                <Minimize2 className="h-4 w-4" />
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
                    <div className="space-y-2.5 px-1 pb-2">
                        <Textarea
                            autoFocus
                            rows={2}
                            value={newTaskTitle}
                            onChange={(event) => setNewTaskTitle(event.target.value)}
                            onKeyDown={(event) => {
                                // Enter submits, Shift+Enter inserts a newline.
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault();
                                    void handleCreateTask();
                                }
                            }}
                            disabled={isSubmittingTask}
                            placeholder="What needs to be done?"
                            className="min-h-16 resize-none bg-white/5 border-white/10 text-sm text-[#cecfd2] placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-primary/40"
                        />

                        {/* Priority: on-brand colored segments matching the main task dialog. */}
                        <ToggleGroup
                            className="grid grid-cols-3 w-full border border-white/10 rounded-md bg-white/5 p-0.5"
                            multiple={false}
                            value={newTaskPriority === 'none' ? [] : [newTaskPriority]}
                            onValueChange={(val) => setNewTaskPriority(val[0] ?? 'none')}
                        >
                            <ToggleGroupItem value="low" aria-label="Low priority" className="gap-1.5 text-xs text-white/60 data-[state=on]:bg-green-500/15 data-[state=on]:text-green-400 hover:text-green-400">
                                <CellSignalLowIcon size={14} />
                                Low
                            </ToggleGroupItem>
                            <ToggleGroupItem value="medium" aria-label="Medium priority" className="gap-1.5 text-xs text-white/60 data-[state=on]:bg-yellow-500/15 data-[state=on]:text-yellow-400 hover:text-yellow-400">
                                <HourglassMediumIcon size={14} />
                                Med
                            </ToggleGroupItem>
                            <ToggleGroupItem value="high" aria-label="High priority" className="gap-1.5 text-xs text-white/60 data-[state=on]:bg-red-500/15 data-[state=on]:text-red-400 hover:text-red-400">
                                <FlagBannerFoldIcon size={14} />
                                High
                            </ToggleGroupItem>
                        </ToggleGroup>

                        {/* Category fills the full width instead of a cramped fixed-width select. */}
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
                            <SelectTrigger className="h-8 w-full text-xs bg-white/5 border-white/10 text-[#cecfd2]">
                                <SelectValue>{newTaskCategory !== 'none' ? newTaskCategory : <span className="text-white/40">Category</span>}</SelectValue>
                            </SelectTrigger>
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

                        <div className="flex gap-2 pt-0.5">
                            <Button
                                size="sm"
                                onClick={() => void handleCreateTask()}
                                disabled={isSubmittingTask || !newTaskTitle.trim()}
                                className="min-w-16"
                            >
                                {isSubmittingTask ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setIsAddingTask(false)} disabled={isSubmittingTask}>Cancel</Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Tasks - Droppable area */}
            <div
                ref={setNodeRef}
                className="min-h-25 flex-1 space-y-2 overflow-y-auto pr-1"
            >
                <SortableContext items={sortedTasks.map((task) => `task:${task.nanoid}`)} strategy={verticalListSortingStrategy}>
                    {sortedTasks.length === 0 ? (
                        <div className={cn(
                            "text-center text-white/50 text-sm py-8 rounded-xl border-2 border-dashed transition-colors",
                            isOver ? 'border-primary/30 bg-primary/5' : 'border-transparent'
                        )}>
                            Drop tasks here
                        </div>
                    ) : (
                        sortedTasks.map((task) => (
                            <TasksKanbanCard
                                key={task.nanoid}
                                task={task}
                                projectNanoid={projectNanoid}
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
