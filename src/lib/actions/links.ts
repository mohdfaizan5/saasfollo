/**
 * Server actions for Links
 * Uses project nanoid for project lookups, link nanoid for individual link operations.
 */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/server';
import type { Link, LinkInsert, LinkType, LinkUpdate } from '@/lib/types/database';

function normalizeTag(tag?: string | null): string | null {
    const normalized = tag?.trim().replace(/\s+/g, ' ') ?? '';
    return normalized.length > 0 ? normalized : null;
}

/**
 * Detect the type of link based on URL
 */
function detectLinkType(url: string): LinkType {
    const lowercaseUrl = url.toLowerCase();

    if (lowercaseUrl.includes('figma.com')) return 'figma';
    if (lowercaseUrl.includes('github.com')) return 'github';
    if (lowercaseUrl.includes('vercel.com') || lowercaseUrl.includes('vercel.app')) return 'vercel';
    if (lowercaseUrl.includes('notion.so') || lowercaseUrl.includes('notion.site')) return 'notion';
    if (lowercaseUrl.includes('linear.app')) return 'linear';
    if (lowercaseUrl.includes('slack.com')) return 'slack';
    if (lowercaseUrl.includes('discord.com') || lowercaseUrl.includes('discord.gg')) return 'discord';

    return 'generic';
}

/**
 * Extract label from URL (domain + path hint)
 */
function extractLabel(url: string): string {
    try {
        const parsedUrl = new URL(url);
        const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

        if (pathParts.length > 0) {
            const lastPart = pathParts[pathParts.length - 1];
            if (lastPart && lastPart !== 'undefined' && !lastPart.includes('?')) {
                return lastPart.replace(/[-_]/g, ' ').slice(0, 50);
            }
        }

        return parsedUrl.hostname.replace('www.', '');
    } catch {
        return url.slice(0, 50);
    }
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
 * Get all links for a project (by project nanoid)
 */
export async function getLinks(projectNanoid: string): Promise<Link[]> {
    const supabase = await createClient();
    const projectId = await resolveProjectId(projectNanoid);

    const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching links:', error);
        throw new Error('Failed to fetch links');
    }

    return data || [];
}

/**
 * Create a single link
 * Accepts project nanoid, resolves internally
 */
export async function createLink(projectNanoid: string, link: Omit<LinkInsert, 'project_id'>): Promise<Link> {
    const supabase = await createClient();
    const projectId = await resolveProjectId(projectNanoid);

    const detectedType = link.detected_type || detectLinkType(link.url);
    const label = link.label || extractLabel(link.url);
    const tag = normalizeTag(link.tag);

    const { data, error } = await supabase
        .from('links')
        .insert({
            ...link,
            project_id: projectId,
            detected_type: detectedType,
            label,
            tag,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating link:', error);
        throw new Error('Failed to create link');
    }

    revalidatePath(`/projects/${projectNanoid}`);
    return data;
}

/**
 * Create multiple links from a string (comma/space separated)
 */
export async function createLinksFromString(projectNanoid: string, urlString: string, tagInput?: string | null): Promise<Link[]> {
    const projectId = await resolveProjectId(projectNanoid);
    const tag = normalizeTag(tagInput);

    // Split by comma, space, or newline
    const urls = urlString
        .split(/[,\s\n]+/)
        .map((url) => url.trim())
        .filter((url) => {
            try {
                new URL(url);
                return true;
            } catch {
                try {
                    new URL(`https://${url}`);
                    return true;
                } catch {
                    return false;
                }
            }
        })
        .map((url) => {
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                return `https://${url}`;
            }
            return url;
        });

    if (urls.length === 0) {
        throw new Error('No valid URLs found');
    }

    const supabase = await createClient();

    const linksToInsert = urls.map((url) => ({
        project_id: projectId,
        url,
        tag,
        detected_type: detectLinkType(url),
        label: extractLabel(url),
    }));

    const { data, error } = await supabase
        .from('links')
        .insert(linksToInsert)
        .select();

    if (error) {
        console.error('Error creating links:', error);
        throw new Error('Failed to create links');
    }

    revalidatePath(`/projects/${projectNanoid}`);
    return data || [];
}

/**
 * Delete a link (lookup by link nanoid)
 */
export async function deleteLink(linkNanoid: string, projectNanoid: string): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('links')
        .delete()
        .eq('nanoid', linkNanoid);

    if (error) {
        console.error('Error deleting link:', error);
        throw new Error('Failed to delete link');
    }

    revalidatePath(`/projects/${projectNanoid}`);
}

/**
 * Update an existing link (lookup by link nanoid)
 */
export async function updateLink(
    linkNanoid: string,
    projectNanoid: string,
    updates: Pick<LinkUpdate, 'url' | 'tag'>,
): Promise<Link> {
    const supabase = await createClient();

    const payload: Pick<LinkUpdate, 'url' | 'tag' | 'detected_type' | 'label'> = {};

    if (typeof updates.url === 'string') {
        const trimmedUrl = updates.url.trim();
        if (!trimmedUrl) {
            throw new Error('URL cannot be empty');
        }

        const normalizedUrl =
            trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')
                ? trimmedUrl
                : `https://${trimmedUrl}`;

        try {
            new URL(normalizedUrl);
        } catch {
            throw new Error('Invalid URL');
        }

        payload.url = normalizedUrl;
        payload.detected_type = detectLinkType(normalizedUrl);
        payload.label = extractLabel(normalizedUrl);
    }

    if ('tag' in updates) {
        payload.tag = normalizeTag(updates.tag);
    }

    if (Object.keys(payload).length === 0) {
        throw new Error('No fields to update');
    }

    const { data, error } = await supabase
        .from('links')
        .update(payload)
        .eq('nanoid', linkNanoid)
        .select()
        .single();

    if (error || !data) {
        console.error('Error updating link:', error);
        throw new Error('Failed to update link');
    }

    revalidatePath(`/projects/${projectNanoid}`);
    return data;
}
