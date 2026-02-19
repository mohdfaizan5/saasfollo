/**
 * Server actions for Content Planning features (V1)
 * Handles CRUD operations for content cards and user workflows
 */

'use server';

import { createClient } from '@/lib/server';
import { revalidatePath } from 'next/cache';
import type {
    ContentCard,
    UserWorkflow,
    CreateContentCardInput,
    UpdateContentCardInput,
    CreateUserWorkflowInput,
    UpdateUserWorkflowInput,
    ContentCardWithRelations,
} from '@/types/planning';

// ============================================
// USER WORKFLOWS
// ============================================

/**
 * Get the current user's workflow configuration
 */
export async function getUserWorkflow(): Promise<UserWorkflow | null> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await supabase
        .from('user_workflows')
        .select('*')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Error fetching workflow:', error);
        throw new Error('Failed to fetch workflow');
    }

    return data;
}

/**
 * Create a new user workflow (onboarding)
 */
export async function createUserWorkflow(input: CreateUserWorkflowInput): Promise<UserWorkflow> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await supabase
        .from('user_workflows')
        .insert({
            user_id: user.id,
            columns: input.columns,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating workflow:', error);
        throw new Error('Failed to create workflow');
    }

    revalidatePath('/app/planning');
    return data;
}

/**
 * Update user workflow columns
 */
export async function updateUserWorkflow(input: UpdateUserWorkflowInput): Promise<UserWorkflow> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await supabase
        .from('user_workflows')
        .update({
            columns: input.columns,
        })
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating workflow:', error);
        throw new Error('Failed to update workflow');
    }

    revalidatePath('/app/planning');
    return data;
}

// ============================================
// CONTENT CARDS
// ============================================

/**
 * Get all content cards for the current user
 */
export async function getContentCards(): Promise<ContentCardWithRelations[]> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await supabase
        .from('content')
        .select(`
            *,
            idea:ideas(id, title, content),
            series:series(id, name)
        `)
        .eq('user_id', user.id)
        .order('order', { ascending: true });

    if (error) {
        console.error('Error fetching content cards:', error);
        throw new Error('Failed to fetch content cards');
    }

    return data as ContentCardWithRelations[];
}

/**
 * Create a new content card
 */
export async function createContentCard(input: CreateContentCardInput): Promise<ContentCard> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Get the highest order number in the target column
    const { data: maxOrderData } = await supabase
        .from('content')
        .select('order')
        .eq('user_id', user.id)
        .eq('column_id', input.column_id)
        .order('order', { ascending: false })
        .limit(1)
        .single();

    const nextOrder = maxOrderData ? maxOrderData.order + 1 : 0;

    const { data, error } = await supabase
        .from('content')
        .insert({
            user_id: user.id,
            title: input.title,
            description: input.description || null,
            idea_id: input.idea_id || null,
            platforms: input.platforms,
            content_type: input.content_type || null,
            series_id: input.series_id || null,
            column_id: input.column_id,
            order: input.order ?? nextOrder,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating content card:', error);
        throw new Error('Failed to create content card');
    }

    revalidatePath('/app/planning');
    return data;
}

/**
 * Update a content card
 */
export async function updateContentCard(id: string, input: UpdateContentCardInput): Promise<ContentCard> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await supabase
        .from('content')
        .update(input)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error updating content card:', error);
        throw new Error('Failed to update content card');
    }

    revalidatePath('/app/planning');
    return data;
}

/**
 * Move a content card to a different column
 */
export async function moveCardToColumn(id: string, columnId: string, order: number): Promise<ContentCard> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { data, error } = await supabase
        .from('content')
        .update({
            column_id: columnId,
            order,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error moving card:', error);
        throw new Error('Failed to move card');
    }

    revalidatePath('/app/planning');
    return data;
}

/**
 * Toggle the checked state of a content card
 */
export async function toggleCardChecked(id: string): Promise<ContentCard> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // First get the current state
    const { data: currentCard } = await supabase
        .from('content')
        .select('checked')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (!currentCard) {
        throw new Error('Card not found');
    }

    // Toggle it
    const { data, error } = await supabase
        .from('content')
        .update({ checked: !currentCard.checked })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

    if (error) {
        console.error('Error toggling card:', error);
        throw new Error('Failed to toggle card');
    }

    revalidatePath('/app/planning');
    return data;
}

/**
 * Delete a content card
 */
export async function deleteContentCard(id: string): Promise<void> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting card:', error);
        throw new Error('Failed to delete card');
    }

    revalidatePath('/app/planning');
}

/**
 * Create a content card from an idea (when moving idea to planning)
 */
export async function createContentFromIdea(ideaId: string, columnId: string): Promise<ContentCard> {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // Fetch the idea
    const { data: idea, error: ideaError } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', ideaId)
        .eq('user_id', user.id)
        .single();

    if (ideaError || !idea) {
        throw new Error('Idea not found');
    }

    // Create content card from idea
    return createContentCard({
        title: idea.title,
        description: idea.raw_text || null,
        idea_id: ideaId,
        platforms: idea.target_platform ? [idea.target_platform] : [],
        content_type: null,
        series_id: idea.linked_series_id,
        column_id: columnId,
    });
}
