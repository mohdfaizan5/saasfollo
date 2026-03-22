'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Gift, ChevronRight, Sparkles, DollarSign, Grid, Layers, LineChart, Users, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { startupPerks, categories, type StartupPerk } from '@/data/startupperks';
import { cn } from '@/lib/utils';
import { useQueryState } from 'nuqs';
import useLocalStorageState from 'use-local-storage-state';
import {
  GoogleLogoIcon,
  CloudIcon,
  MicrosoftWordLogoIcon,
  CloudArrowUpIcon,
  DropIcon,
  HardDrivesIcon,
  WrenchIcon,
  ChartLineIcon,
  FlameIcon,
  BrainIcon,
  ArrowsLeftRightIcon,
  LeafIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  SmileyIcon,
  SparkleIcon,
  SpeakerHighIcon,
  RobotIcon,
  FileTextIcon,
  GridFourIcon,
  PaletteIcon,
  PhoneIcon,
  DatabaseIcon,
  CreditCardIcon,
  ChatCircleIcon,
  RocketIcon,
  CloudArrowDownIcon,
  GithubLogoIcon,
  ListMagnifyingGlassIcon,
  HeadsetIcon,
  TrendUpIcon,
  PulseIcon,
  WindowsLogoIcon,
  TriangleIcon,
  PlanetIcon,
  BugIcon,
  BriefcaseIcon,
  PaintBrushIcon,
  WalletIcon,
  MoneyIcon,
  UsersIcon,
  ArrowSquareOutIcon,
  BookmarkSimpleIcon
} from '@phosphor-icons/react';
import { Badge } from '@/components/ui/badge';

const companyIcons: Record<string, React.ComponentType<any>> = {
  "Google Cloud": GoogleLogoIcon,
  "Cloudflare": CloudIcon,
  "Microsoft": MicrosoftWordLogoIcon,
  "Amazon Web Services": CloudArrowUpIcon,
  "DigitalOcean": DropIcon,
  "OVHcloud": HardDrivesIcon,
  "Retool": WrenchIcon,
  "Mixpanel": ChartLineIcon,
  "PostHog": FlameIcon,
  "Anthropic": BrainIcon,
  "Twilio Segment": ArrowsLeftRightIcon,
  "MongoDB": LeafIcon,
  "Couchbase": CubeIcon,
  "Algolia": MagnifyingGlassIcon,
  "Freshworks": SmileyIcon,
  "Perplexity AI": SparkleIcon,
  "ElevenLabs": SpeakerHighIcon,
  "OpenAI": RobotIcon,
  "Notion": FileTextIcon,
  "Miro": GridFourIcon,
  "Figma": PaletteIcon,
  "Twilio": PhoneIcon,
  "Supabase": DatabaseIcon,
  "Stripe": CreditCardIcon,
  "Intercom": ChatCircleIcon,
  "HubSpot": RocketIcon,
  "Dropbox": CloudArrowDownIcon,
  "GitHub": GithubLogoIcon,
  "Linear": ListMagnifyingGlassIcon,
  "Zendesk": HeadsetIcon,
  "Amplitude": TrendUpIcon,
  "Datadog": PulseIcon,
  "Zoho": WindowsLogoIcon,
  "Vercel": TriangleIcon,
  "PlanetScale": PlanetIcon,
  "Sentry": BugIcon,
  "Atlassian": BriefcaseIcon,
  "Canva": PaintBrushIcon,
  "Brex": WalletIcon,
  "Ramp": MoneyIcon,
  "Gusto": UsersIcon,
};

const toPerkId = (perk: StartupPerk) =>
  `${perk.companyName}-${perk.perkName}`
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const hasValidApplyLink = (link: string) => /^https?:\/\//i.test(link);

function CategoryFilter() {
  const [selectedCategory, setSelectedCategory] = useQueryState('category');

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value || (!selectedCategory && category.value === 'all') ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory(category.value === 'all' ? null : category.value)}
          className={cn(
            "rounded-full px-4 transition-all duration-200",
            selectedCategory === category.value || (!selectedCategory && category.value === 'all')
              ? "text-white shadow-md"
              : "border-[#A6AEA4] text-[#2C4839] hover:bg-[#F6F1EA] hover:border-[#2C4839]"
          )}
          style={{
            backgroundColor: selectedCategory === category.value || (!selectedCategory && category.value === 'all') ? '#2C4839' : 'transparent',
            borderColor: '#A6AEA4'
          }}
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
}

