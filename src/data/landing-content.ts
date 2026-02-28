// ============================================================================
// Landing Page Content Variations
// ============================================================================
// Each variation uses a different marketing psychology angle + copywriting
// principles (clarity, specificity, benefits > features, customer language).
//
// Rendered in page.tsx via random selection. Each section component accepts
// its corresponding content type as a prop.
// ============================================================================

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface HeroContent {
  preHeadline: string;
  headline: string;
  postHeadline: string;
  subheadline: string;
  cta: string;
}

export interface TaglineContent {
  subtitle: string;
  headlineBefore: string;
  headlineEmphasis: string;
  headlineAfter: string;
}

export interface HowItWorksStep {
  label: string;
  headline: string;
  headlineItalic: string;
  description: string;
}

export interface HowItWorksContent {
  sectionHeadlineBefore: string;
  sectionHeadlineEmphasis: string;
  steps: [HowItWorksStep, HowItWorksStep, HowItWorksStep, HowItWorksStep];
}

export interface WhySaasfolloContent {
  subtitle: string;
  headlineBefore: string;
  headlineEmphasis: string;
  headlineAfter: string;
  items: [string, string, string, string, string];
}

export interface ManifestoContent {
  heading: string;
  intro: string;
  premise: string;
  boldStatement: string;
  body: string;
  extension: string;
  closing: string;
  signoff: string;
  cta: string;
}

export interface CTAContent {
  headlineBefore: string;
  headlineEmphasis: string;
  headlineAfter: string;
  subheadline: string;
  cta: string;
}

export interface LandingPageVariation {
  id: string;
  name: string;
  psychologyAngle: string;
  hero: HeroContent;
  tagline: TaglineContent;
  howItWorks: HowItWorksContent;
  whySaasfollo: WhySaasfolloContent;
  manifesto: ManifestoContent;
  cta: CTAContent;
}

// ---------------------------------------------------------------------------
// Variations
// ---------------------------------------------------------------------------

