'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/server';
import type { Link, LinkInsert, LinkType } from '@/lib/types/database';

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
            // Use the last meaningful part of the path
            const lastPart = pathParts[pathParts.length - 1];
            // Clean up common patterns
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
 * Get all links for a project
 */
export async function getLinks(projectId: number): Promise<Link[]> {
    const supabase = await createClient();

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
 */
export async function createLink(link: LinkInsert): Promise<Link> {
    const supabase = await createClient();

    const detectedType = link.detected_type || detectLinkType(link.url);
    const label = link.label || extractLabel(link.url);

    const { data, error } = await supabase
        .from('links')
        .insert({
            ...link,
            detected_type: detectedType,
            label,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating link:', error);
        throw new Error('Failed to create link');
    }

    revalidatePath(`/projects/${link.project_id}`);
    return data;
}

/**
 * Create multiple links from a string (comma/space separated)
 */
export async function createLinksFromString(projectId: number, urlString: string): Promise<Link[]> {
    // Split by comma, space, or newline
    const urls = urlString
        .split(/[,\s\n]+/)
        .map((url) => url.trim())
        .filter((url) => {
            // Basic URL validation
            try {
                new URL(url);
                return true;
            } catch {
                // Try adding https://
                try {
                    new URL(`https://${url}`);
                    return true;
                } catch {
                    return false;
                }
            }
        })
        .map((url) => {
            // Ensure URL has protocol
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

    revalidatePath(`/projects/${projectId}`);
    return data || [];
}

/**
 * Delete a link
 */
export async function deleteLink(linkId: number, projectId: number): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
        .from('links')
        .delete()
        .eq('id', linkId);

    if (error) {
        console.error('Error deleting link:', error);
        throw new Error('Failed to delete link');
    }

    revalidatePath(`/projects/${projectId}`);
}
