import { Layers, CheckSquare, Clock, CheckCircle2, Plus, TrendingUp, CalendarDays, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getProjectWithActiveVersion } from '@/lib/actions/projects';
import { getTasks } from '@/lib/actions/tasks';
import { getGrowthPlan } from '@/lib/actions/growth';
import { getProjectCollaborators } from '@/lib/actions/collaborators';
import { createClient } from '@/lib/server';
import { DashboardRangeToggle } from '@/components/dashboard/dashboard-range-toggle';
import { DashboardChartsSection } from '@/components/dashboard/dashboard-charts-section';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Link from 'next/link';
import { Coolshape } from 'coolshapes-react';
import type { Task } from '@/lib/types/database';
import Gauge from '@/components/gauge';
import { HourglassSimpleLowIcon, MegaphoneIcon, UsersIcon } from '@phosphor-icons/react/dist/ssr';

export const metadata = {
    title: 'Dashboard',
};

interface DashboardPageProps {
    params: Promise<{ projectId: string }>;
    searchParams: Promise<{ range?: string }>;
}

type DashboardRange = 'today' | 'week' | 'month';

const RANGE_DAYS: Record<DashboardRange, number> = {
    today: 1,
    week: 7,
    month: 30,
};

function parseRange(value?: string): DashboardRange {
    if (value === 'today' || value === 'week' || value === 'month') {
        return value;
    }
    return 'week';
}

function startOfDay(date: Date): Date {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
}

function getRangeWindow(range: DashboardRange) {
    const now = new Date();
    if (range === 'today') {
        const start = startOfDay(now);
        const previousStart = new Date(start);
        previousStart.setDate(previousStart.getDate() - 1);
        return {
            now,
            start,
            previousStart,
            previousEnd: start,
            days: 1,
        };
    }

    const days = RANGE_DAYS[range];
    const end = now;
    const start = startOfDay(new Date(end));
    start.setDate(start.getDate() - (days - 1));
    const previousStart = new Date(start);
    previousStart.setDate(previousStart.getDate() - days);

    return {
        now: end,
        start,
        previousStart,
        previousEnd: start,
        days,
    };
}

function isInWindow(value: string, start: Date, end: Date): boolean {
    const date = new Date(value);
    return date >= start && date <= end;
}

function isInPreviousWindow(value: string, previousStart: Date, previousEnd: Date): boolean {
    const date = new Date(value);
    return date >= previousStart && date < previousEnd;
}

function formatTimeLeft(deadline?: string | null): string {
    if (!deadline) return 'No deadline set';

    const now = new Date();
    const target = new Date(deadline);
    const msPerDay = 1000 * 60 * 60 * 24;
    const diffDays = Math.ceil((target.getTime() - now.getTime()) / msPerDay);

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays < 7) return `${diffDays} days left`;

    const weeks = Math.ceil(diffDays / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} left`;
}

function formatFinishLineEstimate(days: number | null): string {
    if (!days || !Number.isFinite(days)) return 'Need more completed tasks to estimate';
    if (days < 1) return 'Likely finish within a day';
    if (days < 7) return `${Math.ceil(days)} days to finish at current pace`;
    const weeks = Math.ceil(days / 7);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} to finish at current pace`;
}

function getInitials(value: string): string {
    const parts = value
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2);

    if (parts.length === 0) return 'NA';
    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

function formatAxisLabel(date: Date, range: DashboardRange): string {
    if (range === 'today') {
        return `${date.getHours().toString().padStart(2, '0')}:00`;
    }
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

function buildDailySeries(tasks: Task[], start: Date, days: number, range: DashboardRange) {
    return Array.from({ length: days }).map((_, index) => {
        const dayStart = new Date(start);
        dayStart.setDate(start.getDate() + index);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);

        const created = tasks.filter((task) => {
            const createdAt = new Date(task.created_at);
            return createdAt >= dayStart && createdAt < dayEnd;
        }).length;

        const completed = tasks.filter((task) => {
            const updatedAt = new Date(task.updated_at);
            return task.is_completed && updatedAt >= dayStart && updatedAt < dayEnd;
        }).length;

        return {
            label: formatAxisLabel(dayStart, range),
            created,
            completed,
        };
    });
}