export const landingContent: LandingPageVariation[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // 0 · FINAL ------------ Loss Aversion + Present Bias
  //   Psychology: Losses feel 2× as painful as equivalent gains (Kahneman).
  //   Present bias: emphasize what they're losing RIGHT NOW.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "loss-aversion",
    name: "Loss Aversion",
    psychologyAngle:
      "Loss aversion + present bias — frame around what founders are losing TODAY without a system✅",
    hero: {
      preHeadline: "When you need to ship faster, alone ",
      headline: "Last tool Solo-Founders will ever need",
      postHeadline: "unless your AI cofounder takes over",
      subheadline:
        "Backlogs grow forever. Versions ship. Define your next version with a clear goal and deadline. Ship it. Start the next one. This is how great products get built...",
      // subheadline:
      //   "Stop losing momentum to Notion tabs, Trello boards, and spreadsheet chaos. One system. One AI that knows your project. Everything your solo SaaS needs.",
      cta: "Stop losing time - start free ->",
    },
    tagline: {
      subtitle:
        "Right now, you're losing hours every week to tool-switching",
      headlineBefore: "What if one system ✅",
      headlineEmphasis: "gave you those hours back?✅",
      headlineAfter: "",
    },
    howItWorks: {
      sectionHeadlineBefore: "Built by a solo founder ",
      sectionHeadlineEmphasis: "for solo founders",
      steps: [
        {
          label: "Stop guessing what to ship",
          headline: "No more",
          headlineItalic: "endless backlogs",
          description:
            "Every week without a clear version goal is a week of scattered effort. Define what you're shipping, set a real deadline, and stop losing time to indecision.",
        },
        {
          label: "Stop tab-switching",
          headline: "No more",
          headlineItalic: "five tools open",
          description:
            "Tasks in Trello, notes in Notion, links in bookmarks, plans in your head. Every context-switch costs you focus. One workspace ends the chaos.",
        },
        {
          label: "Stop building blind",
          headline: "No more",
          headlineItalic: "guessing alone",
          description:
            "Need SEO advice but can't afford an expert? Architecture review at 2 AM? Your AI cofounder knows your project and gives CTO, SEO, or copywriter-level answers on demand.",
        },
        {
          label: "Stop ignoring marketing",
          headline: "No more",
          headlineItalic: "zero-growth weeks",
          description:
            "Skipping marketing for a week turns into a month. Track your growth channels daily, build streaks, and never let momentum die.",
        },
      ],
    },
    whySaasfollo: {
      subtitle: "What you stop losing with SaaSFollo",
      headlineBefore: "Reclaim your ",
      headlineEmphasis: "momentum",
      headlineAfter: "",
      items: [
        "Stop losing context — your AI cofounder remembers everything about your project",
        "Stop losing hours — switch from 5 tools to one unified system✅",
        "Stop losing direction — version-based planning keeps you focused on what ships✅",
        "Stop losing leads — daily growth tracking holds you accountable✅",
        "Stop losing confidence — get expert-level advice from AI personas on demand✅",
      ],
    },
    manifesto: {
      heading: "What are you\nlosing?",
      intro:
        "Every productivity tool was designed for teams. Sprints, standups, roadmaps for 20 people. Solo founders got left with duct-taped workflows that drain more energy than they save.✅",
      premise: "Here's the real cost:",
      boldStatement:
        "Every hour spent managing tools is an hour not spent building your product.✅",
      body:
        "SaaSFollo eliminates that cost. An AI cofounder that knows your project inside out — your tasks, versions, growth data. Ask it for CTO advice, SEO strategy, or honest customer feedback. It's always there.✅",
      extension:
        "Add version-based planning, kanban boards, and growth tracking with daily streaks. One system replaces five tools and keeps you accountable.",
      closing:
        "SaaSFollo isn't another productivity tool. It's the system that stops the bleeding. Plan. Build. Grow. Repeat.",
      signoff: "The question is: how much more can you afford to lose?",
      cta: "Stop the bleeding",
    },
    cta: {
      headlineBefore: "The founders who ship ✅",
      headlineEmphasis: "have a system",
      headlineAfter: "",
      subheadline:
        "Yours starts here. No credit card. No commitment. Just clarity.",
      cta: "Create your system now",
    },


  },
  // ─────────────────────────────────────────────────────────────────────────
  // 1 · Loss Aversion + Present Bias
  //   Psychology: Losses feel 2× as painful as equivalent gains (Kahneman).
  //   Present bias: emphasize what they're losing RIGHT NOW.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "loss-aversion",
    name: "Loss Aversion",
    psychologyAngle:
      "Loss aversion + present bias — frame around what founders are losing TODAY without a system",
    hero: {
      preHeadline: "Every scattered tool is costing you",
      headline: "weeks you'll never get back",
      postHeadline: "unless your AI cofounder takes over",
      subheadline:
        "Stop losing momentum to Notion tabs, Trello boards, and spreadsheet chaos. One system. One AI that knows your project. Everything your solo SaaS needs.",
      cta: "Stop losing time — start free",
    },
    tagline: {
      subtitle:
        "Right now, you're losing hours every week to tool-switching",
      headlineBefore: "What if one system ",
      headlineEmphasis: "gave you those hours back?",
      headlineAfter: "",
    },
    howItWorks: {
      sectionHeadlineBefore: "Here's what changes ",
      sectionHeadlineEmphasis: "immediately",
      steps: [
        {
          label: "Stop guessing what to ship",
          headline: "No more",
          headlineItalic: "endless backlogs",
          description:
            "Every week without a clear version goal is a week of scattered effort. Define what you're shipping, set a real deadline, and stop losing time to indecision.",
        },
        {
          label: "Stop tab-switching",
          headline: "No more",
          headlineItalic: "five tools open",
          description:
            "Tasks in Trello, notes in Notion, links in bookmarks, plans in your head. Every context-switch costs you focus. One workspace ends the chaos.",
        },
        {
          label: "Stop building blind",
          headline: "No more",
          headlineItalic: "guessing alone",
          description:
            "Need SEO advice but can't afford an expert? Architecture review at 2 AM? Your AI cofounder knows your project and gives CTO, SEO, or copywriter-level answers on demand.",
        },
        {
          label: "Stop ignoring marketing",
          headline: "No more",
          headlineItalic: "zero-growth weeks",
          description:
            "Skipping marketing for a week turns into a month. Track your growth channels daily, build streaks, and never let momentum die.",
        },
      ],
    },
    whySaasfollo: {
      subtitle: "What you stop losing with SaaSFollo",
      headlineBefore: "Reclaim your ",
      headlineEmphasis: "momentum",
      headlineAfter: "",
      items: [
        "Stop losing context — your AI cofounder remembers everything about your project",
        "Stop losing hours — switch from 5 tools to one unified system",
        "Stop losing direction — version-based planning keeps you focused on what ships",
        "Stop losing leads — daily growth tracking holds you accountable",
        "Stop losing confidence — get expert-level advice from AI personas on demand",
      ],
    },
    manifesto: {
      heading: "What are you\nlosing?",
      intro:
        "Every productivity tool was designed for teams. Sprints, standups, roadmaps for 20 people. Solo founders got left with duct-taped workflows that drain more energy than they save.",
      premise: "Here's the real cost:",
      boldStatement:
        "Every hour spent managing tools is an hour not spent building your product.✅",
      body:
        "SaaSFollo eliminates that cost. An AI cofounder that knows your project inside out — your tasks, versions, growth data. Ask it for CTO advice, SEO strategy, or honest customer feedback. It's always there.",
      extension:
        "Add version-based planning, kanban boards, and growth tracking with daily streaks. One system replaces five tools and keeps you accountable.",
      closing:
        "SaaSFollo isn't another productivity tool. It's the system that stops the bleeding. Plan. Build. Grow. Repeat.",
      signoff: "The question is: how much more can you afford to lose?",
      cta: "Stop the bleeding",
    },
    cta: {
      headlineBefore: "How much longer will you ",
      headlineEmphasis: "do this alone?",
      headlineAfter: "",
      subheadline:
        "Your competitors have teams. You have tab chaos. Change that in 5 minutes.✅",
      cta: "Start your first project free",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 2 · Identity + Unity Principle
  //   Psychology: Shared identity drives influence. "One of us" is powerful.
  //   Liking/similarity bias — people say yes to those like themselves.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "identity-unity",
    name: "Identity & Unity",
    psychologyAngle:
      "Unity principle + similarity bias — tribal language, 'built by solo founders for solo founders'",
    hero: {
      preHeadline: "✅Built by a solo founder",
      headline: "✅for solo founders",
      postHeadline: "who refuse to settle for team tools",
      subheadline:
        "✅You're not a 20-person company. You don't need sprints and standups. You need an AI cofounder that gets the reality of building alone.",
      cta: "✅Join solo founders like you",
    },
    tagline: {
      subtitle:
        "✅You chose to build alone — that doesn't mean building blind",
      headlineBefore: "✅Meet the ",
      headlineEmphasis: "AI cofounder",
      headlineAfter: " that actually gets it",
    },
    howItWorks: {
      sectionHeadlineBefore: "How solo founders ",
      sectionHeadlineEmphasis: "actually ship",
      steps: [
        {
          label: "The way founders think",
          headline: "Plan in",
          headlineItalic: "versions, not sprints",
          description:
            "✅You don't do two-week sprints with nobody. Define your next version — clear goal, real deadline, specific tasks. Ship it. Move on. That's how solo founders work.",
        },
        {
          label: "The way founders build",
          headline: "✅One workspace,",
          headlineItalic: "zero distractions",
          description:
            "✅Tasks, kanban boards, notes, links — all tied to your current version. No more context-switching between tools built for someone else's workflow.",
        },
        {
          label: "The way founders decide",
          headline: "Your AI",
          headlineItalic: "cofounder gets it",
          description:
            "✅It knows your project, your stack, your goals. Ask for CTO-level advice, SEO strategy, or copywriting help. It doesn't give generic answers — it gives YOUR answers.",
        },
        {
          label: "The way founders grow",
          headline: "Marketing that",
          headlineItalic: "fits your life",
          description:
            "✅Pick your channels. Set realistic version based targets. Track daily. Build streaks. Solo founders who grow do the work consistently — this system makes sure you do.",
        },
      ],
    },
    whySaasfollo: {
      subtitle: "✅Made for the solo founder life",
      headlineBefore: "One of ",
      headlineEmphasis: "us",
      headlineAfter: "",
      items: [
        "An AI cofounder built for solo context — not a team chatbot",
        "Switch AI personas to match what you need: CTO, SEO expert, copywriter",
        "Designed for how you actually work — not how teams work",
        "Version-based planning because you ship alone, on your schedule",
        "✅Growth tracking that respects your bandwidth",
      ],
    },
    manifesto: {
      heading: "We know\nwho you are",
      intro:
        "✅You're the founder, the developer, the marketer, the support team, and the CEO. You didn't choose this because it was easy. You chose it because you'd rather build something real than play office politics.",
      premise: "✅We built SaaSFollo because:",
      boldStatement:
        "✅Solo founders deserve tools that respect how they actually work.",
      body:
        "Your AI cofounder knows your project — tasks, versions, growth data, everything. Switch personas to get the expertise you need: CTO for architecture, SEO expert for keywords, copywriter for landing pages, honest customer for reality checks.",
      extension:
        "✅Version-based planning keeps you shipping. Growth tracking keeps you marketing. One system replaces the five tools built for teams of twenty.",
      closing:
        "✅SaaSFollo is built by a solo founder, for solo founders. No more adapting team tools to your reality.",
      signoff: "✅Welcome to the tribe.",
      cta: "✅Join the builders",
    },
    cta: {
      // if you understood this far, you're one of us. if you don't understand it, you probably won't get the product. this is a final test to create a sense of belonging for those who made it through the whole page.
      headlineBefore: "✅If you've read this far, ",
      headlineEmphasis: "✅you're one of us",
      headlineAfter: "",
      subheadline:
        "✅Solo founders who ship real products. No excuses. No waiting for permission.",
      cta: "✅Join solo founders like you",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 3 · Jobs to Be Done
  //   Psychology: JTBD framework — focus on outcomes, not features.
  //   Functional job: ship SaaS. Emotional job: feel in control.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "jobs-to-be-done",
    name: "Jobs to Be Done",
    psychologyAngle:
      "JTBD + outcome focus — every section answers 'what outcome do I get?'",
    hero: {
      // ✅
      preHeadline: "When you need to",
      headline: "ship faster, alone",
      postHeadline: "your AI cofounder clears the path",
      subheadline:
        "✅Plan your next version. Get CTO-level architecture advice. Track growth daily. The complete operating system for turning your solo SaaS from idea to revenue.",
      cta: "✅Create your first version",
    },
    tagline: {
      subtitle: "✅You don't need another tool — you need outcomes",
      headlineBefore: "✅Plan. Build. Grow. ",
      headlineEmphasis: "Repeat.",
      headlineAfter: "",
    },
    howItWorks: {
      sectionHeadlineBefore: "Four steps from idea to ",
      sectionHeadlineEmphasis: "revenue",
      steps: [
        // ✅
        {
          label: "Define what ships this month",
          headline: "Set your",
          headlineItalic: "version goal",
          description:
            "What are you shipping? Set a clear goal, a hard deadline, and the exact tasks to get there. One version at a time. No endless backlogs dragging you down.",
        },
        {
          label: "Build without context-switching",
          headline: "Execute in",
          headlineItalic: "one workspace",
          description:
            "Tasks, kanban, notes, and links — all connected to your active version. Everything you need to build, accessible in one place without switching tabs.",
        },
        {
          label: "Get expert advice in seconds",
          headline: "Ask your",
          headlineItalic: "AI cofounder",
          description:
            "Need an architecture review? SEO keyword strategy? Landing page copy? Your AI cofounder knows your project context and delivers expert-level answers as a CTO, SEO specialist, or copywriter.",
        },
        {
          label: "Turn consistency into customers",
          headline: "Track your",
          headlineItalic: "growth daily",
          description:
            "Pick your channels — SEO, cold DMs, Reddit, cold emails. Set weekly targets, track daily progress, and build streaks. Consistency is how solo founders get customers.",
        },
      ],
    },
    whySaasfollo: {
      subtitle: "What SaaSFollo does for you",
      headlineBefore: "Clear outcomes, ",
      headlineEmphasis: "every day",
      headlineAfter: "",
      items: [
        "An AI cofounder that gives project-specific advice — not generic templates",
        "6 expert personas on demand: CTO, SEO, developer, customer, copywriter, content creator",
        "✅One workspace replacing Notion, Trello, and spreadsheets",
        "✅Version-based planning that forces you to ship, not just plan",
        "✅Growth tracking that turns marketing from 'should do' to 'done'",
      ],
    },
    manifesto: {
      heading: "What this\ngives you",
      intro:
        "✅Every productivity tool promises to help you do more. Most just give you more settings to configure and more dashboards to check. You end up managing the tool instead of building your product.",
      premise: "SaaSFollo takes a different approach:",
      boldStatement:
        "✅One system. One AI cofounder. Every outcome a solo founder needs.",
      body:
        "✅Your AI cofounder understands your project context — tasks, versions, growth data. Ask for CTO advice on your architecture, SEO strategy for your niche, or copywriting for your launch page. Real answers, not generic ones.",
      extension:
        "✅Version-based planning keeps you shipping monthly. Kanban boards keep your days organized. Growth tracking with daily streaks keeps marketing from falling off your plate.",
      closing:
        "✅The outcome: you ship faster, grow consistently, and finally feel in control of your SaaS. Plan. Build. Grow. Repeat.",
      signoff: "This is the system.",
      cta: "Start building today",
    },
    cta: {
      headlineBefore: "Ready to ship your ",
      headlineEmphasis: "next version?",
      headlineAfter: "",
      subheadline:
        "✅Define it. Build it. Grow it. Your AI cofounder helps at every step.",
      cta: "Define your first version",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 4 · Curiosity + Zeigarnik Effect
  //   Psychology: Open loops create mental tension. Rhetorical questions
  //   pull the reader forward. Unfinished thoughts demand resolution.✅
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "curiosity-zeigarnik",
    name: "Curiosity & Open Loops",
    psychologyAngle:
      "Zeigarnik effect + curiosity gap — every section opens a loop that pulls the reader forward",
    hero: {
      // pitch
      preHeadline: "✅What would happen if",
      headline: "✅you had a cofounder?",
      postHeadline: "✅one that never sleeps, never quits",
      subheadline:
        "✅An AI that knows your codebase, your growth data, your roadmap. That thinks like a CTO one minute and a copywriter the next. Curious?",
      cta: "See it for yourself",
    },
    tagline: {
      // pitch✅
      subtitle: "You've probably wondered this before",
      headlineBefore: "What if building alone ",
      headlineEmphasis: "didn't mean building blind?",
      headlineAfter: "",
    },
    howItWorks: {
      sectionHeadlineBefore: "Ever wonder what a ",
      sectionHeadlineEmphasis: "real system looks like?",
      steps: [
        {
          // ✅
          label: "What if you always knew what to build?",
          headline: "Imagine",
          headlineItalic: "total clarity",
          description:
            "What if every month started with a clear version goal, a real deadline, and a prioritized task list? No guessing. No anxiety about what to work on next.",
        },
        {
          // ✅
          label: "What if one tool was enough?",
          headline: "Imagine",
          headlineItalic: "zero tab chaos",
          description:
            "What if your tasks, kanban board, notes, and links all lived in one place, automatically connected to what you're building right now?",
        },
        {
          label: "What if you could ask an expert anything?",
          headline: "Imagine an",
          headlineItalic: "AI that knows you",
          description:
            "What if you could ask for SEO advice, architecture reviews, or copy feedback — and the AI actually knew your project, your tech stack, and your goals?",
        },
        {
          label: "What if marketing wasn't so hard?",
          headline: "Imagine",
          headlineItalic: "daily momentum",
          description:
            "What if you had a system that tracked your outreach, built streaks, and made sure growth never fell off your plate?",
        },
      ],
    },
    whySaasfollo: {
      subtitle: "Still wondering if this is real?",
      headlineBefore: "The answers are ",
      headlineEmphasis: "already here",
      headlineAfter: "",
      items: [
        // ✅
        "Yes, the AI actually knows your entire project — it's not a generic chatbot",
        "Yes, it switches between CTO, SEO expert, copywriter, and more — on demand",
        "✅Yes, it replaces Notion, Trello, and your spreadsheet chaos",
        "✅Yes, version-based planning actually helps you ship — not just plan",
        "✅Yes, daily growth tracking works — consistency beats everything",
      ],
    },
    manifesto: {
      heading: "What if we\ntold you...",
      intro:
        // ✅pitch and copy
        "✅Every productivity tool promises to make you more organized. But have you noticed? You spend more time organizing than building. More time configuring than creating.",
      premise: "✅So we asked a different question:",
      boldStatement: // ✅pitch
        "✅What if a solo founder could have a cofounder — without giving up equity?",
      body:
        "✅That's SaaSFollo. An AI cofounder that actually understands your project — your tasks, your versions, your growth data. Ask it to think like a CTO, review your SEO, write your launch copy, or challenge you like an honest customer.",
      extension:
        "✅Plus the system around it: version-based planning, kanban boards, growth tracking with daily streaks. One tool. Total clarity.",
      closing:
        // pitch cta, before tool
        "✅Still curious? There's only one way to find out if this changes how you build.",
      signoff: "The answer might surprise you.",
      cta: "Find out for yourself",
    },
    cta: {
      // pitch: onequestion I for you
      headlineBefore: "One question before ",
      headlineEmphasis: "you go",
      headlineAfter: "",
      subheadline:
        "What would you ask an AI that already knows your entire project?",
      cta: "Ask your AI cofounder",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 5 · Authority + Contrast Effect
  //   Psychology: Authority bias — credentials, structure, confidence.
  //   Contrast effect — "old way vs. new way" makes the upgrade vivid.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "authority-contrast",
    name: "Authority & Contrast",
    psychologyAngle:
      "Authority bias + contrast effect — confident positioning, before/after framing",
    hero: {
      preHeadline: "✅The operating system",
      headline: "solo founders trust",
      postHeadline: "to plan, build, and grow",
      subheadline:
        "Version-based planning. AI cofounder with 6 expert personas. Growth tracking with daily streaks. Everything scattered across 5 tools, unified in one system.",
      cta: "✅Start building with structure",
    },
    tagline: {
      subtitle:
        "✅There's a right way to build a SaaS solo — most founders haven't found it yet",
      headlineBefore: "✅Replace the chaos with ",
      headlineEmphasis: "a system that works",
      headlineAfter: "",
    },
    howItWorks: {
      sectionHeadlineBefore: "✅The proven system for ",
      sectionHeadlineEmphasis: "shipping solo",
      steps: [
        {
          label: "Old way: endless backlogs",
          headline: "New way:",
          headlineItalic: "version planning",
          description:
            "✅Backlogs grow forever. Versions ship. Define your next version with a clear goal and deadline. Ship it. Start the next one. This is how great products get built.",
        },
        {
          label: "Old way: five scattered tools",
          headline: "New way:",
          headlineItalic: "one workspace",
          description:
            "Notion for notes, Trello for tasks, spreadsheets for tracking. The old way wastes hours on context-switching. SaaSFollo puts everything in one connected workspace.",
        },
        {
          label: "Old way: Google for answers",
          headline: "New way:",
          headlineItalic: "AI cofounder",
          description:
            "The old way is Googling generic advice at 2 AM. The new way is asking an AI cofounder that knows your project, your stack, and your data — and answers as a CTO, SEO expert, or copywriter.",
        },
        {
          label: "Old way: marketing when you remember",
          headline: "New way:",
          headlineItalic: "daily streaks",
          description:
            "Marketing 'when you have time' means never. Daily streaks, weekly targets, and channel tracking turn growth from wishful thinking into measurable action.",
        },
      ],
    },
    whySaasfollo: {
      subtitle: "✅Why serious founders choose SaaSFollo",
      // pitch and copy
      headlineBefore: "✅Structure beats ",
      headlineEmphasis: "hustle",
      headlineAfter: "",
      items: [
        "AI cofounder with project-level context — not another generic chatbot",
        "6 expert personas: CTO, SEO, developer, customer, copywriter, content creator",
        "Replaces Notion + Trello + spreadsheets with purpose-built tools",
        "Version-based planning proven to accelerate shipping",
        "Daily growth tracking that turns inconsistency into streaks",
      ],
    },
    manifesto: {
      heading: "The old way\nis broken",
      intro:
        "✅The productivity stack for solo founders has been broken for years. Tools built for 20-person teams. Sprints designed for standup meetings. Project boards that assume you have a project manager.",
      premise: "The new way starts with one idea:",
      boldStatement:
        "✅Solo founders don't need more tools. They need a cofounder who never sleeps.",
      body:
        "✅SaaSFollo gives you an AI cofounder that actually understands your project — tasks, versions, growth data. Ask it to think like a CTO, review your SEO strategy, write your landing page copy, or give you brutally honest customer feedback.",
      extension:
        "✅Then the system supports it: version-based planning for focused shipping, kanban boards for daily execution, growth tracking with streaks for consistent marketing.",
      closing:
      // Pitch
        "✅This isn't another project management tool dressed up with AI features. It's the operating system solo founders have been waiting for. Plan. Build. Grow. Repeat.",
        // pitch cta 
      signoff: "The old way is over.",
      cta: "Start the new way",
    },
    // ✅
    cta: {
      headlineBefore: "The founders who ship ",
      headlineEmphasis: "have a system",
      headlineAfter: "",
      subheadline:
        "Yours starts here. No credit card. No commitment. Just clarity.",
      cta: "Create your system now",
    },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // 6 · Reciprocity + Endowment Effect
  //   Psychology: Reciprocity — give first, people reciprocate.
  //   Endowment effect — once they "own" it, they won't give it up.
  //   Zero-price effect — "free" is psychologically different from cheap.
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "reciprocity-endowment",
    name: "Reciprocity & Endowment",
    psychologyAngle:
      "Reciprocity + endowment + zero-price effect — give everything free, create ownership",
    hero: {
      preHeadline: "Start with everything",
      headline: "✅pay when you're ready",
      postHeadline: "✅your AI cofounder is already waiting",
      subheadline:
        "✅Free project planning. Free AI cofounder with 6 expert personas. Free growth tracking. Build your SaaS with the full operating system from day one.",
      cta: "✅Get your free AI cofounder",
    },
    tagline: {
      subtitle:
        "✅We give you the full system first — no credit card, no catch",
      headlineBefore: "✅Your project. Your data. ",
      headlineEmphasis: "✅Your AI cofounder.",
      headlineAfter: "",
    },
    howItWorks: {
      sectionHeadlineBefore: "Everything you get, ",
      sectionHeadlineEmphasis: "starting today",
      steps: [
        {
          label: "Yours from minute one",
          headline: "Full version",
          headlineItalic: "planning",
          description:
            "Create your project, define your next version, set goals and deadlines. No feature gates, no 'upgrade to plan.' Your planning workspace is ready now.",
        },
        {
          label: "Yours to organize",
          headline: "Complete",
          headlineItalic: "build tools",
          description:
            "Tasks, kanban boards, notes, links — all connected to your versions. Organize your project your way. Every tool is available from your first login.",
        },
        {
          label: "Yours to ask anything",
          headline: "Your personal",
          headlineItalic: "AI cofounder",
          description:
            "An AI that knows your project and switches between CTO, SEO expert, copywriter, developer, customer, and content creator. Ask it anything — it's included.",
        },
        {
          label: "Yours to grow with",
          headline: "Full growth",
          headlineItalic: "tracking",
          description:
            "Pick your channels, set targets, track daily, build streaks. The same growth system used by solo founders making real revenue — available to you right now, free.",
        },
      ],
    },
    whySaasfollo: {
      subtitle: "Everything included, nothing held back",
      headlineBefore: "The full system, ",
      headlineEmphasis: "from day one",
      headlineAfter: "",
      items: [
        "AI cofounder with 6 expert personas — included free",
        "Version-based planning with goals and deadlines — no upgrade needed",
        "Tasks, kanban, notes, and links — all yours from the start",
        "Growth tracking with streaks and targets — no paywall",
        "Your data, your project, hosted and accessible — always",
      ],
    },
    manifesto: {
      heading: "Why we give\nyou everything",
      intro:
        "✅Most SaaS tools lure you in with a stripped-down free tier, then gate the features you actually need behind upgrades. We think that's backwards.",
      premise: "Our philosophy is simple:",
      boldStatement:
        "✅If you can't experience the full system, you can't know if it's right for you.",
      body:
        "Your AI cofounder is included from day one — not locked behind a paywall. Ask it for CTO advice, SEO strategy, or copy feedback. It knows your project context, your tasks, and your growth data.",
      extension:
        "Same with version planning, kanban boards, and growth tracking. The full operating system for solo founders, available the moment you sign up.",
      closing:
        "✅We built SaaSFollo because solo founders deserve complete tools, not stripped-down trials. Use it. Build with it. If it helps, stick around.",
      signoff: "It's already yours.",
      cta: "✅Claim your free workspace",
    },
    cta: {
      headlineBefore: "Your AI cofounder is ",
      headlineEmphasis: "already waiting",
      headlineAfter: "",
      subheadline:
        "✅Start free. Build your project. Ask your AI anything. No credit card required.",
      cta: "Claim your free project",
    },
  },
];

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

/** Return a random variation (deterministic within a single render). */
export function getRandomVariation(): LandingPageVariation {
  return landingContent[
    Math.floor(Math.random() * landingContent.length)
  ];
}
