import { getTasksByStatus } from '@/lib/actions/tasks';
import { getKanbanColumns } from '@/lib/actions/kanban-columns';
import { getVersions } from '@/lib/actions/versions';
import { getProjectCollaborators } from '@/lib/actions/collaborators';
import { createClient } from '@/lib/server';
// NOTE: The following import was using '@/components/tasks/tasks-client' but has been replaced to '@/components/build/tasks-client' 
// for frontend nomenclature change from "tasks" to "build" while keeping backend logic unchanged
import { TasksClient } from '@/components/build/tasks-client';
// NOTE: The following import was using '@/components/tasks/task-view-toggle' but has been replaced to '@/components/build/task-view-toggle' 
// for frontend nomenclature change from "tasks" to "build" while keeping backend logic unchanged
import type { TaskView } from '@/components/build/task-view-toggle';

export const metadata = {
    title: 'Build',
};

interface TasksPageProps {
    params: Promise<{ projectId: string }>;
    searchParams: Promise<{ view?: string }>;
}

export default async function TasksPage({ params, searchParams }: TasksPageProps) {
    const { projectId } = await params;
    const { view } = await searchParams;

    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // projectId is now the nanoid string - pass directly
    // NOTE: The following backend calls remain unchanged as they use the original 'tasks' nomenclature
    const [tasksByStatus, kanbanColumns, versions, collaborators] = await Promise.all([
        getTasksByStatus(projectId),
        getKanbanColumns(projectId),
        getVersions(projectId),
        getProjectCollaborators(projectId),
    ]);

    // Validate view param - default to kanban
    const initialView: TaskView = view === 'todo' ? 'todo' : 'kanban';

    // Comments I added(for easy tweaking)
    // Column icon keyword rules (editable): add your own keywords/icon pairs here.
    // COLUMN STYLE HOOK: tweak these classes to control done-column appearance.
    // COLUMN STYLE HOOK: tweak these classes to control "start from here" emphasis.
    // COLUMN STYLE HOOK: tweak this callout copy/classes for your "start here" lane.
    // COLUMN STYLE HOOK: tweak this done-lane marker to adjust finished column UI.
    // CATEGORY STYLE HOOK: tweak these classes if you want stronger/lighter category contrast.
    return (
        <TasksClient
            initialTasks={tasksByStatus}
            initialColumns={kanbanColumns}
            projectId={projectId}
            versions={versions}
            collaborators={collaborators}
            currentUserId={user?.id || ''}
            initialView={initialView}
        />
    );
}