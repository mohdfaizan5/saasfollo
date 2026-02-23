'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/server';
import type {
    GrowthPlan,
    GrowthActivity,
    GrowthLog,
    GrowthPlanInsert,
    GrowthActivityInsert,
    GrowthLogInsert,
    GrowthActivityType
} from '@/lib/types/database';

export interface GrowthPlanWithDetails extends GrowthPlan {
    activities: GrowthActivityWithLogs[];
}

export interface GrowthActivityWithLogs extends GrowthActivity {
    logs: GrowthLog[];
}

export async function getGrowthPlan(versionId: number): Promise<GrowthPlanWithDetails | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('growth_plans')
        .select(`
      *,
      activities:growth_activities (
        *,
        logs:growth_logs (*)
      )
    `)
        .eq('version_id', versionId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') { // not found
            return null;
        }
        console.error('Error fetching growth plan:', error);
        throw new Error('Failed to fetch growth plan');
    }

    return data as GrowthPlanWithDetails;
}

export async function createGrowthPlan(
    projectId: number,
    versionId: number,
    deadline: Date,
    activities: Array<{ type: GrowthActivityType; target: number; customName?: string }>
): Promise<GrowthPlan> {
    const supabase = await createClient();

    // 1. Create Growth Plan
    const { data: plan, error: planError } = await supabase
        .from('growth_plans')
        .insert({
            project_id: projectId,
            version_id: versionId,
            deadline: deadline.toISOString(),
        })
        .select()
        .single();

    if (planError) {
        console.error('Error creating growth plan:', planError);
        throw new Error('Failed to create growth plan');
    }

    // 2. Insert Activities
    const activitiesToInsert = activities.map(a => ({
        growth_plan_id: plan.id,
        type: a.type,
        target_value: a.target,
        custom_name: a.customName || null,
        completed_value: 0
    }));

    const { error: activitiesError } = await supabase
        .from('growth_activities')
        .insert(activitiesToInsert);

    if (activitiesError) {
        console.error('Error creating growth activities:', activitiesError);
        // Might want to rollback the plan creation if this was a real transaction
        throw new Error('Failed to create growth activities');
    }

    revalidatePath('/projects');
    return plan;
}

export async function logGrowthActivity(
    activityId: number,
    quantity: number,
    note?: string
): Promise<GrowthLog> {
    const supabase = await createClient();

    // Ensure we do this in a single pass if we can, but we need to update activity completed_value too
    // In a strict setup, we'd use a postgres function or trigger. Here we do it via application logic.

    const { data: latestLog, error: logError } = await supabase
        .from('growth_logs')
        .insert({
            growth_activity_id: activityId,
            quantity,
            note: note || null,
        })
        .select()
        .single();

    if (logError) {
        console.error('Error logging growth activity:', logError);
        throw new Error('Failed to log growth activity');
    }

    // Fetch current activity completed_value
    const { data: activity } = await supabase
        .from('growth_activities')
        .select('completed_value')
        .eq('id', activityId)
        .single();

    if (activity) {
        await supabase
            .from('growth_activities')
            .update({
                completed_value: activity.completed_value + quantity
            })
            .eq('id', activityId);
    }

    revalidatePath('/projects');
    return latestLog;
}
