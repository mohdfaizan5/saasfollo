-- =============================================================================
-- Migration: Add tag field to links
-- Purpose: Enables single-tag categorization so links can be grouped/sorted by tag
-- =============================================================================

alter table public.links
  add column if not exists tag text;

create index if not exists idx_links_project_tag
  on public.links (project_id, lower(tag));
