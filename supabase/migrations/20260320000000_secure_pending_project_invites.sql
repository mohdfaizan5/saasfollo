-- Migration: Secure pending project invites and add invite acceptance helpers
-- Date: 2026-03-20
-- Description: Pending invites can view the invite landing page, but only accepted collaborators can access project content.

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
    where pc.project_id = has_project_role.project_id
      and pc.user_id = auth.uid()
      and pc.accepted_at is not null
      and (
        required_role = 'reader'
        or (required_role = 'editor' and pc.role in ('editor', 'owner'))
        or (required_role = 'owner' and pc.role = 'owner')
      )
  );
$$;

drop policy if exists "Users can view collaborators of their projects" on public.project_collaborators;
create policy "Users can view collaborators of their projects"
  on public.project_collaborators
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or public.has_project_role(project_id, 'reader')
  );

drop policy if exists "Users can view their own and shared projects" on public.projects;
create policy "Users can view their own and shared projects"
  on public.projects
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.project_collaborators pc
      where pc.project_id = projects.id
        and pc.user_id = auth.uid()
        and pc.accepted_at is not null
    )
    or exists (
      select 1
      from public.project_collaborators pc
      where pc.project_id = projects.id
        and pc.user_id = auth.uid()
        and pc.accepted_at is null
    )
  );

drop policy if exists "Users can update their own and shared projects" on public.projects;
create policy "Users can update their own and shared projects"
  on public.projects
  for update
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.project_collaborators pc
      where pc.project_id = projects.id
        and pc.user_id = auth.uid()
        and pc.accepted_at is not null
        and pc.role in ('owner', 'editor')
    )
  );

drop policy if exists "Users can delete projects they own" on public.projects;
create policy "Users can delete projects they own"
  on public.projects
  for delete
  to authenticated
  using (
    user_id = auth.uid()
    or exists (
      select 1
      from public.project_collaborators pc
      where pc.project_id = projects.id
        and pc.user_id = auth.uid()
        and pc.accepted_at is not null
        and pc.role = 'owner'
    )
  );

create or replace function public.accept_project_invitation(collaborator_nanoid text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation_id bigint;
begin
  update public.project_collaborators
  set accepted_at = timezone('utc', now())
  where nanoid = collaborator_nanoid
    and user_id = auth.uid()
    and accepted_at is null
  returning id into invitation_id;

  if invitation_id is null then
    raise exception 'Invitation not found';
  end if;
end;
$$;

grant execute on function public.accept_project_invitation(text) to authenticated;

create or replace function public.decline_project_invitation(collaborator_nanoid text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation_id bigint;
begin
  delete from public.project_collaborators
  where nanoid = collaborator_nanoid
    and user_id = auth.uid()
    and accepted_at is null
  returning id into invitation_id;

  if invitation_id is null then
    raise exception 'Invitation not found';
  end if;
end;
$$;

grant execute on function public.decline_project_invitation(text) to authenticated;
