'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link2, Plus, Trash2, ExternalLink, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
    createLinksFromString,
    deleteLink,
    updateLink,
} from '@/lib/actions/links';
import { useProjectRole } from '@/hooks/use-project-role';
import type { Link as LinkType } from '@/lib/types/database';
import {
    Dialog,
    DialogPanel,
    DialogPopup,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

// React Icons imports
import {
    FaFigma, FaGithub, FaSlack, FaDiscord, FaTrello, FaDropbox, FaGoogle,
    FaAws, FaDocker, FaNpm, FaYoutube, FaTwitter, FaLinkedin, FaInstagram,
    FaFacebook, FaReddit, FaMedium, FaDribbble, FaBehance, FaStripe,
    FaShopify, FaWordpress, FaJira, FaConfluence, FaBitbucket, FaGitlab,
    FaStackOverflow, FaCodepen, FaSoundcloud, FaSpotify, FaPinterest,
    FaTwitch, FaProductHunt, FaIntercom, FaXTwitter
} from 'react-icons/fa6';
import {
    SiNotion, SiLinear, SiVercel, SiNetlify, SiSupabase, SiFirebase,
    SiPostman, SiWebflow, SiFramer, SiMiro, SiAsana, SiClickup, SiAirtable,
    SiZapier, SiHeroku, SiDigitalocean, SiCloudflare, SiSentry, SiDatadog,
    SiGrafana, SiMongodb, SiPostgresql, SiMysql, SiRedis, SiElasticsearch,
    SiRailway, SiPlanetscale, SiRender, SiOpenai, SiHuggingface, SiLoom,
    SiCalendly, SiTypeform, SiHotjar, SiMixpanel, SiMailchimp, SiSendgrid,
    SiTwilio, SiAuth0, SiClerk, SiPaddle, SiLemonsqueezy, SiGumroad,
    SiPlausibleanalytics, SiPosthog, SiExcalidraw
} from 'react-icons/si';
import { HiLink } from 'react-icons/hi';
import type { IconType } from 'react-icons';
import { LinkIcon } from '@phosphor-icons/react/dist/ssr';
import Image from 'next/image';

// Link configuration with icons and brand colors
interface LinkConfig {
    icon: IconType;
    color: string;
    bgColor: string;
}

const LINK_CONFIG: Record<string, LinkConfig> = {
    // Design Tools
    figma: { icon: FaFigma, color: '#F24E1E', bgColor: '#F24E1E' },
    framer: { icon: SiFramer, color: '#0055FF', bgColor: '#0055FF' },
    webflow: { icon: SiWebflow, color: '#4353FF', bgColor: '#4353FF' },
    miro: { icon: SiMiro, color: '#FFD02F', bgColor: '#FFD02F' },
    dribbble: { icon: FaDribbble, color: '#EA4C89', bgColor: '#EA4C89' },
    behance: { icon: FaBehance, color: '#1769FF', bgColor: '#1769FF' },
    excalidraw: { icon: SiExcalidraw, color: '#6965DB', bgColor: '#6965DB' },
    eraser: { icon: HiLink, color: '#6C63FF', bgColor: '#6C63FF' },

    // Dev Tools
    github: { icon: FaGithub, color: '#ffffff', bgColor: '#181717' },
    gitlab: { icon: FaGitlab, color: '#FC6D26', bgColor: '#FC6D26' },
    bitbucket: { icon: FaBitbucket, color: '#0052CC', bgColor: '#0052CC' },
    vercel: { icon: SiVercel, color: '#ffffff', bgColor: '#000000' },
    netlify: { icon: SiNetlify, color: '#00C7B7', bgColor: '#00C7B7' },
    railway: { icon: SiRailway, color: '#ffffff', bgColor: '#0B0D0E' },
    render: { icon: SiRender, color: '#46E3B7', bgColor: '#46E3B7' },
    fly: { icon: HiLink, color: '#7B36ED', bgColor: '#7B36ED' },
    heroku: { icon: SiHeroku, color: '#ffffff', bgColor: '#430098' },
    digitalocean: { icon: SiDigitalocean, color: '#0080FF', bgColor: '#0080FF' },
    cloudflare: { icon: SiCloudflare, color: '#F38020', bgColor: '#F38020' },
    npm: { icon: FaNpm, color: '#CB3837', bgColor: '#CB3837' },
    docker: { icon: FaDocker, color: '#2496ED', bgColor: '#2496ED' },
    postman: { icon: SiPostman, color: '#FF6C37', bgColor: '#FF6C37' },
    codepen: { icon: FaCodepen, color: '#ffffff', bgColor: '#000000' },
    stackoverflow: { icon: FaStackOverflow, color: '#F58025', bgColor: '#F58025' },

    // Databases
    supabase: { icon: SiSupabase, color: '#ffffff', bgColor: '#3FCF8E' },
    firebase: { icon: SiFirebase, color: '#FFCA28', bgColor: '#FFCA28' },
    mongodb: { icon: SiMongodb, color: '#47A248', bgColor: '#47A248' },
    postgresql: { icon: SiPostgresql, color: '#ffffff', bgColor: '#4169E1' },
    mysql: { icon: SiMysql, color: '#4479A1', bgColor: '#4479A1' },
    redis: { icon: SiRedis, color: '#DC382D', bgColor: '#DC382D' },
    elasticsearch: { icon: SiElasticsearch, color: '#ffffff', bgColor: '#005571' },
    planetscale: { icon: SiPlanetscale, color: '#ffffff', bgColor: '#000000' },
    neon: { icon: HiLink, color: '#00E699', bgColor: '#00E699' },

    // Productivity
    notion: { icon: SiNotion, color: '#ffffff', bgColor: '#000000' },
    linear: { icon: SiLinear, color: '#ffffff', bgColor: '#5E6AD2' },
    slack: { icon: FaSlack, color: '#ffffff', bgColor: '#4A154B' },
    discord: { icon: FaDiscord, color: '#ffffff', bgColor: '#5865F2' },
    trello: { icon: FaTrello, color: '#ffffff', bgColor: '#0052CC' },
    asana: { icon: SiAsana, color: '#F06A6A', bgColor: '#F06A6A' },
    clickup: { icon: SiClickup, color: '#7B68EE', bgColor: '#7B68EE' },
    monday: { icon: HiLink, color: '#ffffff', bgColor: '#FF3D57' },
    jira: { icon: FaJira, color: '#ffffff', bgColor: '#0052CC' },
    confluence: { icon: FaConfluence, color: '#ffffff', bgColor: '#172B4D' },
    airtable: { icon: SiAirtable, color: '#18BFFF', bgColor: '#18BFFF' },
    dropbox: { icon: FaDropbox, color: '#0061FF', bgColor: '#0061FF' },
    google: { icon: FaGoogle, color: '#4285F4', bgColor: '#4285F4' },
    loom: { icon: SiLoom, color: '#ffffff', bgColor: '#625DF5' },
    calendly: { icon: SiCalendly, color: '#ffffff', bgColor: '#006BFF' },

    // Automation
    zapier: { icon: SiZapier, color: '#FF4A00', bgColor: '#FF4A00' },
    make: { icon: HiLink, color: '#ffffff', bgColor: '#6D00CC' },

    // Monitoring & Analytics
    sentry: { icon: SiSentry, color: '#ffffff', bgColor: '#362D59' },
    datadog: { icon: SiDatadog, color: '#ffffff', bgColor: '#632CA6' },
    grafana: { icon: SiGrafana, color: '#F46800', bgColor: '#F46800' },
    hotjar: { icon: SiHotjar, color: '#ffffff', bgColor: '#FF3C00' },
    mixpanel: { icon: SiMixpanel, color: '#ffffff', bgColor: '#7856FF' },
    amplitude: { icon: HiLink, color: '#ffffff', bgColor: '#1E61F0' },
    segment: { icon: HiLink, color: '#ffffff', bgColor: '#52BD94' },
    plausible: { icon: SiPlausibleanalytics, color: '#ffffff', bgColor: '#5850EC' },
    posthog: { icon: SiPosthog, color: '#ffffff', bgColor: '#1D4AFF' },

    // AI
    openai: { icon: SiOpenai, color: '#ffffff', bgColor: '#412991' },
    anthropic: { icon: HiLink, color: '#ffffff', bgColor: '#D4A574' },
    huggingface: { icon: SiHuggingface, color: '#FFD21E', bgColor: '#FFD21E' },

    // Social
    twitter: { icon: FaXTwitter, color: '#ffffff', bgColor: '#000000' },
    x: { icon: FaXTwitter, color: '#ffffff', bgColor: '#000000' },
    linkedin: { icon: FaLinkedin, color: '#ffffff', bgColor: '#0A66C2' },
    instagram: { icon: FaInstagram, color: '#ffffff', bgColor: '#E4405F' },
    facebook: { icon: FaFacebook, color: '#ffffff', bgColor: '#1877F2' },
    youtube: { icon: FaYoutube, color: '#ffffff', bgColor: '#FF0000' },
    reddit: { icon: FaReddit, color: '#FF4500', bgColor: '#FF4500' },
    medium: { icon: FaMedium, color: '#ffffff', bgColor: '#000000' },
    producthunt: { icon: FaProductHunt, color: '#ffffff', bgColor: '#DA552F' },
    twitch: { icon: FaTwitch, color: '#ffffff', bgColor: '#9146FF' },
    pinterest: { icon: FaPinterest, color: '#ffffff', bgColor: '#BD081C' },
    spotify: { icon: FaSpotify, color: '#1DB954', bgColor: '#1DB954' },
    soundcloud: { icon: FaSoundcloud, color: '#FF5500', bgColor: '#FF5500' },

    // Payments
    stripe: { icon: FaStripe, color: '#ffffff', bgColor: '#635BFF' },
    paddle: { icon: SiPaddle, color: '#000000', bgColor: '#FFCC00' },
    lemonsqueezy: { icon: SiLemonsqueezy, color: '#000000', bgColor: '#FFC233' },
    gumroad: { icon: SiGumroad, color: '#FF90E8', bgColor: '#FF90E8' },
    shopify: { icon: FaShopify, color: '#7AB55C', bgColor: '#7AB55C' },

    // Email/Auth
    mailchimp: { icon: SiMailchimp, color: '#000000', bgColor: '#FFE01B' },
    sendgrid: { icon: SiSendgrid, color: '#ffffff', bgColor: '#1A82E2' },
    twilio: { icon: SiTwilio, color: '#ffffff', bgColor: '#F22F46' },
    auth0: { icon: SiAuth0, color: '#ffffff', bgColor: '#EB5424' },
    clerk: { icon: SiClerk, color: '#ffffff', bgColor: '#6C47FF' },
    intercom: { icon: FaIntercom, color: '#000000', bgColor: '#6AFDEF' },
    typeform: { icon: SiTypeform, color: '#ffffff', bgColor: '#262627' },

    // Cloud
    aws: { icon: FaAws, color: '#FF9900', bgColor: '#FF9900' },

    // CMS
    wordpress: { icon: FaWordpress, color: '#ffffff', bgColor: '#21759B' },

    // Default
    generic: { icon: HiLink, color: '#ffffff', bgColor: '#6B7280' },
};

// Helper function to get config
function getLinkConfig(type: string): LinkConfig {
    return LINK_CONFIG[type.toLowerCase()] || LINK_CONFIG.generic;
}

// Get span size based on index for bento grid - balanced layout
function getBentoSpan(index: number, total: number): string {
    // For small collections, keep it simple
    if (total <= 3) return 'col-span-1';
    if (total <= 5) {
        // First item slightly larger on mobile only
        if (index === 0) return 'col-span-2 md:col-span-1';
        return 'col-span-1';
    }

    // For larger collections, create subtle variety
    // Pattern: mostly 1-span with occasional 2-span on mobile
    const pattern = index % 5;

    switch (pattern) {
        case 0: // Every 5th item (starting from first) - wider on mobile
            return 'col-span-2 md:col-span-1';
        case 3: // Occasional variety
            return total > 8 ? 'col-span-2 lg:col-span-1' : 'col-span-1';
        default:
            return 'col-span-1';
    }
}

interface LinkCardProps {
    link: LinkType;
    projectId: string;
    onDelete: (id: string) => void;
    onEdit: (link: LinkType) => void;
    span: string;
    isFeatured: boolean;
    canEdit: boolean;
}

// Extract domain from URL for favicon
function getDomain(url: string): string {
    try {
        const parsed = new URL(url);
        return parsed.hostname;
    } catch {
        return '';
    }
}

function LinkCard({ link, projectId, onDelete, onEdit, span, isFeatured, canEdit }: LinkCardProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [faviconError, setFaviconError] = useState(false);
    const config = getLinkConfig(link.detected_type);
    const Icon = config.icon;
    const domain = getDomain(link.url);

    // Use favicon if it's a generic link type
    const showFavicon = link.detected_type === 'generic' && domain && !faviconError;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDeleting(true);
        try {
            await deleteLink(link.nanoid, projectId);
            onDelete(link.nanoid);
        } catch (error) {
            console.error('Failed to delete link:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onEdit(link);
    };

    // Create hex with opacity
    const bgColorWithOpacity = config.bgColor + '80'; // 50% opacity

    return (
        <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`block ${span}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={`
          group relative overflow-hidden rounded-2xl transition-all duration-300
          hover:scale-[1.02] hover:shadow-xl h-24
          flex items-baseline justify-between p-4
        `}
                style={{ backgroundColor: bgColorWithOpacity }}
            >
                {/* Icon */}
                <div className="flex items-start">
                    {showFavicon ? (
                        <img
                            src={faviconUrl}
                            alt=""
                            className={`
                rounded-lg object-contain h-12 w-12
              `}
                            onError={() => setFaviconError(true)}
                        />
                    ) : (
                        <div
                            className={`
                rounded-xl flex items-center justify-center
                ${isFeatured ? 'p-2.5 md:p-3' : 'p-2'}
              `}
                            style={{ backgroundColor: config.bgColor }}
                        >
                            <Icon
                                className={`
                  ${isFeatured ? 'h-8 w-8 md:h-10 md:w-10' : 'h-5 w-5 md:h-6 md:w-6'}
                `}
                                style={{ color: config.color }}
                            />
                        </div>
                    )}
                </div>

                {/* Actions - hover only (right-most) */}
                <div
                    className={`
            absolute top-3 right-3 z-10 flex gap-1
            transform transition-all duration-300
            ${isHovered ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
          `}
                >
                    <button
                        className="p-1.5 rounded-lg bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ExternalLink className="h-3.5 w-3.5 text-white" />
                    </button>
                    {canEdit && (
                        <button
                            className="p-1.5 rounded-lg bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors"
                            onClick={handleEdit}
                        >
                            <Pencil className="h-3.5 w-3.5 text-white" />
                        </button>
                    )}
                    {canEdit && (
                        <button
                            className="p-1.5 rounded-lg bg-red-500/80 backdrop-blur-sm hover:bg-red-500 transition-colors"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-3.5 w-3.5 text-white" />
                        </button>
                    )}
                </div>

                {/* Label - always visible */}
                <div className="mt-auto">
                    <p className={`
            font-medium truncate
            ${isFeatured ? 'text-base md:text-lg' : 'text-sm'}
          `} style={{ color: config.color }}>
                        {link.label || link.detected_type}
                    </p>
                    <p className={`
            truncate opacity-70
            ${isFeatured ? 'text-sm' : 'text-xs'}
          `} style={{ color: config.color }}>
                        {domain || link.url}
                    </p>
                </div>

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-linear-to-br from-white/10 to-transparent pointer-events-none" />
            </div>
        </a>
    );
}

interface LinksClientProps {
    initialLinks: LinkType[];
    projectId: string;
}

function normalizeTag(tag: string): string {
    return tag.trim().replace(/\s+/g, ' ');
}

export function LinksClient({ initialLinks, projectId }: LinksClientProps) {
    const { canEdit } = useProjectRole();
    const [links, setLinks] = useState<LinkType[]>(initialLinks);
    const [urlInput, setUrlInput] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isTagSuggestionsOpen, setIsTagSuggestionsOpen] = useState(false);
    const tagInputContainerRef = useRef<HTMLDivElement>(null);
    const [editingLink, setEditingLink] = useState<LinkType | null>(null);
    const [editUrlInput, setEditUrlInput] = useState('');
    const [editTagInput, setEditTagInput] = useState('');
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [editError, setEditError] = useState<string | null>(null);
    const [isEditTagSuggestionsOpen, setIsEditTagSuggestionsOpen] = useState(false);
    const editTagInputContainerRef = useRef<HTMLDivElement>(null);

    const existingTags = useMemo(() => {
        return Array.from(
            new Set(
                links
                    .map((link) => (link.tag ? normalizeTag(link.tag) : ''))
                    .filter(Boolean),
            ),
        ).sort((a, b) => a.localeCompare(b));
    }, [links]);

    const normalizedTagInput = normalizeTag(tagInput);

    const filteredTagSuggestions = useMemo(() => {
        const query = normalizedTagInput.toLowerCase();
        if (!query) return existingTags;
        return existingTags.filter((tag) => tag.toLowerCase().includes(query));
    }, [existingTags, normalizedTagInput]);

    const canCreateTag = normalizedTagInput.length > 0 && !existingTags.some(
        (tag) => tag.toLowerCase() === normalizedTagInput.toLowerCase(),
    );

    const groupedLinks = useMemo(() => {
        const map = new Map<string, LinkType[]>();

        for (const link of links) {
            const normalized = normalizeTag(link.tag ?? '');
            const groupKey = normalized || 'untagged';
            const current = map.get(groupKey) ?? [];
            current.push(link);
            map.set(groupKey, current);
        }

        return Array.from(map.entries())
            .sort(([left], [right]) => {
                if (left === 'untagged') return 1;
                if (right === 'untagged') return -1;
                return left.localeCompare(right);
            });
    }, [links]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (!tagInputContainerRef.current) return;
            if (!tagInputContainerRef.current.contains(event.target as Node)) {
                setIsTagSuggestionsOpen(false);
            }

            if (!editTagInputContainerRef.current) return;
            if (!editTagInputContainerRef.current.contains(event.target as Node)) {
                setIsEditTagSuggestionsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

    const selectTag = (value: string) => {
        const normalized = normalizeTag(value);
        setTagInput(normalized);
        setIsTagSuggestionsOpen(false);
    };

    const selectEditTag = (value: string) => {
        const normalized = normalizeTag(value);
        setEditTagInput(normalized);
        setIsEditTagSuggestionsOpen(false);
    };

    const handleAddLinks = async () => {
        if (!urlInput.trim()) {
            setError('Please enter at least one URL');
            return;
        }

        setIsAdding(true);
        setError(null);

        try {
            const tag = normalizeTag(tagInput);
            const newLinks = await createLinksFromString(projectId, urlInput, tag || null);
            setLinks((prev) => [...newLinks, ...prev]);
            setUrlInput('');
            setTagInput('');
            setIsTagSuggestionsOpen(false);
        } catch (err) {
            console.error('Failed to add links:', err);
            setError('Failed to add links. Please check your URLs.');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = (linkNanoid: string) => {
        setLinks((prev) => prev.filter((l) => l.nanoid !== linkNanoid));
    };

    const handleStartEdit = (link: LinkType) => {
        setEditingLink(link);
        setEditUrlInput(link.url);
        setEditTagInput(link.tag ?? '');
        setEditError(null);
        setIsEditTagSuggestionsOpen(false);
    };

    const handleSaveEdit = async () => {
        if (!editingLink) return;

        const trimmedUrl = editUrlInput.trim();
        if (!trimmedUrl) {
            setEditError('URL is required');
            return;
        }

        setEditError(null);
        setIsSavingEdit(true);

        try {
            const updated = await updateLink(editingLink.nanoid, projectId, {
                url: trimmedUrl,
                tag: normalizeTag(editTagInput) || null,
            });

            setLinks((prev) => prev.map((item) => (item.nanoid === updated.nanoid ? updated : item)));
            setEditingLink(null);
            setEditUrlInput('');
            setEditTagInput('');
        } catch (err) {
            console.error('Failed to update link:', err);
            setEditError('Failed to update link. Please check URL and try again.');
        } finally {
            setIsSavingEdit(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                {/* <Link2 className="size-16 -rotate-45 absolute -left-4 text-primary" /> */}
                {/* <div className="p-2 rounded-lg bg-primary/10">
                </div> */}
                <div>
                    <h1 className="text-xl font-bold">Links</h1>
                    <p className="text-sm text-muted-foreground">
                        Your project's important links
                    </p>
                </div>
            </div>

            {/* Add Links */}
            {canEdit && (
                <Card className="p-4 overflow-hidden relative">
                    {/* <Image src={"/wires-tied-btw.png"} alt="Tied Wires" width={100} height={100} className="absolute -bottom-4 -right-2 -rotate-6" /> */}
                    <Image src={"/wires-wrinkled-right.png"} alt="Tied Wires" width={100} height={100} className="absolute -bottom-4 -right-2 -rotate-6" />
                    
                    <div className="grid grid-cols-1 gap-3 pt-3 md:grid-cols-[minmax(0,1fr)_240px_auto] md:items-start w-[90%]">
                        <Input
                            placeholder="Paste URLs here (comma or space separated)..."
                            value={urlInput}
                            onChange={(e) => setUrlInput(e.target.value)}
                            disabled={isAdding}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddLinks();
                                }
                            }}
                        />

                        <div className="relative" ref={tagInputContainerRef}>
                            <Input
                                placeholder="Tag (optional)"
                                value={tagInput}
                                onFocus={() => setIsTagSuggestionsOpen(true)}
                                onChange={(e) => {
                                    setTagInput(e.target.value);
                                    setIsTagSuggestionsOpen(true);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (filteredTagSuggestions.length > 0) {
                                            selectTag(filteredTagSuggestions[0]);
                                            return;
                                        }
                                        if (canCreateTag) {
                                            selectTag(normalizedTagInput);
                                        }
                                    }
                                }}
                                disabled={isAdding}
                            />
                            {isTagSuggestionsOpen && (
                                <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-1 shadow-md max-h-32 overflow-y-auto">
                                    {filteredTagSuggestions.length === 0 && !canCreateTag && (
                                        <p className="px-2 py-1.5 text-sm text-muted-foreground">No tags found</p>
                                    )}

                                    {filteredTagSuggestions.slice(0, 3).map((tag) => (
                                        <button
                                            key={tag}
                                            type="button"
                                            className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                                            onClick={() => selectTag(tag)}
                                        >
                                            {tag}
                                        </button>
                                    ))}

                                    {canCreateTag && (
                                        <button
                                            type="button"
                                            className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                                            onClick={() => selectTag(normalizedTagInput)}
                                        >
                                            Create "{normalizedTagInput}"
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <Button onClick={handleAddLinks} disabled={isAdding}>
                            <Plus className="h-4 w-4 mr-2" />
                            {isAdding ? 'Adding...' : 'Add'}
                        </Button>
                    </div>
                    {/* <p className="mt-1 text-xs text-muted-foreground/60 ml-2    ">Tag is optional and links are grouped by tag.</p> */}
                    {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                    {/* <LinkIcon size={32} /> */}


                </Card>
            )}

            <Dialog
                open={!!editingLink}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingLink(null);
                        setEditError(null);
                        setIsEditTagSuggestionsOpen(false);
                    }
                }}
            >
                <DialogPopup>
                    <DialogHeader>
                        <DialogTitle>Edit Link</DialogTitle>
                        <DialogDescription>Update URL and optional tag.</DialogDescription>
                    </DialogHeader>

                    <DialogPanel className="space-y-3">
                        <Input
                            placeholder="https://example.com"
                            value={editUrlInput}
                            onChange={(e) => setEditUrlInput(e.target.value)}
                            disabled={isSavingEdit}
                        />

                        <div className="relative" ref={editTagInputContainerRef}>
                            <Input
                                placeholder="Tag (optional)"
                                value={editTagInput}
                                onFocus={() => setIsEditTagSuggestionsOpen(true)}
                                onChange={(e) => {
                                    setEditTagInput(e.target.value);
                                    setIsEditTagSuggestionsOpen(true);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        const normalized = normalizeTag(editTagInput);
                                        const matching = existingTags.filter((tag) =>
                                            tag.toLowerCase().includes(normalized.toLowerCase()),
                                        );

                                        if (matching.length > 0) {
                                            selectEditTag(matching[0]);
                                            return;
                                        }

                                        if (normalized) {
                                            selectEditTag(normalized);
                                        }
                                    }
                                }}
                                disabled={isSavingEdit}
                            />

                            {isEditTagSuggestionsOpen && (
                                <div className="absolute z-20 mt-1 w-full rounded-md border bg-popover p-1 shadow-md max-h-32 overflow-y-auto">
                                    {existingTags.length === 0 && (
                                        <p className="px-2 py-1.5 text-sm text-muted-foreground">No tags found</p>
                                    )}
                                    {existingTags.slice(0, 3).map((tag) => (
                                        <button
                                            key={`edit-${tag}`}
                                            type="button"
                                            className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                                            onClick={() => selectEditTag(tag)}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {editError && <p className="text-sm text-destructive">{editError}</p>}
                    </DialogPanel>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingLink(null)} disabled={isSavingEdit}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={isSavingEdit}>
                            {isSavingEdit ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </DialogPopup>
            </Dialog>

            {/* Bento Grid */}
            {links.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6 opacity-30">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className={`rounded-xl bg-muted ${i === 0 ? 'col-span-2 row-span-2 h-24' : 'h-12'}`}
                            />
                        ))}
                    </div>
                    <p className="font-medium">No links added yet</p>
                    <p className="text-sm">Add links to Figma, GitHub, Vercel, and more</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {isAdding && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={`loading-${index}`} className="col-span-1">
                                    <Skeleton className="h-36 w-full rounded-2xl" />
                                </div>
                            ))}
                        </div>
                    )}

                    {groupedLinks.map(([tag, groupLinks]) => (
                        <div key={tag} className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                {tag === 'untagged' ? 'Untagged' : tag}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
                                {groupLinks.map((link, index) => (
                                    <LinkCard
                                        key={link.nanoid}
                                        link={link}
                                        projectId={projectId}
                                        onDelete={handleDelete}
                                        onEdit={handleStartEdit}
                                        span={getBentoSpan(index, groupLinks.length)}
                                        isFeatured={false}
                                        canEdit={canEdit}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
