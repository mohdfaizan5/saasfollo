import { getTasksByStatus } from '@/lib/actions/tasks';
import { getVersions } from '@/lib/actions/versions';
import { TasksClient } from '@/components/tasks/tasks-client';

interface TasksPageProps {
    params: Promise<{ projectId: string }>;
}

export default async function TasksPage({ params }: TasksPageProps) {
    const { projectId } = await params;
    const projectIdNum = parseInt(projectId, 10);

    const [tasksByStatus, versions] = await Promise.all([
        getTasksByStatus(projectIdNum),
        getVersions(projectIdNum),
    ]);

    return (
        <TasksClient
            initialTasks={tasksByStatus}
            projectId={projectIdNum}
            versions={versions}
        />
    );
}
