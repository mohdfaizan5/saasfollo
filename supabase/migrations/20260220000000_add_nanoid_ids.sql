-- =============================================================================
-- Migration: Add NanoID columns to all tables + Version fields (PRD, goals, deadline)
-- Purpose: Replace numeric predictable IDs with nanoid strings for public-facing URLs
--          and add PRD/goals/deadline support for the multi-step version creation wizard
-- =============================================================================

-- Enable pgcrypto for random bytes generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- Custom nanoid generator function
-- Generates URL-safe random strings using the nanoid alphabet
-- =============================================================================
CREATE OR REPLACE FUNCTION public.generate_nanoid(size int DEFAULT 18)
RETURNS text
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  -- nanoid standard alphabet (URL-safe, no ambiguous chars)
  alphabet text := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-';
  result text := '';
  bytes bytea;
  i int;
  idx int;
BEGIN
  bytes := gen_random_bytes(size);
  FOR i IN 0..size-1 LOOP
    -- mask to 6 bits (64 chars in alphabet) to avoid modulo bias
    idx := get_byte(bytes, i) & 63;
    result := result || substr(alphabet, idx + 1, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- =============================================================================
-- Add nanoid columns to all tables
-- =============================================================================

-- PROJECTS
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS nanoid text;
UPDATE public.projects SET nanoid = public.generate_nanoid(18) WHERE nanoid IS NULL;
ALTER TABLE public.projects ALTER COLUMN nanoid SET NOT NULL;
ALTER TABLE public.projects ALTER COLUMN nanoid SET DEFAULT public.generate_nanoid(18);
DO $$ BEGIN
  ALTER TABLE public.projects ADD CONSTRAINT projects_nanoid_unique UNIQUE (nanoid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- VERSIONS
ALTER TABLE public.versions ADD COLUMN IF NOT EXISTS nanoid text;
UPDATE public.versions SET nanoid = public.generate_nanoid(18) WHERE nanoid IS NULL;
ALTER TABLE public.versions ALTER COLUMN nanoid SET NOT NULL;
ALTER TABLE public.versions ALTER COLUMN nanoid SET DEFAULT public.generate_nanoid(18);
DO $$ BEGIN
  ALTER TABLE public.versions ADD CONSTRAINT versions_nanoid_unique UNIQUE (nanoid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- TASKS
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS nanoid text;
UPDATE public.tasks SET nanoid = public.generate_nanoid(18) WHERE nanoid IS NULL;
ALTER TABLE public.tasks ALTER COLUMN nanoid SET NOT NULL;
ALTER TABLE public.tasks ALTER COLUMN nanoid SET DEFAULT public.generate_nanoid(18);
DO $$ BEGIN
  ALTER TABLE public.tasks ADD CONSTRAINT tasks_nanoid_unique UNIQUE (nanoid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- LINKS
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS nanoid text;
UPDATE public.links SET nanoid = public.generate_nanoid(18) WHERE nanoid IS NULL;
ALTER TABLE public.links ALTER COLUMN nanoid SET NOT NULL;
ALTER TABLE public.links ALTER COLUMN nanoid SET DEFAULT public.generate_nanoid(18);
DO $$ BEGIN
  ALTER TABLE public.links ADD CONSTRAINT links_nanoid_unique UNIQUE (nanoid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- NOTES
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS nanoid text;
UPDATE public.notes SET nanoid = public.generate_nanoid(18) WHERE nanoid IS NULL;
ALTER TABLE public.notes ALTER COLUMN nanoid SET NOT NULL;
ALTER TABLE public.notes ALTER COLUMN nanoid SET DEFAULT public.generate_nanoid(18);
DO $$ BEGIN
  ALTER TABLE public.notes ADD CONSTRAINT notes_nanoid_unique UNIQUE (nanoid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- SECRETS
ALTER TABLE public.secrets ADD COLUMN IF NOT EXISTS nanoid text;
UPDATE public.secrets SET nanoid = public.generate_nanoid(18) WHERE nanoid IS NULL;
ALTER TABLE public.secrets ALTER COLUMN nanoid SET NOT NULL;
ALTER TABLE public.secrets ALTER COLUMN nanoid SET DEFAULT public.generate_nanoid(18);
DO $$ BEGIN
  ALTER TABLE public.secrets ADD CONSTRAINT secrets_nanoid_unique UNIQUE (nanoid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- USER_SETTINGS
ALTER TABLE public.user_settings ADD COLUMN IF NOT EXISTS nanoid text;
UPDATE public.user_settings SET nanoid = public.generate_nanoid(18) WHERE nanoid IS NULL;
ALTER TABLE public.user_settings ALTER COLUMN nanoid SET NOT NULL;
ALTER TABLE public.user_settings ALTER COLUMN nanoid SET DEFAULT public.generate_nanoid(18);
DO $$ BEGIN
  ALTER TABLE public.user_settings ADD CONSTRAINT user_settings_nanoid_unique UNIQUE (nanoid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- PROJECT_COLLABORATORS
ALTER TABLE public.project_collaborators ADD COLUMN IF NOT EXISTS nanoid text;
UPDATE public.project_collaborators SET nanoid = public.generate_nanoid(18) WHERE nanoid IS NULL;
ALTER TABLE public.project_collaborators ALTER COLUMN nanoid SET NOT NULL;
ALTER TABLE public.project_collaborators ALTER COLUMN nanoid SET DEFAULT public.generate_nanoid(18);
DO $$ BEGIN
  ALTER TABLE public.project_collaborators ADD CONSTRAINT project_collaborators_nanoid_unique UNIQUE (nanoid);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================================
-- Add Version fields for multi-step creation wizard
-- =============================================================================

-- PRD (Product Requirements Document) - stored as markdown
ALTER TABLE public.versions ADD COLUMN IF NOT EXISTS prd text;

-- Goals for this version - stored as JSON array text
ALTER TABLE public.versions ADD COLUMN IF NOT EXISTS goals text;

-- Deadline date for this version
ALTER TABLE public.versions ADD COLUMN IF NOT EXISTS deadline date;

-- =============================================================================
-- Indexes for nanoid lookups (heavily used in route resolution)
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_projects_nanoid ON public.projects (nanoid);
CREATE INDEX IF NOT EXISTS idx_versions_nanoid ON public.versions (nanoid);
CREATE INDEX IF NOT EXISTS idx_tasks_nanoid ON public.tasks (nanoid);
CREATE INDEX IF NOT EXISTS idx_links_nanoid ON public.links (nanoid);
CREATE INDEX IF NOT EXISTS idx_notes_nanoid ON public.notes (nanoid);
CREATE INDEX IF NOT EXISTS idx_secrets_nanoid ON public.secrets (nanoid);
CREATE INDEX IF NOT EXISTS idx_user_settings_nanoid ON public.user_settings (nanoid);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_nanoid ON public.project_collaborators (nanoid);
