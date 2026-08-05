# SaaSfollo

A daily-use operating system for solo founders (and very small teams) building a SaaS product.

## What it is

Most founders end up spread across a pile of disconnected tools — Notion for notes, Trello for tasks, a spreadsheet for growth metrics, a bookmarks folder for important links. SaaSfollo replaces that with one focused place that always answers four questions:

- What are we building **now**?
- What's **next**?
- **Why** are we building it?
- Are we making **progress**?

It's deliberately minimal and opinionated — no roles/permissions, no sprints, no backlog grooming. If a team needs heavyweight process management, this isn't the tool for them.

### How it's used

1. **Sign up → Projects.** You can run multiple SaaS products, each fully separate. Only one project is "active" at a time, so the app and its AI assistant always stay focused on what you're actually working on.
2. **Versions** are the spine of each project — scope-based milestones (MVP, v1, v2...) rather than time-based sprints. Only one version is active at a time, and everything else (tasks, growth targets) hangs off it.
3. **Build** is a Now/Next/Later-style task board that's grown into a full drag-and-drop Kanban with custom columns, scoped to the active version.
4. **Growth** tracks founder-led growth work — cold DMs, cold emails, SEO, and similar — with targets, streaks, and progress bars. It's intentionally scoped to what a solo founder can actually do, not content/community/PR work.
5. **Notes** is a lightweight, Notion-lite space (rich text editor) for things like an ICP doc — not meant to become a full wiki.
6. **Links** is a dump for important project URLs (Figma, GitHub, Vercel...) with auto-detected icons.
7. **Secrets** is a password-gated store for project credentials, for small teams sharing access.
8. **AI Cofounder** is an in-app chat assistant that can take on personas (CTO, SEO expert, developer, customer, copywriter, content creator) and pull live project/task/version data into the conversation.
9. **Collaboration** — you can invite others into a project via an accept/pending invite flow.

Alongside the app itself, there's a public side: a **blog**, **resources** (SEO/copywriting guides), a **changelog**, and a **startup perks** directory of deals for founders.

## Tech stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript, Tailwind v4
- **UI**: shadcn, Radix UI, Base UI
- **Backend/Auth**: Supabase (Postgres + auth)
- **AI**: Vercel AI SDK, wired to both Anthropic and OpenAI models, plus a custom MCP server exposed at `/api/mcp` so the app's own data (tasks, versions, etc.) can be queried as MCP tools
- **CMS**: Sanity, powering the blog/content side
- **Payments**: Polar.sh

### Structure

```
src/app/projects/[projectId]/(protected)/
  dashboard/   build/   growth/   notes/
  links/       secrets/ versions/ aicofounder/  settings/
```

Each module above is its own route, gated behind a per-project protected layout. Public marketing/content pages (blog, resources, changelog, startup perks) live under `src/app/(public)`.

Database schema lives in `supabase/migrations` as incremental SQL files — start there to see how the data model (projects → versions → tasks, collaborators, growth plans, kanban columns) evolved.

## Getting started

```bash
bun install
bun run dev
```

You'll need a `.env.local` with (at minimum):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
ANTHROPIC_API_KEY=
AI_GATEWAY_API_KEY=
POLAR_ACCESS_TOKEN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

## Product docs

- [`prd-v0-mvp.md`](prd-v0-mvp.md), [`prd-v1.md`](prd-v1.md), [`prd-v2.md`](prd-v2.md) — the product requirements docs for each stage
- [`ai-rules.md`](ai-rules.md) — coding conventions for this repo
- [`TODO.md`](TODO.md) — current backlog: half-built features, known gaps, and ideas not yet started
