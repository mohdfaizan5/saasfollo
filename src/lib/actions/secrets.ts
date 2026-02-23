/**
 * Server actions for Secrets
 * Uses project nanoid for project lookups, secret nanoid for individual secret operations.
 * PIN-related functions remain unchanged (they use user_id, not project_id).
 */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/server';
import type { Secret, SecretInsert, UserSettings } from '@/lib/types/database';

/**
 * Simple hash function for PIN (client-side obfuscation only)
 * NOT cryptographically secure - for UX protection only
 */
function hashPin(pin: string): string {
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
        const char = pin.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return `pin_${Math.abs(hash).toString(36)}`;
}

/**
 * Simple encode function (client-side obfuscation only)
 */
function encodeValue(value: string): string {
    return Buffer.from(value).toString('base64');
}

/**
 * Simple decode function
 */
function decodeValue(encoded: string): string {
    return Buffer.from(encoded, 'base64').toString('utf-8');
}

/**
 * Helper: resolve a project nanoid to its internal numeric id
 */
async function resolveProjectId(projectNanoid: string): Promise<number> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('nanoid', projectNanoid)
        .single();

    if (error || !data) {
        throw new Error('Project not found');
    }
    return data.id;
}

/**
 * Get user settings (creates if not exists)
 */
export async function getUserSettings(): Promise<UserSettings | null> {
    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
        throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') {
            return null;
        }
        console.error('Error fetching user settings:', error);
        throw new Error('Failed to fetch user settings');
    }

    return data;
}

/**
 * Check if user has set up a PIN
 */
export async function hasPinSetup(): Promise<boolean> {
    const settings = await getUserSettings();
    return !!settings?.secrets_pin_hash;
}

/**
 * Set up or update PIN
 */
export async function setupPin(pin: string): Promise<void> {
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
        throw new Error('PIN must be exactly 6 digits');
    }

    const supabase = await createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
        throw new Error('Not authenticated');
    }

    const pinHash = hashPin(pin);

    const { error } = await supabase
        .from('user_settings')
        .upsert({
            user_id: userData.user.id,
            secrets_pin_hash: pinHash,
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id',
        });

    if (error) {
        console.error('Error setting up PIN:', error);
        throw new Error('Failed to set up PIN');
    }
}

/**
 * Verify PIN
 */
export async function verifyPin(pin: string): Promise<boolean> {
    const settings = await getUserSettings();
    if (!settings?.secrets_pin_hash) {
        throw new Error('PIN not set up');
    }

    return settings.secrets_pin_hash === hashPin(pin);
}

/**
 * Get all secrets for a project (by project nanoid)
 */
export async function getSecrets(projectNanoid: string): Promise<Secret[]> {
    const supabase = await createClient();
    const projectId = await resolveProjectId(projectNanoid);

    const { data, error } = await supabase
        .from('secrets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching secrets:', error);
        throw new Error('Failed to fetch secrets');
    }

    return data || [];
}

/**
 * Create a new secret
 * Accepts project nanoid, resolves internally
 */
export async function createSecret(projectNanoid: string, secret: Omit<SecretInsert, 'project_id'>): Promise<Secret> {
    const supabase = await createClient();
    const projectId = await resolveProjectId(projectNanoid);

    const encodedValue = encodeValue(secret.encrypted_value);

    const { data, error } = await supabase
        .from('secrets')
        .insert({
            ...secret,
            project_id: projectId,
            encrypted_value: encodedValue,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating secret:', error);
        throw new Error('Failed to create secret');
    }

    revalidatePath(`/projects/${projectNanoid}`);
    return data;
}

/**
 * Reveal a secret value (by secret nanoid, requires PIN verification first)
 */
export async function revealSecret(secretNanoid: string, pin: string): Promise<string> {
    const isValid = await verifyPin(pin);
    if (!isValid) {
        throw new Error('Invalid PIN');
    }

    const supabase = await createClient();

    const { data, error } = await supabase
        .from('secrets')
        .select('encrypted_value')
        .eq('nanoid', secretNanoid)
        .single();

    if (error) {
        console.error('Error fetching secret:', error);
        throw new Error('Failed to fetch secret');
    }

    return decodeValue(data.encrypted_value);
}

/**
 * Delete a secret (by secret nanoid)
 */
export async function deleteSecret(secretNanoid: string, projectNanoid: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('secrets')
        .delete()
        .eq('nanoid', secretNanoid);

    if (error) {
        console.error('Error deleting secret:', error);
        throw new Error('Failed to delete secret');
    }

    revalidatePath(`/projects/${projectNanoid}`);
}
