-- =============================================================================
-- Migration: Add User Onboarding Table
-- Purpose: Stores onboarding answers for user segmentation, AI persona config,
--          and commitment tracking
-- Affected Tables: user_onboarding
-- =============================================================================

create table public.user_onboarding (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,

  -- Step 1: Stage identification
  stage text not null check (stage in (
    'just_an_idea',
    'building_mvp',
    'launched_no_revenue',
    'making_revenue',
    'fulltime'
  )),

  -- Branch questions (stored as JSONB for flexibility per branch)
  branch_answers jsonb not null default '{}',

  -- Step 2: Identity reinforcement
  weakest_role text check (weakest_role in (
    'cto', 'marketer', 'copywriter', 'strategist', 'all'
  )),

  -- Step 3: Commitment trigger
  next_version_goal text,
  ship_date date,

  -- Step 4: Emotional hook
  if_nothing_changes text,

  -- System-derived config
  ai_persona text[] not null default '{}',
  focus_areas text[] not null default '{}',

  -- Completion tracking
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.user_onboarding is 'Stores onboarding flow answers used for user segmentation, AI persona configuration, and psychological commitment triggers.';

-- enable row level security
alter table public.user_onboarding enable row level security;

-- RLS policies
create policy "Users can view their own onboarding"
  on public.user_onboarding
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own onboarding"
  on public.user_onboarding
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own onboarding"
  on public.user_onboarding
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Index for fast lookup
create index idx_user_onboarding_user_id on public.user_onboarding(user_id);
