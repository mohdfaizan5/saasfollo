import { getTasksByStatus } from '@/lib/actions/tasks';
import { getVersions } from '@/lib/actions/versions';
import { getProjectCollaborators } from '@/lib/actions/collaborators';
import { createClient } from '@/lib/server';
import { TasksClient } from '@/components/tasks/tasks-client';
import type { TaskView } from '@/components/tasks/task-view-toggle';

interface TasksPageProps {
    params: Promise<{ projectId: string }>;
    searchParams: Promise<{ view?: string }>;
}

export default async function TasksPage({ params, searchParams }: TasksPageProps) {
    const { projectId } = await params;
    const { view } = await searchParams;
    const projectIdNum = parseInt(projectId, 10);

    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [tasksByStatus, versions, collaborators] = await Promise.all([
        getTasksByStatus(projectIdNum),
        getVersions(projectIdNum),
        getProjectCollaborators(projectIdNum),
    ]);

    // Validate view param - default to kanban
    const initialView: TaskView = view === 'todo' ? 'todo' : 'kanban';

    return (
        <TasksClient
            initialTasks={tasksByStatus}
            projectId={projectIdNum}
            versions={versions}
            collaborators={collaborators}
            currentUserId={user?.id || ''}
            initialView={initialView}
        />
    );
}