export function PerkCard({
  perk,
  perkId,
  isBookmarked,
  onToggleBookmark,
}: {
  perk: StartupPerk;
  perkId: string;
  isBookmarked: boolean;
  onToggleBookmark: (perkId: string) => void;
}) {
  const categoryInfo = categories.find(c => c.value === perk.category);
  const Icon = companyIcons[perk.companyName];
  const canVisit = hasValidApplyLink(perk.applyLink);

  return (
    <Link href={`/startupperks/${perk.companyName.toLowerCase().replace(/\s+/g, '-')}`}>
      <Card className="relative h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#2C4839] bg-white group overflow-hidden">
        <div
          className="h-2 w-full"
          style={{ backgroundColor: categoryInfo?.color || '#2C4839' }}
        />
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 flex-1">
              {Icon && <Icon size={32} weight="duotone" />}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-bold text-[#0C1510] group-hover:text-[#2C4839] transition-colors truncate">
                  {perk.companyName}
                </CardTitle>
                <CardDescription className="text-sm text-[#A6AEA4] mt-0.5">
                  {perk.perkName}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2 ">
          <div className="mb-3">
            <span
              className="inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-md"
              style={{ backgroundColor: '#F6F1EA', color: '#2C4839', border: '1px solid #A6AEA4' }}
            >
              <Gift className="h-3 w-3" />
              {perk.valueOrDiscount}
            </span>
          </div>
          <p className="text-sm text-[#0C1510]/70 line-clamp-3 mb-4">
            {perk.description}
          </p>
          <div className="">
            <div className="flex items-center text-[#2C4839] font-medium text-sm group-hover:translate-x-1 transition-transform">
              View details
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>

            <div className="absolute bottom-0 right-0 flex items-center gap-2 p-2">
              {canVisit && (
                <Button
                  aria-label="Visit website"
                  title="Visit website"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    window.open(perk.applyLink, '_blank', 'noopener,noreferrer');
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#A6AEA4]/50 bg-white text-[#2C4839] opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-[#F6F1EA]"
                >
                  <ArrowSquareOutIcon size={16} />
                </Button>
              )}
              <Button
                aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark perk'}
                title={isBookmarked ? 'Remove bookmark' : 'Bookmark perk'}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onToggleBookmark(perkId);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[#A6AEA4]/50 bg-white text-[#2C4839] transition-colors hover:bg-[#F6F1EA]"
              >
                <BookmarkSimpleIcon size={16} weight={isBookmarked ? 'fill' : 'regular'} />
              </Button>


            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StartupPerksContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory] = useQueryState('category');
  const [bookmarkedItems, setBookmarkedItems] = useLocalStorageState<string[]>('bookmarkedItems', {
    defaultValue: ['siddz-ui', 'shadcn-space', 'trable-craft', 'the-gridcn'],
  });

  const bookmarkedSet = useMemo(() => new Set(bookmarkedItems ?? []), [bookmarkedItems]);

  const toggleBookmark = (perkId: string) => {
    setBookmarkedItems((prev) => {
      const current = prev ?? [];
      if (current.includes(perkId)) {
        return current.filter((item) => item !== perkId);
      }
      return [...current, perkId];
    });
  };

  const filteredPerks = useMemo(() => {
    let perks = startupPerks
      .map((perk, originalIndex) => {
        const bookmarkId = toPerkId(perk);
        return {
          perk,
          originalIndex,
          bookmarkId,
          renderKey: `${bookmarkId}-${originalIndex}`,
        };
      });

    if (selectedCategory && selectedCategory !== 'all') {
      perks = perks.filter(({ perk }) => perk.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      perks = perks.filter(
        ({ perk }) =>
          perk.companyName.toLowerCase().includes(query) ||
          perk.perkName.toLowerCase().includes(query) ||
          perk.description.toLowerCase().includes(query) ||
          perk.category?.toLowerCase().includes(query)
      );
    }

    perks.sort((a, b) => {
      const aBookmarked = bookmarkedSet.has(a.bookmarkId);
      const bBookmarked = bookmarkedSet.has(b.bookmarkId);
      if (aBookmarked === bBookmarked) {
        return a.originalIndex - b.originalIndex;
      }
      return aBookmarked ? -1 : 1;
    });

    return perks;
  }, [searchQuery, selectedCategory, bookmarkedSet]);

  const parseValue = (value: string): number => {
    // Match patterns like "$350,000", "€100,000", "up to $2,500"
    const match = value.match(/[\$€]?\s*(\d+(?:,\d+)?)/);
    if (!match) return 0;

    const numStr = match[1].replace(/,/g, '');
    const num = parseInt(numStr, 10);

    // Apply multipliers
    if (value.toLowerCase().includes('million')) {
      return num * 1000000;
    }
    if (value.toLowerCase().includes('k+')) {
      return num * 1000;
    }
    return num;
  };

  const totalValue = filteredPerks.reduce((acc, item) => {
    return acc + parseValue(item.perk.valueOrDiscount);
  }, 0);

  const formatValue = (val: number) => {
    if (val >= 1000000) {
      return `$${(val / 1000000).toFixed(1)}M+`;
    }
    if (val >= 1000) {
      return `$${(val / 1000).toFixed(0)}K+`;
    }
    return `$${val}`;
  };

  return (
    <div className="min-h-screen bg-[#F6F1EA]">
      {/* Hero Section */}
      <div className="bg-[#2C4839] text-white py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
            Startup Perks & Discounts
          </h1>
          <p className="text-[#A6AEA4] max-w-2xl mb-6 md:mb-4">
            A curated collection of exclusive deals, credits, and freebies for startups.
            Save thousands on cloud, AI, development tools, and more.
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <div className="bg-[#0C1510]/30 px-4 md:px-6 py-3 rounded-lg relative">
              <div className="text-2xl md:text-3xl font-bold">{startupPerks.length}</div>
              <div className="text-sm text-[#A6AEA4]">Total Perks</div>
              <Sparkles className="absolute -top-2 -right-2 w-10 h-10 md:w-12 md:h-12 rotate-12 opacity-15" />
            </div>
            <div className="bg-[#0C1510]/30 px-4 md:px-6 py-3 rounded-lg relative">
              <div className="text-2xl md:text-3xl font-bold">{formatValue(totalValue)}</div>
              <div className="text-sm text-[#A6AEA4]">Potential Savings</div>
              <DollarSign className="absolute -top-2 -right-2 w-10 h-10 md:w-12 md:h-12 rotate-12 opacity-15" />
            </div>
            <div className="bg-[#0C1510]/30 px-4 md:px-6 py-3 rounded-lg relative">
              <div className="text-2xl md:text-3xl font-bold">{categories.length - 1}</div>
              <div className="text-sm text-[#A6AEA4]">Categories</div>
              <Grid className="absolute -top-2 -right-2 w-10 h-10 md:w-12 md:h-12 rotate-12 opacity-15" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="sticky top-0 z-10 bg-[#F6F1EA]/95 backdrop-blur-sm border-b border-[#A6AEA4]/30 py-3 md:py-4 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start md:items-center justify-between">
            <CategoryFilter />
            <div className="relative w-full sm:w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6AEA4]" />
              <Input
                type="text"
                placeholder="Search perks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-[#A6AEA4] focus:border-[#2C4839] focus:ring-[#2C4839]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="mb-4 text-sm md:text-base text-[#0C1510]/60">
          Showing {filteredPerks.length} {filteredPerks.length === 1 ? 'perk' : 'perks'}
          {selectedCategory && selectedCategory !== 'all' && (
            <> in <span className="font-medium text-[#2C4839]">{categories.find(c => c.value === selectedCategory)?.label}</span></>
          )}
        </div>

        {filteredPerks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredPerks.map((perk, index) => (
              <React.Fragment key={perk.renderKey}>
                <PerkCard
                  perk={perk.perk}
                  perkId={perk.bookmarkId}
                  isBookmarked={bookmarkedSet.has(perk.bookmarkId)}
                  onToggleBookmark={toggleBookmark}
                />

                {/* Banner 1: Unlock Credits */}
                {index === 5 && (
                  <Card className="col-span-1 sm:col-span-2 lg:col-span-3 p-6 md:p-8 md:px-12 bg-[#110D09] relative text-white overflow-hidden my-2 sm:my-4 border-[#110D09] hover:shadow-xl transition-shadow duration-300">
                    <div className="relative z-10 max-w-xl">
                      <Badge
                      // className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-sm mb-5 border border-white/10"
                      >
                        <Gift className="h-4 w-4 text-white" />
                        <span className="font-medium">Exclusive Deals</span>
                      </Badge>
                      <h3 className="mt-1 text-2xl md:text-4xl font- font-serif-instrumental mb-2 opacity-90">Unlock $1M+ in credits</h3>
                      <p className="text-white/70 mb-6 text-sm md:text-base max-w-md ">
                        Create an account to seamlessly claim all exclusive partner deals and securely save your bookmarks across devices.
                      </p>
                      <Link href="/login">
                        <Button className="bg-white text-black hover:bg-neutral-200 font-semibold px-6">
                          Create Free Account
                        </Button>
                      </Link>
                    </div>
                    <Image
                      src="/computer-in-dark.jpg"
                      alt="Unlock Credits"
                      width={320}
                      height={320}
                      className="absolute -bottom-20 md:-bottom-28 rounded-full -right-10 md:-right-4 opacity-50 md:opacity-80 pointer-events-none select-none mix-blend-screen"
                    />
                  </Card>
                )}

                {/* Banner 2: Ship faster */}
                {index === 14 && (
                  <Card className="col-span-1 sm:col-span-2 lg:col-span-3 p-6 md:p-8 bg-[#2C4839] relative text-white overflow-hidden my-2 sm:my-4 border-[#2C4839] hover:shadow-xl transition-shadow duration-300">
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12">
                      <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-2 border border-white/10">
                          <SparkleIcon size={16} weight="duotone" />
                          <span className="font-medium">Execution Engine</span>
                        </div>
                        <h3 className="text-2xl md:text-4xl font- font-serif-instrumental mb-3 opacity-90">Ship your startup faster</h3>
                        <p className="text-white/80 mb-4 text-sm md:text-base max-w-lg ">
                          Stop switching between tools. Manage tasks, track growth, and collaborate with your AI co-founder all in one centralized workspace.
                        </p>
                        <Link href="/dashboard">
                          <Button className="bg-white text-[#2C4839] hover:bg-neutral-200 font-semibold px-6">
                            Go to Dashboard
                          </Button>
                        </Link>
                      </div>
                      <div className="hidden md:block pr-8">
                        <div className="grid grid-cols-2 -gap-x-2 gap-y-3 opacity-90">
                          <div className="p-4 bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-xl">
                            <Layers className="h-8 w-8 text-white/90" />
                          </div>
                          <div className="p-4 bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center translate-y-6 backdrop-blur-sm shadow-xl">
                            <LineChart className="h-8 w-8 text-white/90" />
                          </div>
                          <div className="p-4 bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center -translate-y-6 backdrop-blur-sm shadow-xl">
                            <Users className="h-8 w-8 text-white/90" />
                          </div>
                          <div className="p-4 bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-xl">
                            <Cpu className="h-8 w-8 text-white/90" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 md:py-16">
            <Gift className="h-12 w-12 md:h-16 md:w-16 text-[#A6AEA4] mx-auto mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-[#0C1510] mb-2">No perks found</h3>
            <p className="text-[#0C1510]/60 mb-4">Try adjusting your search or filters</p>
            <Button
              onClick={() => {
                setSearchQuery('');
              }}
              className="bg-[#2C4839] hover:bg-[#0C1510]"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#0C1510] text-white py-8 md:py-12 px-4 mt-8 md:mt-12">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[#A6AEA4] mb-3 md:mb-4">
            Built with love for the startup community
          </p>
          <p className="text-xs md:text-sm text-[#A6AEA4]/60">
            Note: Perks and discounts are subject to change. Please verify details on the provider's website.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function StartupPerksPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F1EA]" />}>
      <StartupPerksContent />
    </Suspense>
  );
}
