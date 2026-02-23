export interface StartupPerk {
  companyName: string;
  perkName: string;
  valueOrDiscount: string;
  description: string;
  applyLink: string;
  category?: string;
}

export const startupPerks: StartupPerk[] = [
  {
    companyName: "Google Cloud",
    perkName: "Google for Startups Cloud Program",
    valueOrDiscount: "Up to $350,000",
    description: "Cloud credits over two years with additional perks for AI-focused startups. Includes access to Firebase, technical support, and Google Cloud training.",
    applyLink: "https://cloud.google.com/startup",
    category: "cloud"
  },
  {
    companyName: "Cloudflare",
    perkName: "Cloudflare for Startups",
    valueOrDiscount: "Up to $250,000",
    description: "Credits for Cloudflare's Developer Platform including Workers, Pages, R2 storage, D1 database, and enterprise-level security features for up to 3 domains.",
    applyLink: "https://www.cloudflare.com/forstartups/",
    category: "security"
  },
  {
    companyName: "Microsoft",
    perkName: "Microsoft for Startups Founders Hub",
    valueOrDiscount: "Up to $150,000",
    description: "Azure credits plus free GitHub Enterprise (20 seats), Microsoft 365, Visual Studio, and OpenAI credits. Includes technical support and mentorship.",
    applyLink: "https://foundershub.startups.microsoft.com/",
    category: "cloud"
  },
  {
    companyName: "Amazon Web Services",
    perkName: "AWS Activate",
    valueOrDiscount: "Up to $100,000",
    description: "AWS credits covering EC2, S3, Lambda, RDS, DynamoDB, and most AWS services. Includes technical support, training, and business guidance.",
    applyLink: "https://aws.amazon.com/activate/",
    category: "cloud"
  },
  {
    companyName: "DigitalOcean",
    perkName: "DigitalOcean Hatch",
    valueOrDiscount: "Up to $100,000",
    description: "Infrastructure credits for DigitalOcean's cloud platform, including Droplets, Kubernetes, managed databases, and Spaces object storage.",
    applyLink: "https://www.digitalocean.com/hatch",
    category: "cloud"
  },
  {
    companyName: "OVHcloud",
    perkName: "OVHcloud Startup Program",
    valueOrDiscount: "Up to €100,000",
    description: "Cloud credits for European infrastructure with 6 hours of 1:1 engineering support. Good for EU-local or dev/staging workloads.",
    applyLink: "https://startup.ovhcloud.com/",
    category: "cloud"
  },
  {
    companyName: "Retool",
    perkName: "Retool Startup Program",
    valueOrDiscount: "Up to $60,000",
    description: "Build internal tools, admin panels, and dashboards without coding. 1 year free plus 25% off second year and $200k+ in partner offers.",
    applyLink: "https://retool.com/startups",
    category: "development"
  },
  {
    companyName: "Mixpanel",
    perkName: "Mixpanel for Startups",
    valueOrDiscount: "$50,000",
    description: "One year free of Mixpanel Growth plan including product analytics, session replay (500K sessions), and unlimited seats.",
    applyLink: "https://mixpanel.com/startups",
    category: "analytics"
  },
  {
    companyName: "PostHog",
    perkName: "PostHog for Startups",
    valueOrDiscount: "$50,000",
    description: "All-in-one platform with product analytics, session replay, feature flags, A/B testing, and surveys. Free tier covers 30M events/month.",
    applyLink: "https://posthog.com/startups",
    category: "analytics"
  },
  {
    companyName: "Anthropic",
    perkName: "Anthropic Startup Program",
    valueOrDiscount: "$25,000",
    description: "Claude API credits with priority rate limits and access to Anthropic technical resources. Includes invitations to exclusive founder events.",
    applyLink: "https://www.anthropic.com/startups",
    category: "ai"
  },
  {
    companyName: "Twilio Segment",
    perkName: "Segment Startup Program",
    valueOrDiscount: "$25,000 value",
    description: "Full access to Segment's Team Plan for customer data platform connecting 450+ apps. Real-time data collection and analytics.",
    applyLink: "https://segment.com/industry/startups/",
    category: "analytics"
  },
  {
    companyName: "MongoDB",
    perkName: "MongoDB for Startups",
    valueOrDiscount: "Up to $20,000",
    description: "Atlas credits for MongoDB's multi-cloud database platform. Includes technical support and free access to MongoDB University.",
    applyLink: "https://www.mongodb.com/startups",
    category: "database"
  },
  {
    companyName: "Couchbase",
    perkName: "Couchbase Capella Starter Kit",
    valueOrDiscount: "$12,750 value",
    description: "Capella Credits, 3 virtual consulting days, and associate developer certification for modern AI-ready applications.",
    applyLink: "https://aws.amazon.com/startups/offers",
    category: "database"
  },
  {
    companyName: "Algolia",
    perkName: "Algolia Startup Program",
    valueOrDiscount: "$10,000",
    description: "Search and discovery platform credits for building fast, relevant search experiences in products.",
    applyLink: "https://www.algolia.com/startups/",
    category: "development"
  },
  {
    companyName: "Freshworks",
    perkName: "Freshworks for Startups",
    valueOrDiscount: "Up to $10,000",
    description: "Credits for Freshworks CRM, marketing automation, customer service, and IT service management tools.",
    applyLink: "https://www.freshworks.com/startups/",
    category: "crm"
  },
  {
    companyName: "Perplexity AI",
    perkName: "Perplexity Startup Program",
    valueOrDiscount: "$5,000",
    description: "API credits for Perplexity's search and answer engine, enabling AI-powered research and information retrieval.",
    applyLink: "https://www.perplexity.ai/hub/blog/introducing-the-perplexity-startup-program",
    category: "ai"
  },
  {
    companyName: "ElevenLabs",
    perkName: "ElevenLabs Grants Program",
    valueOrDiscount: "33 million characters (~$4,000+)",
    description: "12 months of Scale-tier access for voice AI including text-to-speech, voice cloning, and conversational AI agents. Over 680 hours of generated audio.",
    applyLink: "https://elevenlabs.io/startup-grants",
    category: "ai"
  },
  {
    companyName: "OpenAI",
    perkName: "OpenAI Startup Credits",
    valueOrDiscount: "Up to $2,500",
    description: "API credits for GPT-4, GPT-4o, DALL-E, and other OpenAI models. Available through partner programs like Ramp.",
    applyLink: "https://ramp.com/rewards/openai",
    category: "ai"
  },
  {
    companyName: "Notion",
    perkName: "Notion for Startups",
    valueOrDiscount: "Up to $1,000 (6 months free)",
    description: "All-in-one workspace for docs, wikis, and project management. 6 months free on Business Plan with Notion AI included.",
    applyLink: "https://www.notion.so/startups",
    category: "productivity"
  },
  {
    companyName: "Miro",
    perkName: "Miro for Startups",
    valueOrDiscount: "$1,000",
    description: "Online collaborative whiteboard for brainstorming, planning, and project management.",
    applyLink: "https://miro.com/startups/",
    category: "productivity"
  },
  {
    companyName: "Figma",
    perkName: "Figma Startup Program",
    valueOrDiscount: "$1,000",
    description: "Collaborative design platform for UI/UX, prototyping, and design systems. Real-time collaboration.",
    applyLink: "https://www.figma.com/startups/",
    category: "design"
  },
  {
    companyName: "Twilio",
    perkName: "Twilio Startups",
    valueOrDiscount: "$500",
    description: "Communication APIs for voice, video, SMS, and messaging. Build customer engagement solutions globally.",
    applyLink: "https://www.twilio.com/startups",
    category: "communication"
  },
  {
    companyName: "Supabase",
    perkName: "Supabase Startup Credits",
    valueOrDiscount: "$300",
    description: "Credits for Supabase's open-source Firebase alternative including Postgres database, authentication, storage, and edge functions.",
    applyLink: "https://supabase.com/partners/integrations",
    category: "database"
  },
  {
    companyName: "Stripe",
    perkName: "Stripe Atlas",
    valueOrDiscount: "$150 off incorporation + perks",
    description: "Delaware C-corp incorporation with tax ID, 83(b) filing, banking, and access to extensive partner perks and discounts.",
    applyLink: "https://stripe.com/atlas",
    category: "finance"
  },
  {
    companyName: "Intercom",
    perkName: "Intercom Early Stage Program",
    valueOrDiscount: "Up to 95% off",
    description: "Customer messaging platform with live chat, bots, and customer support tools at startup-friendly pricing.",
    applyLink: "https://www.intercom.com/early-stage",
    category: "crm"
  },
  {
    companyName: "HubSpot",
    perkName: "HubSpot for Startups",
    valueOrDiscount: "Up to 90% off",
    description: "CRM, marketing automation, sales, and customer service software at significant discounts.",
    applyLink: "https://www.hubspot.com/startups",
    category: "crm"
  },
  {
    companyName: "Dropbox",
    perkName: "Dropbox for Startups",
    valueOrDiscount: "40-90% off",
    description: "Discounts on Dropbox, DocSend, and Dropbox Sign for secure file storage, pitch deck sharing, and e-signatures.",
    applyLink: "https://www.dropbox.com/startups",
    category: "productivity"
  },
  {
    companyName: "GitHub",
    perkName: "GitHub for Startups",
    valueOrDiscount: "20 seats free (GitHub Enterprise)",
    description: "GitHub Enterprise for 12 months including advanced security, compliance tools, and project management features.",
    applyLink: "https://github.com/enterprise/startups",
    category: "development"
  },
  {
    companyName: "Linear",
    perkName: "Linear for Startups",
    valueOrDiscount: "Up to 6 months free",
    description: "Modern issue tracking and project management built for software teams. Fast, keyboard-first interface.",
    applyLink: "https://linear.app/startups",
    category: "productivity"
  },
  {
    companyName: "Zendesk",
    perkName: "Zendesk for Startups",
    valueOrDiscount: "6 months free",
    description: "Customer service, sales automation, and help desk software for building customer relationships.",
    applyLink: "https://www.zendesk.com/startups/",
    category: "crm"
  },
  {
    companyName: "Amplitude",
    perkName: "Amplitude Startup Scholarship",
    valueOrDiscount: "1 year free (Growth plan)",
    description: "Full access to Amplitude's paid Growth plan for product analytics, behavioral cohorts, and experimentation.",
    applyLink: "https://amplitude.com/startups",
    category: "analytics"
  },
  {
    companyName: "Datadog",
    perkName: "Datadog for Startups",
    valueOrDiscount: "1 year free",
    description: "Comprehensive monitoring platform including APM, infrastructure monitoring, log management, and real-time observability.",
    applyLink: "https://www.datadoghq.com/partner/datadog-for-startups/",
    category: "monitoring"
  },
  {
    companyName: "Zoho",
    perkName: "Zoho One for Startups",
    valueOrDiscount: "1 year free",
    description: "Bundle of 40+ applications including CRM, email, project management, finance, and HR tools.",
    applyLink: "https://www.zoho.com/one/startups/",
    category: "productivity"
  },
  {
    companyName: "Vercel",
    perkName: "Vercel for Startups",
    valueOrDiscount: "Varies by partner",
    description: "Credits and discounts for Vercel's frontend cloud platform. Automatic scaling, edge functions, and preview deployments included.",
    applyLink: "https://vercel.com/startups",
    category: "cloud"
  },
  {
    companyName: "PlanetScale",
    perkName: "PlanetScale Startup Program",
    valueOrDiscount: "Varies",
    description: "Credits for PlanetScale's serverless MySQL platform with branching, schema migrations, and infinite scale.",
    applyLink: "https://planetscale.com/startups",
    category: "database"
  },
  {
    companyName: "Sentry",
    perkName: "Sentry Startup Program",
    valueOrDiscount: "Free tier + discounts",
    description: "Error tracking and performance monitoring with detailed stack traces, breadcrumbs, and release tracking.",
    applyLink: "https://sentry.io/for/startups/",
    category: "monitoring"
  },
  {
    companyName: "Atlassian",
    perkName: "Atlassian for Startups",
    valueOrDiscount: "Free/discounted access",
    description: "Access to Jira, Confluence, Trello, and other Atlassian products for project management and documentation.",
    applyLink: "https://www.atlassian.com/software/startups",
    category: "productivity"
  },
  {
    companyName: "Canva",
    perkName: "Canva for Teams",
    valueOrDiscount: "Free tier + discounts",
    description: "Design platform for marketing materials, presentations, social media, and brand assets.",
    applyLink: "https://www.canva.com/teams/",
    category: "design"
  },
  {
    companyName: "Brex",
    perkName: "Brex for Startups",
    valueOrDiscount: "Exclusive partner deals",
    description: "Corporate card with no personal guarantee and extensive partner discounts through their deal book.",
    applyLink: "https://www.brex.com/startups",
    category: "finance"
  },
  {
    companyName: "Ramp",
    perkName: "Ramp Partner Perks",
    valueOrDiscount: "Extensive partner deals",
    description: "Corporate card and expense management with partner perks including OpenAI credits and software discounts.",
    applyLink: "https://ramp.com/rewards",
    category: "finance"
  },
  {
    companyName: "Gusto",
    perkName: "Gusto for Startups",
    valueOrDiscount: "Discounted pricing",
    description: "Payroll, benefits, and HR platform designed for small businesses and startups.",
    applyLink: "https://gusto.com/partners",
    category: "hr"
  }
];