export default async function DashboardPage({ params, searchParams }: DashboardPageProps) {
    const { projectId } = await params;
    const { range: rangeParam } = await searchParams;
    const range = parseRange(rangeParam);
    const window = getRangeWindow(range);

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [project, allTasks, collaborators] = await Promise.all([
        getProjectWithActiveVersion(projectId),
        getTasks(projectId),
        getProjectCollaborators(projectId),
    ]);

    if (!project) {
        return <div>Project not found</div>;
    }

    const scopedTasks = project.active_version_id
        ? allTasks.filter((task) => task.version_id === project.active_version_id)
        : allTasks;

    const growthPlan = project.active_version_id
        ? await getGrowthPlan(project.active_version_id)
        : null;

    const completedInRange = scopedTasks.filter((task) =>
        task.is_completed && isInWindow(task.updated_at, window.start, window.now),
    );
    const createdInRange = scopedTasks.filter((task) =>
        isInWindow(task.created_at, window.start, window.now),
    );

    const completedInPreviousRange = scopedTasks.filter((task) =>
        task.is_completed && isInPreviousWindow(task.updated_at, window.previousStart, window.previousEnd),
    );

    const openTasks = scopedTasks.filter((task) => task.status !== 'done');
    const nowTasks = scopedTasks.filter((task) => task.status === 'now').slice(0, 5);
    const nextTasksCount = scopedTasks.filter((task) => task.status === 'next').length;
    const laterTasksCount = scopedTasks.filter((task) => task.status === 'later').length;

    const totalScopedTasks = scopedTasks.length;
    const completedScopedTasks = scopedTasks.filter((task) => task.status === 'done').length;
    const completedPercent = totalScopedTasks > 0
        ? Math.round((completedScopedTasks / totalScopedTasks) * 100)
        : 0;

    const workDonePercent = (completedInRange.length + createdInRange.length) > 0
        ? Math.round((completedInRange.length / (completedInRange.length + createdInRange.length)) * 100)
        : 0;
    const netProgress = completedInRange.length - createdInRange.length;
    const velocityPerDay = completedInRange.length / window.days;
    const finishLineDays = velocityPerDay > 0 ? openTasks.length / velocityPerDay : null;
    const completedDeltaVsPrevious = completedInRange.length - completedInPreviousRange.length;

    const collaboratorNameById = new Map(
        collaborators.map((collab) => [collab.user_id, collab.email.split('@')[0]]),
    );
    const completedByAssignee = completedInRange.reduce<Record<string, number>>((acc, task) => {
        const key = task.assignee || 'unassigned';
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
    }, {});
    const topContributor = Object.entries(completedByAssignee)
        .sort((left, right) => right[1] - left[1])[0];

    const topContributorLabel = topContributor
        ? topContributor[0] === 'unassigned'
            ? 'Unassigned'
            : topContributor[0] === user?.id
                ? 'You'
                : collaboratorNameById.get(topContributor[0]) ?? topContributor[0]
        : null;

    const totalCompletedInVersion = scopedTasks.filter((task) => task.is_completed).length;
    const completedByAssigneeInVersion = scopedTasks
        .filter((task) => task.is_completed)
        .reduce<Record<string, number>>((acc, task) => {
            const key = task.assignee || 'unassigned';
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        }, {});

    const collaboratorById = new Map(
        collaborators.map((collab) => [collab.user_id, collab]),
    );

    const contributorsInVersion = Object.entries(completedByAssigneeInVersion)
        .sort((left, right) => right[1] - left[1])
        .map(([assigneeId, completedCount]) => {
            if (assigneeId === 'unassigned') {
                return {
                    id: assigneeId,
                    label: 'Unassigned',
                    completedCount,
                    contributionPercent: totalCompletedInVersion > 0
                        ? Math.round((completedCount / totalCompletedInVersion) * 100)
                        : 0,
                };
            }

            const collaborator = collaboratorById.get(assigneeId);
            const fallbackLabel = collaborator?.email?.split('@')[0] ?? assigneeId;

            return {
                id: assigneeId,
                label: assigneeId === user?.id ? 'You' : fallbackLabel,
                completedCount,
                contributionPercent: totalCompletedInVersion > 0
                    ? Math.round((completedCount / totalCompletedInVersion) * 100)
                    : 0,
            };
        });

    const growthLogsInRange = growthPlan
        ? growthPlan.activities.flatMap((activity) =>
            activity.logs.filter((log) => isInWindow(log.created_at, window.start, window.now)),
        )
        : [];
    const growthQuantityInRange = growthLogsInRange.reduce((sum, log) => sum + log.quantity, 0);
    const progressedActivitiesInRange = growthPlan
        ? growthPlan.activities.filter((activity) =>
            activity.logs.some((log) => isInWindow(log.created_at, window.start, window.now)),
        ).length
        : 0;
    const stuckActivities = growthPlan
        ? growthPlan.activities.filter((activity) =>
            activity.completed_value < activity.target_value &&
            !activity.logs.some((log) => isInWindow(log.created_at, window.start, window.now)),
        ).length
        : 0;

    const activeVersionDeadline = project.active_version?.deadline ?? null;
    const timeLeftText = formatTimeLeft(activeVersionDeadline);

    const throughputSeries = buildDailySeries(scopedTasks, window.start, window.days, range);
    const statusBreakdown = [
        { status: 'Now', count: scopedTasks.filter((task) => task.status === 'now').length },
        { status: 'Next', count: scopedTasks.filter((task) => task.status === 'next').length },
        { status: 'Later', count: scopedTasks.filter((task) => task.status === 'later').length },
        { status: 'Done', count: scopedTasks.filter((task) => task.status === 'done').length },
    ];
    const growthSeries = Array.from({ length: window.days }).map((_, index) => {
        const dayStart = new Date(window.start);
        dayStart.setDate(window.start.getDate() + index);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayStart.getDate() + 1);

        const quantity = growthLogsInRange
            .filter((log) => {
                const createdAt = new Date(log.created_at);
                return createdAt >= dayStart && createdAt < dayEnd;
            })
            .reduce((sum, log) => sum + log.quantity, 0);

        return {
            label: formatAxisLabel(dayStart, range),
            quantity,
        };
    });

    return (
        <div className=" space-y-4 bg-[#F6F6F6] ">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">{project.name}</h1>
                    {project.description && (
                        <p className="text-muted-foreground mt-1">{project.description}</p>
                    )}
                </div>
                <DashboardRangeToggle />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-12 gap-4">
                {/* Active Version */}
                <Card className="p-4 col-span-12 bg-primary relative text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Layers className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Active Version</p>
                            <p className="font-semibold">
                                {project.active_version?.name || 'No active version'}
                            </p>
                            <p className="text-xs text-white/80 mt-1">
                                {timeLeftText}
                                {activeVersionDeadline ? ` • ${new Date(activeVersionDeadline).toLocaleDateString()}` : ''}
                            </p>
                        </div>
                        <Coolshape className='absolute -top-8 -left-8' type="star" index={3} size={80} noise={true} />
                    </div>
                </Card>
                {/* <Card className="p-4 col-span-12 md:col-span-6 lg:col-span-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Layers className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Version Progress</p>
                            <p className="font-semibold">
                                {completedPercent}% complete
                            </p>
                        </div>
                    </div>
                </Card> */}

                {/* Now Tasks */}
                <Card className="p-4 col-span-12 md:col-span-6 lg:col-span-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                            <Clock className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Completed ({range})</p>
                            <p className="font-semibold">{completedInRange.length} tasks</p>
                        </div>
                    </div>
                </Card>

                {/* Next Tasks */}
                <Card className="p-4 col-span-12 md:col-span-6 lg:col-span-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <CheckSquare className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Created ({range})</p>
                            <p className="font-semibold">{createdInRange.length} tasks</p>
                        </div>
                    </div>
                </Card>

                {/* Completed */}
                {/* <Card className="p-4 col-span-12 md:col-span-6 lg:col-span-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Net Progress</p>
                            <p className="font-semibold">{netProgress >= 0 ? `+${netProgress}` : netProgress}</p>
                        </div>
                    </div>
                </Card> */}
            </div>

            {/* Working On + Left To Do */}
            <div className="grid grid-cols-12 gap-6 max-h-56">
                <Card className="p-5 col-span-12 lg:col-span-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold flex items-center gap-2">
                            {/* <Clock className="h-4 w-4 text-orange-500" /> */}
                            <HourglassSimpleLowIcon size={20} weight="duotone" />
                            Working On
                        </h2>
                    </div>

                    <div className="grid grid-cols-12 gap-3 mb-4">
                        <div className="rounded-lg bg-muted/50 p-3 col-span-6">
                            <p className="text-xs text-muted-foreground">Work Done %</p>
                            <p className="text-lg font-semibold">{workDonePercent}%</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3 col-span-6">
                            <p className="text-xs text-muted-foreground">Velocity</p>
                            <p className="text-lg font-semibold">{velocityPerDay.toFixed(1)}/day</p>
                        </div>
                    </div>

                    <div className="space-y-2 text-sm">
                        {/* <p>
                            {completedDeltaVsPrevious >= 0 ? '↑' : '↓'} {Math.abs(completedDeltaVsPrevious)} vs previous period
                        </p> */}
                        {topContributorLabel && topContributor && (
                            <p>
                                {topContributorLabel} completed the most tasks ({topContributor[1]}) this {range}
                            </p>
                        )}
                    </div>
                </Card>
                <Card className="p-4 border-border/70 max-h-52 overflow-hidden col-span-12 lg:col-span-4">
                    {/* <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <ChartBarIcon className="w-5 h-5 text-green-500" weight="duotone" />
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Overall Progress </p>
                            <p className="font-semibold">{completionRate}% complete</p> */}
                    <div className="flex justify-center items-center  w-full h-100 py-2">
                        <Gauge value={completedPercent} size={250} gap={2} thickness={3} label={`${project.active_version?.name} Progress`} />
                    </div>
                    {/* </div>
                    </div> */}
                </Card>
                {/* <Card className="p-5 col-span-12 lg:col-span-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            Left To Do
                        </h2>
                    </div>

                    <div className="grid grid-cols-12 gap-3 mb-4">
                        <div className="rounded-lg bg-muted/50 p-3 col-span-4">
                            <p className="text-xs text-muted-foreground">Now</p>
                            <p className="text-lg font-semibold">{scopedTasks.filter((task) => task.status === 'now').length}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3 col-span-4">
                            <p className="text-xs text-muted-foreground">Next</p>
                            <p className="text-lg font-semibold">{nextTasksCount}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3 col-span-4">
                            <p className="text-xs text-muted-foreground">Later</p>
                            <p className="text-lg font-semibold">{laterTasksCount}</p>
                        </div>
                    </div>

                    <p className="text-sm text-muted-foreground">{formatFinishLineEstimate(finishLineDays)}</p>
                </Card> */}
                <Card className="p-5 col-span-12 lg:col-span-4 ">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold flex items-center gap-2">
                            <UsersIcon size={20} weight="duotone" color="#2C4839" />
                            {/* <Target className="h-4 w-4 text-[#2C4839]" /> */}
                            People involved in this version
                        </h2>
                    </div>

                    {contributorsInVersion.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No completed tasks yet in this version.</p>
                    ) : (
                        <ul className="space-y-3">
                            {contributorsInVersion.map((person) => (
                                <li
                                    key={person.id}
                                    className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 py-1 px-3"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar size="sm">
                                            <AvatarFallback>{getInitials(person.label)}</AvatarFallback>
                                        </Avatar>
                                        <p className="text-sm font-medium truncate">{person.label}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-semibold">{person.completedCount} completed</p>
                                        <p className="text-xs text-muted-foreground">{person.contributionPercent}% contribution</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </div>

            {/* Current Focus + Growth Pulse */}
            <div className="grid grid-cols-12 gap-6">
                {/* TODO: come back later and reflect on how you can improve. */}
                {/* <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            Working On Now
                        </h2>
                        <Link href={`/projects/${projectId}/build`}>
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                    </div>

                    {nowTasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="mb-3">No tasks in progress</p>
                            <Link href={`/projects/${projectId}/build`}>
                                <Button variant="outline" size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Task
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {nowTasks.map((task) => (
                                <li
                                    key={task.id}
                                    className="p-3 rounded-lg bg-muted/50 flex items-center justify-between"
                                >
                                    <span className="truncate">{task.title}</span>
                                    {task.priority && (
                                        <Badge variant={
                                            task.priority === 'high' ? 'destructive' :
                                                task.priority === 'medium' ? 'default' : 'secondary'
                                        }>
                                            {task.priority}
                                        </Badge>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </Card> */}

                <Card className="p-5 col-span-12">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold flex items-center gap-2">
                            {/* <CalendarDays className="h-4 w-4 text-violet-500" /> */}
                            <MegaphoneIcon size={20} weight="duotone"  className='rotate-12'/>
                            Growth Pulse
                        </h2>
                        <Link href={`/projects/${projectId}/growth`}>
                            <Button variant="ghost" size="sm">Open Growth</Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-12 gap-3 mb-4">
                        <div className="rounded-lg bg-muted/50 p-3 col-span-4">
                            <p className="text-xs text-muted-foreground">Log Volume</p>
                            <p className="text-lg font-semibold">{growthQuantityInRange}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3 col-span-4">
                            <p className="text-xs text-muted-foreground">Active Activities</p>
                            <p className="text-lg font-semibold">{progressedActivitiesInRange}</p>
                        </div>
                        <div className="rounded-lg bg-muted/50 p-3 col-span-4">
                            <p className="text-xs text-muted-foreground">Stuck</p>
                            <p className="text-lg font-semibold">{stuckActivities}</p>
                        </div>
                    </div>

                    {project.active_version?.name ? (
                        <Badge variant="secondary">Active version: {project.active_version.name}</Badge>
                    ) : (
                        <p className="text-sm text-muted-foreground">No active version selected.</p>
                    )}
                </Card>
            </div>

            <DashboardChartsSection
                range={range}
                throughputSeries={throughputSeries}
                growthSeries={growthSeries}
                statusBreakdown={statusBreakdown}
                completionPercent={completedPercent}
            />
        </div>
    );
}
