-- Migration: Add Collaboration Support
-- Date: 2026-01-13
-- Description: Adds project_collaborators table and updates RLS policies to support shared projects

-- 1. Helper function to check project access
create or replace function public.has_project_role(project_id bigint, required_role text default 'reader')
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.projects p
    where p.id = project_id and p.user_id = auth.uid()
  ) or exists (
    select 1
    from public.project_collaborators pc
    where pc.project_id = project_id 
    and pc.user_id = auth.uid()
    and (
      required_role = 'reader' -- any role is fine
      or (required_role = 'editor' and pc.role in ('editor', 'owner'))
      or (required_role = 'owner' and pc.role = 'owner')
    )
  );
$$;

-- Helper function to get user_id by email
create or replace function public.get_user_id_by_email(user_email text)
returns uuid
language sql
security definer
stable
as $$
  select id
  from auth.users
  where email = user_email
  limit 1;
$$;

-- 2. Create collaborator role enum
-- Use 'create type if not exists' if supported, otherwise just create type
do $$ begin
    create type public.collaborator_role as enum ('owner', 'editor', 'reader');
exception
    when duplicate_object then null;
end $$;

-- 3. Create collaborators table
create table if not exists public.project_collaborators (
  id bigint generated always as identity primary key,
  project_id bigint references public.projects(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  email text not null,
  role public.collaborator_role not null default 'reader',
  invited_by uuid references auth.users(id) on delete set null,
  invited_at timestamptz default now(),
  accepted_at timestamptz,
  created_at timestamptz default now(),
  
  unique(project_id, user_id)
);

comment on table public.project_collaborators is 'Stores users who have access to projects with specific roles.';

-- 4. Enable RLS
alter table public.project_collaborators enable row level security;

-- 5. Collaborators Policies
drop policy if exists "Users can view collaborators of their projects" on public.project_collaborators;
create policy "Users can view collaborators of their projects"
  on public.project_collaborators
  for select
  to authenticated
  using (
    public.has_project_role(project_id, 'reader')
  );

drop policy if exists "Owners can manage collaborators" on public.project_collaborators;
create policy "Owners can manage collaborators"
  on public.project_collaborators
  for all
  to authenticated
  using (
    public.has_project_role(project_id, 'owner')
  )
  with check (
    public.has_project_role(project_id, 'owner')
  );

-- 6. Update Project Policies
drop policy if exists "Users can view their own projects" on public.projects;
create policy "Users can view their own and shared projects"
  on public.projects
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.project_collaborators where project_id = id and user_id = auth.uid())
  );

drop policy if exists "Users can insert their own projects" on public.projects;
create policy "Users can insert their own projects"
  on public.projects
  for insert
  to authenticated
  with check (user_id = auth.uid()); -- Only create projects as owner

drop policy if exists "Users can update their own projects" on public.projects;
create policy "Users can update their own and shared projects"
  on public.projects
  for update
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.project_collaborators 
      where project_id = id and user_id = auth.uid() and role in ('owner', 'editor')
    )
  );

drop policy if exists "Users can delete their own projects" on public.projects;
create policy "Users can delete projects they own"
  on public.projects
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.project_collaborators 
      where project_id = id and user_id = auth.uid() and role = 'owner'
    )
  );

-- 7. Update Sub-tables Policies (Versions, Tasks, Links, Notes, Secrets)

-- VERSIONS
drop policy if exists "Users can view versions of their own projects" on public.versions;
create policy "Users can view versions of accessible projects"
  on public.versions for select to authenticated
  using (public.has_project_role(project_id, 'reader'));

drop policy if exists "Users can insert versions to their own projects" on public.versions;
create policy "Users can insert versions to accessible projects"
  on public.versions for insert to authenticated
  with check (public.has_project_role(project_id, 'editor'));

drop policy if exists "Users can update versions of their own projects" on public.versions;
create policy "Users can update versions of accessible projects"
  on public.versions for update to authenticated
  using (public.has_project_role(project_id, 'editor'));

drop policy if exists "Users can delete versions of their own projects" on public.versions;
create policy "Users can delete versions of accessible projects"
  on public.versions for delete to authenticated
  using (public.has_project_role(project_id, 'editor'));

-- TASKS
drop policy if exists "Users can view tasks of their own projects" on public.tasks;
create policy "Users can view tasks of accessible projects"
  on public.tasks for select to authenticated
  using (public.has_project_role(project_id, 'reader'));

drop policy if exists "Users can insert tasks to their own projects" on public.tasks;
create policy "Users can insert tasks to accessible projects"
  on public.tasks for insert to authenticated
  with check (public.has_project_role(project_id, 'editor'));

drop policy if exists "Users can update tasks of their own projects" on public.tasks;
create policy "Users can update tasks of accessible projects"
  on public.tasks for update to authenticated
  using (public.has_project_role(project_id, 'editor'));

drop policy if exists "Users can delete tasks of their own projects" on public.tasks;
create policy "Users can delete tasks of accessible projects"
  on public.tasks for delete to authenticated
  using (public.has_project_role(project_id, 'editor'));

-- LINKS
drop policy if exists "Users can view links of their own projects" on public.links;
create policy "Users can view links of accessible projects"
  on public.links for select to authenticated
  using (public.has_project_role(project_id, 'reader'));

drop policy if exists "Users can insert links to their own projects" on public.links;
create policy "Users can insert links to accessible projects"
  on public.links for insert to authenticated
  with check (public.has_project_role(project_id, 'editor'));

drop policy if exists "Users can update links of their own projects" on public.links;
create policy "Users can update links of accessible projects"
  on public.links for update to authenticated
  using (public.has_project_role(project_id, 'editor'));

drop policy if exists "Users can delete links of their own projects" on public.links;
create policy "Users can delete links of accessible projects"
  on public.links for delete to authenticated
  using (public.has_project_role(project_id, 'editor'));

-- NOTES
drop policy if exists "Users can view notes of their own projects" on public.notes;
create policy "Users can view notes of accessible projects"
  on public.notes for select to authenticated
  using (public.has_project_role(project_id, 'reader'));

drop policy if exists "Users can insert notes to their own projects" on public.notes;
create policy "Users can insert notes to accessible projects"
  on public.notes for insert to authenticated
  with check (public.has_project_role(project_id, 'editor'));

drop policy if exists "Users can update notes of their own projects" on public.notes;
create policy "Users can update notes of accessible projects"
  on public.notes for update to authenticated
  using (public.has_project_role(project_id, 'editor'));

drop policy if exists "Users can delete notes of their own projects" on public.notes;
create policy "Users can delete notes of accessible projects"
  on public.notes for delete to authenticated
  using (public.has_project_role(project_id, 'editor'));

-- SECRETS
drop policy if exists "Users can view secrets of their own projects" on public.secrets;
create policy "Users can view secrets of accessible projects"
  on public.secrets for select to authenticated
  using (public.has_project_role(project_id, 'reader'));

drop policy if exists "Users can insert secrets to their own projects" on public.secrets;
create policy "Users can insert secrets to accessible projects"
  on public.secrets for insert to authenticated
  with check (public.has_project_role(project_id, 'editor'));

drop policy if exists "Users can update secrets of their own projects" on public.secrets;
create policy "Users can update secrets of accessible projects"
  on public.secrets for update to authenticated
  using (public.has_project_role(project_id, 'editor'));

drop policy if exists "Users can delete secrets of their own projects" on public.secrets;
create policy "Users can delete secrets of accessible projects"
  on public.secrets for delete to authenticated
  using (public.has_project_role(project_id, 'editor'));