export const categories = [
  { value: "all", label: "All Categories", color: "#2C4839" },
  { value: "cloud", label: "Cloud & Infrastructure", color: "#4285F4" },
  { value: "database", label: "Database", color: "#4DB33D" },
  { value: "ai", label: "AI & Machine Learning", color: "#9334E9" },
  { value: "analytics", label: "Analytics", color: "#FF6D00" },
  { value: "development", label: "Development Tools", color: "#00ACC1" },
  { value: "security", label: "Security", color: "#E53935" },
  { value: "crm", label: "CRM & Marketing", color: "#FF4081" },
  { value: "productivity", label: "Productivity", color: "#7CB342" },
  { value: "design", label: "Design", color: "#D81B60" },
  { value: "communication", label: "Communication", color: "#5E35B1" },
  { value: "monitoring", label: "Monitoring", color: "#039BE5" },
  { value: "finance", label: "Finance & Banking", color: "#00897B" },
  { value: "hr", label: "HR & Payroll", color: "#F4511E" },
];

export function getPerksByCategory(category: string): StartupPerk[] {
  if (category === "all") return startupPerks;
  return startupPerks.filter(perk => perk.category === category);
}

export function getPerkByCompany(companyName: string): StartupPerk | undefined {
  return startupPerks.find(
    perk => perk.companyName.toLowerCase().replace(/\s+/g, "-") === companyName.toLowerCase()
  );
}
