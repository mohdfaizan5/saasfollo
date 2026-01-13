-- =============================================================================
-- Migration: Create Core Schema for SaaSfollo MVP
-- Purpose: Creates all core tables for projects, versions, tasks, links, notes,
--          secrets, and user settings with proper RLS policies
-- Affected Tables: projects, versions, tasks, links, notes, secrets, user_settings
-- =============================================================================

-- =============================================================================
-- USER SETTINGS TABLE
-- Stores user-level settings like secrets PIN hash
-- =============================================================================
create table public.user_settings (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  secrets_pin_hash text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.user_settings is 'Stores user-level settings including secrets PIN hash for revealing sensitive data.';

-- enable row level security
alter table public.user_settings enable row level security;

-- rls policies for user_settings
-- select: users can only view their own settings
create policy "Users can view their own settings"
  on public.user_settings
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- insert: users can only insert their own settings
create policy "Users can insert their own settings"
  on public.user_settings
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- update: users can only update their own settings
create policy "Users can update their own settings"
  on public.user_settings
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- delete: users can only delete their own settings
create policy "Users can delete their own settings"
  on public.user_settings
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- =============================================================================
-- PROJECTS TABLE
-- Core entity representing a SaaS product/project the user is building
-- =============================================================================
create table public.projects (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  active_version_id bigint, -- will add foreign key after versions table is created
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.projects is 'Core entity representing a SaaS product/project the user is building.';

-- enable row level security
alter table public.projects enable row level security;

-- rls policies for projects
-- select: users can only view their own projects
create policy "Users can view their own projects"
  on public.projects
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- insert: users can only insert their own projects
create policy "Users can insert their own projects"
  on public.projects
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- update: users can only update their own projects
create policy "Users can update their own projects"
  on public.projects
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- delete: users can only delete their own projects
create policy "Users can delete their own projects"
  on public.projects
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- =============================================================================
-- VERSIONS TABLE
-- Represents scope-based versions of a project (e.g. MVP, v1, Beta)
-- =============================================================================
create table public.versions (
  id bigint generated always as identity primary key,
  project_id bigint references public.projects(id) on delete cascade not null,
  name text not null,
  description text,
  status text default 'inactive' check (status in ('active', 'inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.versions is 'Represents scope-based versions of a project (e.g. MVP, v1, Beta).';

-- enable row level security
alter table public.versions enable row level security;

-- rls policies for versions
-- select: users can view versions of their own projects
create policy "Users can view versions of their own projects"
  on public.versions
  for select
  to authenticated
  using (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- insert: users can insert versions to their own projects
create policy "Users can insert versions to their own projects"
  on public.versions
  for insert
  to authenticated
  with check (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- update: users can update versions of their own projects
create policy "Users can update versions of their own projects"
  on public.versions
  for update
  to authenticated
  using (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  )
  with check (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- delete: users can delete versions of their own projects
create policy "Users can delete versions of their own projects"
  on public.versions
  for delete
  to authenticated
  using (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- =============================================================================
-- Now add the foreign key for active_version_id in projects
-- =============================================================================
alter table public.projects
  add constraint fk_projects_active_version
  foreign key (active_version_id)
  references public.versions(id)
  on delete set null;

-- =============================================================================
-- TASKS TABLE
-- Tasks organized by Now/Next/Later/Done, optionally tied to a version
-- =============================================================================
create table public.tasks (
  id bigint generated always as identity primary key,
  project_id bigint references public.projects(id) on delete cascade not null,
  version_id bigint references public.versions(id) on delete set null,
  title text not null,
  description text,
  status text default 'next' check (status in ('now', 'next', 'later', 'done')),
  priority text check (priority is null or priority in ('low', 'medium', 'high')),
  due_date date,
  assignee text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.tasks is 'Tasks organized by Now/Next/Later/Done status, optionally tied to a version.';

-- enable row level security
alter table public.tasks enable row level security;

-- rls policies for tasks
-- select: users can view tasks of their own projects
create policy "Users can view tasks of their own projects"
  on public.tasks
  for select
  to authenticated
  using (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- insert: users can insert tasks to their own projects
create policy "Users can insert tasks to their own projects"
  on public.tasks
  for insert
  to authenticated
  with check (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- update: users can update tasks of their own projects
create policy "Users can update tasks of their own projects"
  on public.tasks
  for update
  to authenticated
  using (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  )
  with check (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- delete: users can delete tasks of their own projects
create policy "Users can delete tasks of their own projects"
  on public.tasks
  for delete
  to authenticated
  using (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- =============================================================================
-- LINKS TABLE
-- Stores project-related links with auto-detected type
-- =============================================================================
create table public.links (
  id bigint generated always as identity primary key,
  project_id bigint references public.projects(id) on delete cascade not null,
  url text not null,
  detected_type text default 'generic',
  icon text,
  label text,
  created_at timestamptz default now()
);

comment on table public.links is 'Stores project-related links (Figma, GitHub, Vercel, etc.) with auto-detected type.';

-- enable row level security
alter table public.links enable row level security;

-- rls policies for links
-- select: users can view links of their own projects
create policy "Users can view links of their own projects"
  on public.links
  for select
  to authenticated
  using (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- insert: users can insert links to their own projects
create policy "Users can insert links to their own projects"
  on public.links
  for insert
  to authenticated
  with check (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- update: users can update links of their own projects
create policy "Users can update links of their own projects"
  on public.links
  for update
  to authenticated
  using (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  )
  with check (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- delete: users can delete links of their own projects
create policy "Users can delete links of their own projects"
  on public.links
  for delete
  to authenticated
  using (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- =============================================================================
-- NOTES TABLE
-- Simple markdown notes for dumping thoughts per project
-- =============================================================================
create table public.notes (
  id bigint generated always as identity primary key,
  project_id bigint references public.projects(id) on delete cascade not null,
  title text not null,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table public.notes is 'Simple markdown notes for dumping thoughts and ideas per project.';

-- enable row level security
alter table public.notes enable row level security;

-- rls policies for notes
-- select: users can view notes of their own projects
create policy "Users can view notes of their own projects"
  on public.notes
  for select
  to authenticated
  using (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- insert: users can insert notes to their own projects
create policy "Users can insert notes to their own projects"
  on public.notes
  for insert
  to authenticated
  with check (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- update: users can update notes of their own projects
create policy "Users can update notes of their own projects"
  on public.notes
  for update
  to authenticated
  using (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  )
  with check (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- delete: users can delete notes of their own projects
create policy "Users can delete notes of their own projects"
  on public.notes
  for delete
  to authenticated
  using (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- =============================================================================
-- SECRETS TABLE
-- Stores project-level secrets (key-value pairs) with encrypted values
-- =============================================================================
create table public.secrets (
  id bigint generated always as identity primary key,
  project_id bigint references public.projects(id) on delete cascade not null,
  key text not null,
  encrypted_value text not null,
  created_at timestamptz default now()
);

comment on table public.secrets is 'Stores project-level secrets (API keys, credentials) with encrypted values.';

-- enable row level security
alter table public.secrets enable row level security;

-- rls policies for secrets
-- select: users can view secrets of their own projects
create policy "Users can view secrets of their own projects"
  on public.secrets
  for select
  to authenticated
  using (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- insert: users can insert secrets to their own projects
create policy "Users can insert secrets to their own projects"
  on public.secrets
  for insert
  to authenticated
  with check (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- update: users can update secrets of their own projects
create policy "Users can update secrets of their own projects"
  on public.secrets
  for update
  to authenticated
  using (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  )
  with check (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- delete: users can delete secrets of their own projects
create policy "Users can delete secrets of their own projects"
  on public.secrets
  for delete
  to authenticated
  using (
    project_id in (
      select id from public.projects where user_id = (select auth.uid())
    )
  );

-- =============================================================================
-- INDEXES
-- Add indexes for commonly queried columns to improve performance
-- =============================================================================

-- index for projects by user_id (used in all RLS policies)
create index idx_projects_user_id on public.projects using btree (user_id);

-- index for versions by project_id
create index idx_versions_project_id on public.versions using btree (project_id);

-- index for tasks by project_id and status
create index idx_tasks_project_id on public.tasks using btree (project_id);
create index idx_tasks_status on public.tasks using btree (status);
create index idx_tasks_version_id on public.tasks using btree (version_id);

-- index for links by project_id
create index idx_links_project_id on public.links using btree (project_id);

-- index for notes by project_id
create index idx_notes_project_id on public.notes using btree (project_id);

-- index for secrets by project_id
create index idx_secrets_project_id on public.secrets using btree (project_id);

-- index for user_settings by user_id
create index idx_user_settings_user_id on public.user_settings using btree (user_id);
