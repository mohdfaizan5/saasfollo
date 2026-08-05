-- =============================================================================
-- Migration: Add task-media storage bucket
-- Purpose: Creates the public `task-media` bucket used to host images embedded
--          in rich-text task descriptions (uploaded via the Tiptap editor on
--          the Build board). Mirrors the existing `project-icons` bucket setup:
--          public read, size-limited, image mime types only.
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'task-media',
  'task-media',
  true,
  5242880, -- 5 MB per image
  array[
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp'
  ]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Public read so <img src> resolves without signed URLs (same as project icons).
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Task media is publicly readable'
  ) then
    create policy "Task media is publicly readable"
      on storage.objects
      for select
      to public
      using (bucket_id = 'task-media');
  end if;
end $$;

-- Authenticated users may upload into task-media. Fine-grained per-project
-- authorization is enforced in the server action before the upload runs.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated users can upload task media'
  ) then
    create policy "Authenticated users can upload task media"
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'task-media');
  end if;
end $$;
