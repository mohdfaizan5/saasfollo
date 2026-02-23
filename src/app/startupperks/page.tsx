'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { Search, Gift, ChevronRight, Sparkles, DollarSign, Grid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { startupPerks, categories, type StartupPerk } from '@/data/startupperks';
import { cn } from '@/lib/utils';
import { useQueryState } from 'nuqs';
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
  UsersIcon
} from '@phosphor-icons/react';

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

function PerkCard({ perk, index }: { perk: StartupPerk; index: number }) {
  const categoryInfo = categories.find(c => c.value === perk.category);
  const Icon = companyIcons[perk.companyName];

  return (
    <Link href={`/startupperks/${perk.companyName.toLowerCase().replace(/\s+/g, '-')}`}>
      <Card className="h-full hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-[#2C4839] bg-white group overflow-hidden">
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
        <CardContent className="pt-2">
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
          <div className="flex items-center text-[#2C4839] font-medium text-sm group-hover:translate-x-1 transition-transform">
            View details
            <ChevronRight className="h-4 w-4 ml-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function StartupPerksContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory] = useQueryState('category');

  const filteredPerks = useMemo(() => {
    let perks = selectedCategory && selectedCategory !== 'all'
      ? startupPerks.filter(p => p.category === selectedCategory)
      : startupPerks;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      perks = perks.filter(
        p =>
          p.companyName.toLowerCase().includes(query) ||
          p.perkName.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query)
      );
    }

    return perks;
  }, [searchQuery, selectedCategory]);

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

  const totalValue = filteredPerks.reduce((acc, perk) => {
    return acc + parseValue(perk.valueOrDiscount);
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
              <PerkCard key={perk.companyName} perk={perk} index={index} />
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
