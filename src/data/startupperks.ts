export interface StartupPerk {
  companyName: string;
  perkName: string;
  valueOrDiscount: string;
  description: string;
  applyLink: string;
  category?: string;
}

export const startupPerksRaw: StartupPerk[] = [
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
  },
  {
    companyName: "Google Cloud",
    perkName: "Google Cloud for Startups AI Program",
    valueOrDiscount: "Up to $350,000",
    description: "100% of usage up to $250k in year one, 20% up to $100k in year two. Designed to facilitate high-compute training phases of model development.",
    applyLink: "",
    category: "cloud"
  },
  {
    companyName: "Microsoft",
    perkName: "Microsoft for Startups Founders Hub",
    valueOrDiscount: "Up to $150,000",
    description: "Azure credits, free access to GitHub Enterprise (20 seats), Microsoft 365, LinkedIn Premium, and integrated Azure OpenAI Service credits.",
    applyLink: "",
    category: "cloud"
  },
  {
    companyName: "Amazon Web Services",
    perkName: "AWS Activate",
    valueOrDiscount: "Up to $100,000",
    description: "Credits valid for two years, alongside technical support and business development resources through its Portfolio and Portfolio+ tiers.",
    applyLink: "",
    category: "cloud"
  },
  {
    companyName: "Scaleway",
    perkName: "Scaleway Startup Program",
    valueOrDiscount: "€1,000 to €36,000 Credits",
    description: "European data sovereignty; no ingress/egress fees in some tiers. Tiered for Founders, Early Stage, and Growth Stage.",
    applyLink: "",
    category: "cloud"
  },
  {
    companyName: "Alibaba Cloud",
    perkName: "Global Startup",
    valueOrDiscount: "$120,000 Credits",
    description: "Strategic for ventures targeting Asian/Chinese markets.",
    applyLink: "",
    category: "cloud"
  },
  {
    companyName: "OVHcloud",
    perkName: "Startup Program",
    valueOrDiscount: "$12,000 to $120,000",
    description: "European infrastructure; strong data sovereignty focus.",
    applyLink: "",
    category: "cloud"
  },
  {
    companyName: "Akamai",
    perkName: "Compute & Edge",
    valueOrDiscount: "Up to $120,000",
    description: "Best for high-performance edge computing and storage.",
    applyLink: "",
    category: "cloud"
  },
  {
    companyName: "DigitalOcean",
    perkName: "Hatch Program",
    valueOrDiscount: "Up to $100,000",
    description: "Simple, developer-friendly; excellent pricing on NVIDIA GPUs.",
    applyLink: "",
    category: "cloud"
  },
  {
    companyName: "Vercel",
    perkName: "Vercel for Startups",
    valueOrDiscount: "Credits & Discounts",
    description: "Frontend-centric; automatic scaling and edge functions.",
    applyLink: "",
    category: "cloud"
  },
  {
    companyName: "Anthropic",
    perkName: "Anthropic Claude",
    valueOrDiscount: "$25,000",
    description: "VC partner access; for AI startups building with Claude.",
    applyLink: "",
    category: "ai"
  },
  {
    companyName: "OpenAI",
    perkName: "OpenAI Credits",
    valueOrDiscount: "$2,500",
    description: "Multiple paths; available via partners like Ramp.",
    applyLink: "",
    category: "ai"
  },
  {
    companyName: "Cohere",
    perkName: "Cohere Startup Program",
    valueOrDiscount: "$10,000",
    description: "Direct application; for enterprise AI applications.",
    applyLink: "",
    category: "ai"
  },
  {
    companyName: "Fireworks AI",
    perkName: "Fireworks AI Program",
    valueOrDiscount: "$10,000",
    description: "Serverless inference; access to hundreds of OS models.",
    applyLink: "",
    category: "ai"
  },
  {
    companyName: "Perplexity AI",
    perkName: "Perplexity AI",
    valueOrDiscount: "$5,000",
    description: "Enterprise Pro access; AI-powered research/retrieval.",
    applyLink: "",
    category: "ai"
  },
  {
    companyName: "Hugging Face",
    perkName: "Hugging Face Pro",
    valueOrDiscount: "6 Months Pro Free ($54 value)",
    description: "New/free tier accounts; claim via partner (e.g., XRaise). Enables ZeroGPU Spaces and private repositories.",
    applyLink: "",
    category: "ai"
  },
  {
    companyName: "Pinecone",
    perkName: "Pinecone for Startups",
    valueOrDiscount: "Standard Tier Access + Credits",
    description: "Free access to its Standard Tier and Pro Support for ventures with fewer than 100 employees at Series A or earlier.",
    applyLink: "",
    category: "database"
  },
  {
    companyName: "MongoDB",
    perkName: "MongoDB for Startups",
    valueOrDiscount: "Up to $20,000 Atlas Credits",
    description: "Credits for MongoDB Atlas databases.",
    applyLink: "",
    category: "database"
  },
  {
    companyName: "Supabase",
    perkName: "Startup Credits",
    valueOrDiscount: "$300 Credits",
    description: "Credits for Supabase database platform.",
    applyLink: "",
    category: "database"
  },
  {
    companyName: "Redis",
    perkName: "Redis for Startups",
    valueOrDiscount: "Up to $25,000 Credits",
    description: "Credits for Redis caching and database solutions.",
    applyLink: "",
    category: "database"
  },
  {
    companyName: "Neo4j",
    perkName: "Startup Program",
    valueOrDiscount: "Up to $16,000 Aura Credits",
    description: "Credits for Neo4j Aura graph database.",
    applyLink: "",
    category: "database"
  },
  {
    companyName: "Weights & Biases",
    perkName: "W&B Cloud Tier",
    valueOrDiscount: "Free individual tier / Marketplace credit redemption",
    description: "Industry standard for experiment visualization. Can redeem existing cloud credits for W&B Models or Weave.",
    applyLink: "",
    category: "ai"
  },
  {
    companyName: "LangChain",
    perkName: "LangSmith Startup Plan",
    valueOrDiscount: "50% off seats + 30,000 free traces/month",
    description: "Discount on seat pricing and free traces for two years. Critical for debugging agent execution.",
    applyLink: "",
    category: "development"
  },
  {
    companyName: "Razorpay",
    perkName: "Razorpay Rize",
    valueOrDiscount: "Up to ₹1 Crore (~$120,000) in benefits",
    description: "Includes payment credits, SaaS benefits, DPIIT recognition support, and discounted incorporation fees for the Indian market.",
    applyLink: "",
    category: "finance"
  },
  {
    companyName: "Xendit",
    perkName: "XenPlatform",
    valueOrDiscount: "Free VC Database / Platform access",
    description: "Digital payment infrastructure for SE Asia marketplaces. Automated payment splitting and compliance.",
    applyLink: "",
    category: "finance"
  },
  {
    companyName: "Jeeves",
    perkName: "Jeeves Benefits & Rewards",
    valueOrDiscount: "Up to $100,000 in savings",
    description: "Multi-currency corporate card. Perks include 25% off Slack, $5k in AWS credits, $50k in Segment credits.",
    applyLink: "",
    category: "finance"
  },
  {
    companyName: "Mercury",
    perkName: "Mercury Perk Bundles",
    valueOrDiscount: "$1,500 Cash Bonus",
    description: "Requires $20k deposit within 90 days and $10k card spend. Includes 6 months free Notion, 25% off Slack, 20% off Carta.",
    applyLink: "",
    category: "finance"
  },
  {
    companyName: "Brex",
    perkName: "Brex Rewards",
    valueOrDiscount: "150,000 Points",
    description: "Deposit $20k and spend $10k on Brex card.",
    applyLink: "",
    category: "finance"
  },
  {
    companyName: "Ramp",
    perkName: "Ramp Rewards",
    valueOrDiscount: "$1,500 Bonus",
    description: "Deposit $250k in Treasury and spend $10k. Uses AI to identify redundant software seats.",
    applyLink: "",
    category: "finance"
  },
  {
    companyName: "Rho",
    perkName: "Rho Rewards",
    valueOrDiscount: "$1,600 Cash Bonus",
    description: "Maintain $20k average daily balance for 90 days.",
    applyLink: "",
    category: "finance"
  },
  {
    companyName: "Arc",
    perkName: "Arc Rewards",
    valueOrDiscount: "$4,000 Cash Bonus",
    description: "Deposit $375k; maintained for 90 days.",
    applyLink: "",
    category: "finance"
  },
  {
    companyName: "Carta",
    perkName: "Launch Plan",
    valueOrDiscount: "Free Plan + Partner Stack",
    description: "Free for startups with <25 stakeholders or <$1M raised. Partner stack includes Airtable, Dialpad, Deel, Gusto, and Zendesk perks.",
    applyLink: "",
    category: "finance"
  },
  {
    companyName: "Pulley",
    perkName: "Pulley Startup/Growth",
    valueOrDiscount: "25% off Growth plan",
    description: "Real-time dilution modeling; 5-day 409A reports. Perks include $20k Stripe processing credits and 6 months Notion.",
    applyLink: "",
    category: "finance"
  },
  {
    companyName: "Clerky",
    perkName: "Company Lifetime Package",
    valueOrDiscount: "$100 off Lifetime Pkg",
    description: "In-house support; attorney-grade registered agent. Covers formation and unlimited fundraising/hiring products.",
    applyLink: "",
    category: "finance"
  },
  {
    companyName: "Stripe",
    perkName: "Stripe Atlas",
    valueOrDiscount: "$100 off",
    description: "Seamless integration with Stripe payments for Delaware C-Corp incorporation.",
    applyLink: "",
    category: "finance"
  },
  {
    companyName: "Notion",
    perkName: "Notion for Startups",
    valueOrDiscount: "6 months free",
    description: "Includes unlimited AI features, project management, and databases.",
    applyLink: "",
    category: "productivity"
  },
  {
    companyName: "Reclaim.ai",
    perkName: "Reclaim Startup Deal",
    valueOrDiscount: "20% discount for 3 years ($2,160 value)",
    description: "AI calendar that automatically schedules tasks and habits.",
    applyLink: "",
    category: "productivity"
  },
  {
    companyName: "GanttPRO",
    perkName: "GanttPRO Credit",
    valueOrDiscount: "$3,000 in free credit",
    description: "Gantt chart-based project management.",
    applyLink: "",
    category: "productivity"
  },
  {
    companyName: "Monday.com",
    perkName: "Monday.com Discount",
    valueOrDiscount: "20% off annual plan",
    description: "Discount applied for the first 12 months of use.",
    applyLink: "",
    category: "productivity"
  },
  {
    companyName: "Miro",
    perkName: "Miro Startup Deal",
    valueOrDiscount: "$1,000 in credits",
    description: "Digital whiteboarding. Requires partner affiliation ($500 without).",
    applyLink: "",
    category: "productivity"
  },
  {
    companyName: "Linear",
    perkName: "Linear Startup Program",
    valueOrDiscount: "6 months free",
    description: "For startups with fewer than 50 employees, typically gated by VC partner codes.",
    applyLink: "",
    category: "productivity"
  },
  {
    companyName: "Slack",
    perkName: "Slack Startup Discount",
    valueOrDiscount: "25-30% off Pro/Business+ plans",
    description: "Valid for teams with fewer than 200 employees.",
    applyLink: "",
    category: "communication"
  },
  {
    companyName: "HubSpot",
    perkName: "HubSpot for Startups",
    valueOrDiscount: "Up to 90% off Yr 1",
    description: "50% off Year 2, and 25% in perpetuity. For teams with less than $2M in funding; partner affiliation required.",
    applyLink: "",
    category: "crm"
  },
  {
    companyName: "Intercom",
    perkName: "Early Stage Program",
    valueOrDiscount: "93%-100% off Yr 1",
    description: "50% off Year 2, 25% off Year 3. For new customers with <25 employees and <$10M funding. Includes 6 Advanced seats and 300 free Fin AI resolutions/month.",
    applyLink: "",
    category: "crm"
  },
  {
    companyName: "Zendesk",
    perkName: "Zendesk for Startups",
    valueOrDiscount: "6 months free",
    description: "For startups with <50 employees; up to Series B funding.",
    applyLink: "",
    category: "crm"
  },
  {
    companyName: "Salesforce",
    perkName: "Salesforce CRM",
    valueOrDiscount: "CRM Discounts",
    description: "Includes business mentorship/marketing support.",
    applyLink: "",
    category: "crm"
  },
  {
    companyName: "Pipedrive",
    perkName: "Pipedrive Startups",
    valueOrDiscount: "50% off CRM tools",
    description: "Focus on sales pipelines and customer relations.",
    applyLink: "",
    category: "crm"
  },
  {
    companyName: "Freshworks",
    perkName: "Freshworks Credits",
    valueOrDiscount: "Up to $10,000 Credits",
    description: "Includes CRM, marketing, and service tools.",
    applyLink: "",
    category: "crm"
  },
  {
    companyName: "Datadog",
    perkName: "Datadog for Startups",
    valueOrDiscount: "1 Year Free (Pro)",
    description: "Up to $100k in credits; comprehensive visibility for cloud infrastructure.",
    applyLink: "",
    category: "monitoring"
  },
  {
    companyName: "New Relic",
    perkName: "New Relic for Startups",
    valueOrDiscount: "Credits & Discounts",
    description: "Perpetual free tier (100GB/mo data ingest). For Seed to Pre-Series B companies with <100 employees.",
    applyLink: "",
    category: "monitoring"
  },
  {
    companyName: "Grafana Labs",
    perkName: "Grafana Startups",
    valueOrDiscount: "$100,000 Credits",
    description: "12 months on managed cloud platform.",
    applyLink: "",
    category: "monitoring"
  },
  {
    companyName: "Aiven",
    perkName: "Aiven Startups",
    valueOrDiscount: "$100,000 Credits",
    description: "Managed open-source infrastructure (Kafka, PostgreSQL).",
    applyLink: "",
    category: "cloud"
  },
  {
    companyName: "Temporal Cloud",
    perkName: "Temporal Startups",
    valueOrDiscount: "$6,000 Credits",
    description: "For building reliable, long-running workflows. Startups must have raised $30M or less in the last 3 years.",
    applyLink: "",
    category: "development"
  },
  {
    companyName: "Snyk",
    perkName: "Snyk Ignite",
    valueOrDiscount: "$1,260/yr per dev",
    description: "Includes DAST, SCA, SAST, and IaC scanning. For organizations with fewer than 50 developers.",
    applyLink: "",
    category: "security"
  },
  {
    companyName: "Auth0",
    perkName: "Auth0 Startups",
    valueOrDiscount: "12 months free",
    description: "Adaptable authentication and authorization.",
    applyLink: "",
    category: "security"
  },
  {
    companyName: "GitLab",
    perkName: "GitLab Startups",
    valueOrDiscount: "1 Year Free Ultimate",
    description: "Up to 20 licenses; AI-driven DevSecOps.",
    applyLink: "",
    category: "development"
  },
  {
    companyName: "Okta",
    perkName: "Okta Startups",
    valueOrDiscount: "Up to $10,000 Credits",
    description: "Identity management for user authentication.",
    applyLink: "",
    category: "security"
  },
  {
    companyName: "Chainguard",
    perkName: "Chainguard Startups",
    valueOrDiscount: "15% off images",
    description: "Hardened container images for secure deployment.",
    applyLink: "",
    category: "security"
  },
  {
    companyName: "BoxyHQ",
    perkName: "BoxyHQ Credits",
    valueOrDiscount: "$2,000 in credits",
    description: "Open-source platform to help SaaS companies become enterprise-ready with minimal coding.",
    applyLink: "",
    category: "development"
  },
  {
    companyName: "Byteboard",
    perkName: "Byteboard Startups",
    valueOrDiscount: "First month free",
    description: "Project-based coding interviews designed to reform the recruiting process.",
    applyLink: "",
    category: "hr"
  },
  {
    companyName: "ElevenLabs",
    perkName: "ElevenLabs Grants",
    valueOrDiscount: "33 million free credits (~$4,000+ value)",
    description: "Industry-leading voice AI, covering text-to-speech and voice cloning for 12 months.",
    applyLink: "",
    category: "ai"
  },
  {
    companyName: "Deepgram",
    perkName: "Deepgram Startups",
    valueOrDiscount: "Transcription-heavy credits",
    description: "Speech-to-text APIs for AI voice applications.",
    applyLink: "",
    category: "ai"
  },
  {
    companyName: "SwagUp",
    perkName: "SwagUp Discount",
    valueOrDiscount: "10% off the first order",
    description: "Creating and distributing branded swag.",
    applyLink: "",
    category: "productivity"
  },
  {
    companyName: "Bench",
    perkName: "Bench Bookkeeping",
    valueOrDiscount: "30% off for three months",
    description: "Professional bookkeeping services for early-stage ventures.",
    applyLink: "",
    category: "finance"
  }
];

const isValidApplyLink = (link: string): boolean => /^https?:\/\//i.test(link.trim());

const buildGoogleSearchLink = (perkName: string): string => {
  const query = encodeURIComponent(perkName.trim());
  return `https://www.google.com/search?q=${query}`;
};

// Remove duplicate entries (keep first occurrence) by company+perk key
const seen = new Set<string>();
export const startupPerks: StartupPerk[] = startupPerksRaw
  .filter((perk) => {
    const key = `${perk.companyName}||${perk.perkName}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  })
  .map((perk) => ({
    ...perk,
    applyLink: isValidApplyLink(perk.applyLink)
      ? perk.applyLink.trim()
      : buildGoogleSearchLink(perk.perkName),
  }));

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
