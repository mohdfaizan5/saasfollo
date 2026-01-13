'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/server';
import type { Task, TaskInsert, TaskUpdate, TaskStatus } from '@/lib/types/database';

/**
 * Get all tasks for a project
 */
export async function getTasks(projectId: number, versionId?: number): Promise<Task[]> {
    const supabase = await createClient();

    let query = supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (versionId !== undefined) {
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
 * Get tasks grouped by status
 */
export async function getTasksByStatus(projectId: number, versionId?: number): Promise<Record<TaskStatus, Task[]>> {
    const tasks = await getTasks(projectId, versionId);

    const grouped: Record<TaskStatus, Task[]> = {
        now: [],
        next: [],
        later: [],
        done: [],
    };

    tasks.forEach((task) => {
        grouped[task.status].push(task);
    });

    return grouped;
}

/**
 * Get a single task by ID
 */
export async function getTask(taskId: number): Promise<Task | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('Error fetching task:', error);
        throw new Error('Failed to fetch task');
    }

    return data;
}

/**
 * Create a new task
 */
export async function createTask(task: TaskInsert): Promise<Task> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('tasks')
        .insert(task)
        .select()
        .single();

    if (error) {
        console.error('Error creating task:', error);
        throw new Error('Failed to create task');
    }

    revalidatePath(`/projects/${task.project_id}`);
    return data;
}

/**
 * Update an existing task
 */
export async function updateTask(taskId: number, projectId: number, updates: TaskUpdate): Promise<Task> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('tasks')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();

    if (error) {
        console.error('Error updating task:', error);
        throw new Error('Failed to update task');
    }

    revalidatePath(`/projects/${projectId}`);
    return data;
}

/**
 * Update task status (quick action)
 */
export async function updateTaskStatus(taskId: number, projectId: number, status: TaskStatus): Promise<Task> {
    return updateTask(taskId, projectId, { status });
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: number, projectId: number): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

    if (error) {
        console.error('Error deleting task:', error);
        throw new Error('Failed to delete task');
    }

    revalidatePath(`/projects/${projectId}`);
}

/**
 * Get task counts by status for a project
 */
export async function getTaskCounts(projectId: number): Promise<Record<TaskStatus, number>> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('tasks')
        .select('status')
        .eq('project_id', projectId);

    if (error) {
        console.error('Error fetching task counts:', error);
        throw new Error('Failed to fetch task counts');
    }

    const counts: Record<TaskStatus, number> = {
        now: 0,
        next: 0,
        later: 0,
        done: 0,
    };

    (data || []).forEach((task) => {
        counts[task.status as TaskStatus]++;
    });

    return counts;
}
