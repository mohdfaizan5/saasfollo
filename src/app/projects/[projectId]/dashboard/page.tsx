import { Layers, CheckSquare, Clock, CheckCircle2, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getProjectWithActiveVersion } from '@/lib/actions/projects';
import { getTaskCounts, getTasks } from '@/lib/actions/tasks';
import Link from 'next/link';
import { Coolshape } from 'coolshapes-react';

interface DashboardPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
    const { projectId } = await params;
    const projectIdNum = parseInt(projectId, 10);

    const [project, taskCounts, recentTasks] = await Promise.all([
        getProjectWithActiveVersion(projectIdNum),
        getTaskCounts(projectIdNum),
        getTasks(projectIdNum),
    ]);

    if (!project) {
        return <div>Project not found</div>;
    }

    const nowTasks = recentTasks.filter(t => t.status === 'now').slice(0, 5);
    const totalTasks = taskCounts.now + taskCounts.next + taskCounts.later + taskCounts.done;
    const completedPercent = totalTasks > 0 ? Math.round((taskCounts.done / totalTasks) * 100) : 0;

    return (
        <div className="p-6 space-y-6 bg-[#F6F6F6] ">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
                {project.description && (
                    <p className="text-muted-foreground mt-1">{project.description}</p>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Active Version */}
                <Card className="p-4 col-span-4 bg-primary relative text-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Layers className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted">Active Version</p>
                            <p className="font-semibold">
                                {project.active_version?.name || 'No active version'}
                            </p>
                        </div>
                        <Coolshape className='absolute -top-8 -left-8' type="star" index={3} size={80} noise={true} />
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Layers className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Active Version</p>
                            <p className="font-semibold">
                                {project.active_version?.name || 'No active version'}
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Now Tasks */}
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                            <Clock className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Working On</p>
                            <p className="font-semibold">{taskCounts.now} tasks</p>
                        </div>
                    </div>
                </Card>

                {/* Next Tasks */}
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <CheckSquare className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Up Next</p>
                            <p className="font-semibold">{taskCounts.next} tasks</p>
                        </div>
                    </div>
                </Card>

                {/* Completed */}
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Completed</p>
                            <p className="font-semibold">{completedPercent}% done</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Current Focus */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Now Tasks */}
                <Card className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-500" />
                            Working On Now
                        </h2>
                        <Link href={`/projects/${projectId}/tasks`}>
                            <Button variant="ghost" size="sm">View All</Button>
                        </Link>
                    </div>

                    {nowTasks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p className="mb-3">No tasks in progress</p>
                            <Link href={`/projects/${projectId}/tasks`}>
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
                </Card>

                {/* Quick Actions */}
                <Card className="p-5">
                    <h2 className="font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Link href={`/projects/${projectId}/tasks`}>
                            <Button variant="outline" className="w-full justify-start">
                                <CheckSquare className="h-4 w-4 mr-2" />
                                Manage Tasks
                            </Button>
                        </Link>
                        <Link href={`/projects/${projectId}/versions`}>
                            <Button variant="outline" className="w-full justify-start">
                                <Layers className="h-4 w-4 mr-2" />
                                Versions
                            </Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
