-- Migration: Fix kanban column access for collaborators and seed defaults for all projects
-- Date: 2026-04-14

-- Update RLS policies so readers/editors on shared projects can access build columns.
drop policy if exists "Users can view kanban columns of their own projects" on public.kanban_columns;
drop policy if exists "Users can insert kanban columns to their own projects" on public.kanban_columns;
drop policy if exists "Users can update kanban columns of their own projects" on public.kanban_columns;
drop policy if exists "Users can delete kanban columns of their own projects" on public.kanban_columns;

create policy "Users can view kanban columns of accessible projects"
  on public.kanban_columns
  for select
  to authenticated
  using (public.has_project_role(project_id, 'reader'));

create policy "Editors can insert kanban columns of accessible projects"
  on public.kanban_columns
  for insert
  to authenticated
  with check (public.has_project_role(project_id, 'editor'));

create policy "Editors can update kanban columns of accessible projects"
  on public.kanban_columns
  for update
  to authenticated
  using (public.has_project_role(project_id, 'editor'))
  with check (public.has_project_role(project_id, 'editor'));

create policy "Editors can delete kanban columns of accessible projects"
  on public.kanban_columns
  for delete
  to authenticated
  using (public.has_project_role(project_id, 'editor'));

-- Backfill defaults for projects that still have no custom columns.
with projects_without_columns as (
  select p.id
  from public.projects p
  where not exists (
    select 1
    from public.kanban_columns kc
    where kc.project_id = p.id
  )
),
default_columns as (
  select *
  from (
    values
      ('Backlog'::text, 'Ideas and upcoming work'::text, 0::integer, false::boolean),
      ('In Progress'::text, 'Work currently moving'::text, 1::integer, false::boolean),
      ('Review'::text, 'QA or final checks'::text, 2::integer, false::boolean),
      ('Done'::text, 'Completed tasks'::text, 3::integer, true::boolean)
  ) as t(title, description, position, is_done_column)
)
insert into public.kanban_columns (project_id, title, description, position, is_done_column)
select p.id, d.title, d.description, d.position, d.is_done_column
from projects_without_columns p
cross join default_columns d;

-- Ensure new projects always get default kanban columns.
create or replace function public.seed_default_kanban_columns_for_project()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.kanban_columns
    where project_id = new.id
  ) then
    insert into public.kanban_columns (project_id, title, description, position, is_done_column)
    values
      (new.id, 'Backlog', 'Ideas and upcoming work', 0, false),
      (new.id, 'In Progress', 'Work currently moving', 1, false),
      (new.id, 'Review', 'QA or final checks', 2, false),
      (new.id, 'Done', 'Completed tasks', 3, true);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_seed_default_kanban_columns on public.projects;
create trigger trg_seed_default_kanban_columns
after insert on public.projects
for each row
execute function public.seed_default_kanban_columns_for_project();
