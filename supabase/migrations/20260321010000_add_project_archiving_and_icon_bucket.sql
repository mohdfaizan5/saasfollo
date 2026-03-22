-- =============================================================================
-- Migration: Add project archiving and ensure project icon bucket exists
-- Purpose: Adds archive support to projects and creates the project-icons bucket
--          used by project image uploads.
-- =============================================================================

alter table public.projects
  add column if not exists is_archived boolean not null default false;

create index if not exists idx_projects_archived_pinned
  on public.projects using btree (user_id, is_archived, is_pinned, updated_at desc);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-icons',
  'project-icons',
  true,
  2097152,
  array[
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
    'image/webp'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Project icons are publicly readable'
  ) then
    create policy "Project icons are publicly readable"
      on storage.objects
      for select
      to public
      using (bucket_id = 'project-icons');
  end if;
end $$;
