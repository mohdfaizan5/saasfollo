'use client';

import { useState } from 'react';
import { Link2, Plus, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { createLinksFromString, deleteLink } from '@/lib/actions/links';
import type { Link as LinkType } from '@/lib/types/database';

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
    projectId: number;
    onDelete: (id: number) => void;
    span: string;
    isFeatured: boolean;
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

function LinkCard({ link, projectId, onDelete, span, isFeatured }: LinkCardProps) {
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
            await deleteLink(link.id, projectId);
            onDelete(link.id);
        } catch (error) {
            console.error('Failed to delete link:', error);
        } finally {
            setIsDeleting(false);
        }
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
          hover:scale-[1.02] hover:shadow-xl h-36
          flex flex-col justify-between p-4
        `}
                style={{ backgroundColor: bgColorWithOpacity }}
            >
                {/* Icon */}
                <div className="flex items-start justify-between">
                    {showFavicon ? (
                        <img
                            src={faviconUrl}
                            alt=""
                            className={`
                rounded-lg object-contain h-10 w-10
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

                    {/* Actions - hover only */}
                    <div className={`
            flex gap-1
            transform transition-all duration-300
            ${isHovered ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
          `}>
                        <button
                            className="p-1.5 rounded-lg bg-black/20 backdrop-blur-sm hover:bg-black/30 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ExternalLink className="h-3.5 w-3.5 text-white" />
                        </button>
                        <button
                            className="p-1.5 rounded-lg bg-red-500/80 backdrop-blur-sm hover:bg-red-500 transition-colors"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            <Trash2 className="h-3.5 w-3.5 text-white" />
                        </button>
                    </div>
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
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            </div>
        </a>
    );
}

interface LinksClientProps {
    initialLinks: LinkType[];
    projectId: number;
}

export function LinksClient({ initialLinks, projectId }: LinksClientProps) {
    const [links, setLinks] = useState<LinkType[]>(initialLinks);
    const [urlInput, setUrlInput] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddLinks = async () => {
        if (!urlInput.trim()) {
            setError('Please enter at least one URL');
            return;
        }

        setIsAdding(true);
        setError(null);

        try {
            const newLinks = await createLinksFromString(projectId, urlInput);
            setLinks((prev) => [...newLinks, ...prev]);
            setUrlInput('');
        } catch (err) {
            console.error('Failed to add links:', err);
            setError('Failed to add links. Please check your URLs.');
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = (linkId: number) => {
        setLinks((prev) => prev.filter((l) => l.id !== linkId));
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                    <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-bold">Links</h1>
                    <p className="text-sm text-muted-foreground">
                        Your project's important links
                    </p>
                </div>
            </div>

            {/* Add Links */}
            <Card className="p-4">
                <div className="flex gap-3">
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
                    <Button onClick={handleAddLinks} disabled={isAdding}>
                        <Plus className="h-4 w-4 mr-2" />
                        {isAdding ? 'Adding...' : 'Add'}
                    </Button>
                </div>
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
            </Card>

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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
                    {links.map((link, index) => (
                        <LinkCard
                            key={link.id}
                            link={link}
                            projectId={projectId}
                            onDelete={handleDelete}
                            span={getBentoSpan(index, links.length)}
                            isFeatured={false}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
