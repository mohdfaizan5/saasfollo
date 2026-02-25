# Dashboard Clarity Plan

## Goal
Make `/dashboard` the single source of truth by answering:
1. What changed?
2. What is left?
3. Are we on track?

## Proposed Sections

### 1) Time-window toggle (Nuqs)
- Add top toggle: `today | week | month`
- Store in query param via Nuqs: `?range=today|week|month`
- Every "Working On" metric reacts to this range

### 2) Working On (range-aware)
- Tasks completed in selected range
- Work done % = completed / (completed + created in range)
- Tasks created in selected range
- Net progress = completed - created
- Optional velocity = completed per day in range
If you can also add if there are more than one people in the team who created how many. I mean you can add some interesting data like, let us say, there are two people. Faizan created 32 tasks, he has done the most tasks this week. Okay, you can tell like you can also show compared to last week, this week we have done more tasks 30, we have completed 35 more tasks compared to last week, or something like this. 

### 3) Active version health
- Keep current active-version block
- Add deadline date
- Add time-left label:
  - `< 7 days` → `X days left`
  - `>= 7 days` → `Y weeks left`
- Add completion % for active version tasks (done vs total)

### 4) Left to do
- Finish-line estimate = remaining / recent velocity

### 5) Growth pulse
- Activities progressed in selected range
- Total growth log quantity in selected range
- Activities with zero progress (stuck)

## Data Sources (from schema)

### Build / Tasks
- `tasks.status`
- `tasks.is_completed`
- `tasks.created_at`
- `tasks.updated_at`
- `tasks.version_id`
- `tasks.priority`
- `tasks.category`

### Versions
- `projects.active_version_id`
- `versions.deadline`

### Growth
- `growth_logs.created_at`
- `growth_logs.quantity`
- `growth_activities.target_value`
- `growth_activities.completed_value`
- `growth_plans.version_id`
- `growth_plans.deadline`

## Important Caveat
Current schema has no dedicated task completion timestamp. "Done this week" is inferred from `tasks.updated_at`, which can drift if completed tasks are edited later.

### Accuracy upgrade options
- Add `tasks.completed_at` timestamp, or
- Add a `task_events` audit table

## MVP Delivery (Phase 1)
1. Nuqs range toggle (`today/week/month`)
2. Working On: completed / created / net progress
3. Active version: deadline + days/weeks left + completion %
4. Left to do: now/next/later + remaining count
5. Growth pulse: log quantity in selected range

## Next Iteration (Phase 2)
- Add readiness/risk score
- Add blockers/stalled items cards
- Add trend comparisons vs previous period
