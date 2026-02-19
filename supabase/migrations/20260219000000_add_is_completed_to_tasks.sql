-- =============================================================================
-- Migration: Add is_completed column to tasks table
-- Purpose: Adds optional is_completed boolean field to track individual task completion
-- Affected Tables: tasks
-- =============================================================================

-- Add is_completed column with default false
ALTER TABLE public.tasks 
ADD COLUMN is_completed boolean DEFAULT false NOT NULL;

-- Create index for is_completed to improve query performance
CREATE INDEX idx_tasks_is_completed ON public.tasks USING btree (is_completed);

-- Create composite index for project_id and is_completed
CREATE INDEX idx_tasks_project_is_completed ON public.tasks USING btree (project_id, is_completed);
