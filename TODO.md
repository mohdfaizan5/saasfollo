# TODO / Backlog

Running list of ideas, half-built features, and fixes for SaaSfollo. This was previously living inside `README.md` — moved here so the README can stay focused on explaining the product. Nothing here is guaranteed or scheduled; it's a scratchpad.

## Versions

1. Add questions like "Goals for this version", "PRD md file", "Deadline (soft or hard)"
2. Turn creating a new version into a full guided flow of steps
3. Add a tabs-style layout for each version
4. Give at least basic PRD editing, and show an empty PRD state if none exists yet
5. Sort versions by creation date, or a specific sort order
6. Add ability to edit a version
7. Auto-set the active version, and if there's only one, make it the default
8. Show total number of versions, when each was created, and when it's ending
9. A clear way to make a version the active version

## Build (Kanban)

1. Let users add a "Section" tag to each task
2. ~~Fix the card UI that's broken due to the checkbox~~ ✅
3. ~~Give users the ability to create custom columns~~ ✅
4. Make task creation input simpler — remove redundant fields, widen the card

## Growth

1. Onboard users who don't have a growth plan attached to their version:
   - Ask which growth activities they primarily focus on (show them "Things SOLO founders do on growth", below)
   - For each selected activity, ask for a target number for this version and a deadline (e.g. "before this time, this much work will be done"):
     - 30 DMs sent on LinkedIn/X
     - 10 cold emails sent
     - 5 blog posts published
     - 2 videos published
     - 1 podcast episode published
     - 1 newsletter sent
   - After targets are set, show derived guidance like "based on your deadline, you need to do 10 cold emails per day"
   - Use icons for growth tasks, not emojis
2. `/growth` page
   - Use the growth plan data to show progress
   - "+" button opens a modal to pick which growth tasks to focus on
   - Daily streaks, with nudges for consistency (e.g. "you hit your target 5 days in a row")
   - A simple progress bar covering all targets and current progress
3. Should be able to switch versions from the growth page
4. Dedicated Kanban board for growth (separate from Build)
5. Some kind of animation/reward moment when logging a new growth entry

**Things solo founders do on growth** (in scope): SEO, cold DMs (X, etc.), cold emails, managing paid ads (Google/Facebook/LinkedIn), running A/B tests, monitoring analytics, gathering user feedback (surveys/calls), refining pricing models, optimizing website conversion rates, applying to startup accelerators, Reddit, attending events to promote the product.

**Explicitly not in scope**: creating content, iterating on value proposition, building partnerships, managing communities (Slack/Discord), pursuing PR opportunities, hosting webinars, networking at events.

## Homepage

- Show "13 tasks to complete for growth"
- Show "5 tasks to complete to finish v2/current version"
- Show how many days are left to finish the current version

## Small tools

- ICP builder (or at least a template)

## Blog ideas

- How to pick the right ideas
- Shareable infographics with the SaaSfollo logo

## Links

- Add tags to categorize links (e.g. by tech stack)

## Notes

- Make the editor proper (current EditorJS setup isn't solid yet)
- Implement a waterfall/masonry grid for notes

## Projects

- Make each project card look cleaner
- Show the most recently active project first
- Show collaborator avatars
- Show the current version as a card
- Make the feedback button actually work
- Add loading skeletons to all pages

## Onboarding

Needed at multiple levels: first-time app use, each project, each version, and each feature.

1. First-time app onboarding questions:
   - What is your name?
   - Website?
   - Why do you want SaaSfollo? (systems for marketing/sales, building product faster, gaining clarity)
   - Do you work solo or with a team?
   - Which version are you in? Take quick timelines and create a full version for them.
2. Each feature should have its own onboarding — a short explanation of how it's used, ideally with a video tutorial.

## Landing page

- Keep it simple: hero section + a benefits map section
- Intro/demo video for the app

## Brand colors

- Background: `#F6F1EA`
- `#2C4839`
- `#F6F1EA`
- `#A6AEA4`
- `#0C1510`
