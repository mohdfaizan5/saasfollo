/**
 * Server actions for Tasks
 * Uses project nanoid for project lookups, task nanoid for individual task operations.
 * Internal FK references (project_id, version_id) still use numeric IDs.
 */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/server';
import { createAdminClient } from '@/lib/admin';
import type { Task, TaskInsert, TaskUpdate, TaskStatus } from '@/lib/types/database';

/**
 * Helper: resolve a project nanoid to its internal numeric id
 */
async function resolveProjectId(projectNanoid: string): Promise<number> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('nanoid', projectNanoid)
        .single();

    if (!error && data) {
        return data.id;
    }

    if (user) {
        try {
            const admin = createAdminClient();
            const { data: adminProject } = await admin
                .from('projects')
                .select('id, user_id')
                .eq('nanoid', projectNanoid)
                .maybeSingle();

            if (adminProject) {
                if (adminProject.user_id === user.id) {
                    return adminProject.id;
                }

                const { data: membership } = await supabase
                    .from('project_collaborators')
                    .select('id')
                    .eq('project_id', adminProject.id)
                    .eq('user_id', user.id)
                    .not('accepted_at', 'is', null)
                    .maybeSingle();

                if (membership) {
                    return adminProject.id;
                }
            }
        } catch {
            // ignore admin fallback errors and throw canonical not found below
        }
    }

    throw new Error('Project not found');
}

/**
 * Get all tasks for a project, optionally filtered by version
 * versionId is the numeric DB id (used for FK filtering)
 */
export async function getTasks(projectNanoid: string, versionId?: number): Promise<Task[]> {
    const supabase = await createClient();
    const projectId = await resolveProjectId(projectNanoid);

    let query = supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (versionId) {
        query = query.eq('version_id', versionId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching tasks:', error);
        throw new Error('Failed to fetch tasks');
    }

    return data || [];
}

/**
 * Get tasks grouped by status for a project
 */
export async function getTasksByStatus(projectNanoid: string, versionId?: number): Promise<Record<TaskStatus, Task[]>> {
    const tasks = await getTasks(projectNanoid, versionId);

    const grouped: Record<TaskStatus, Task[]> = {
        now: [],
        next: [],
        later: [],
        done: [],
    };

    tasks.forEach((task) => {
        if (grouped[task.status]) {
            grouped[task.status].push(task);
        }
    });

    return grouped;
}

/**
 * Create a new task
 * Accepts project nanoid, resolves to numeric id internally
 */
export async function createTask(projectNanoid: string, task: Omit<TaskInsert, 'project_id'>): Promise<Task> {
    const supabase = await createClient();
    const projectId = await resolveProjectId(projectNanoid);

    const { data, error } = await supabase
        .from('tasks')
        .insert({
            ...task,
            project_id: projectId,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating task:', error);
        throw new Error('Failed to create task');
    }

    revalidatePath(`/projects/${projectNanoid}`);
    return data;
}

/**
 * Update an existing task (lookup by task nanoid)
 */
export async function updateTask(taskNanoid: string, projectNanoid: string, updates: TaskUpdate): Promise<Task> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('tasks')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('nanoid', taskNanoid)
        .select()
        .single();

    if (error) {
        console.error('Error updating task:', error);
        throw new Error('Failed to update task');
    }

    revalidatePath(`/projects/${projectNanoid}`);
    return data;
}

/**
 * Update task status (lookup by task nanoid)
 */
export async function updateTaskStatus(taskNanoid: string, projectNanoid: string, status: TaskStatus): Promise<Task> {
    return updateTask(taskNanoid, projectNanoid, { status });
}

/**
 * Delete a task (lookup by task nanoid)
 */
export async function deleteTask(taskNanoid: string, projectNanoid: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('nanoid', taskNanoid);

    if (error) {
        console.error('Error deleting task:', error);
        throw new Error('Failed to delete task');
    }

    revalidatePath(`/projects/${projectNanoid}`);
}

/**
 * Get task counts by status for a project
 */
export async function getTaskCounts(projectNanoid: string): Promise<Record<TaskStatus, number>> {
    const tasks = await getTasks(projectNanoid);

    const counts: Record<TaskStatus, number> = {
        now: 0,
        next: 0,
        later: 0,
        done: 0,
    };

    tasks.forEach((task) => {
        if (counts[task.status] !== undefined) {
            counts[task.status]++;
        }
    });

    return counts;
}

/**
 * Remove a category from all tasks in a project
 */
export async function clearCategoryFromTasks(projectNanoid: string, category: string): Promise<void> {
    const numericProjectId = await resolveProjectId(projectNanoid);
    const supabase = await createClient();

    const { error } = await supabase
        .from('tasks')
        .update({ category: null })
        .eq('project_id', numericProjectId)
        .eq('category', category);

    if (error) {
        console.error('Error clearing category:', error);
        throw new Error('Failed to clear category');
    }

    revalidatePath(/projects/ + projectNanoid);
}
