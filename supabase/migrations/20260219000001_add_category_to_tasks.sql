-- Migration: Add category column to tasks table
-- Date: 2026-02-19
-- Description: Adds category column to tasks table to support task categorization

-- Add category column to tasks table
ALTER TABLE public.tasks 
ADD COLUMN category text;

-- Create index for category to improve query performance
CREATE INDEX idx_tasks_category ON public.tasks USING btree (category);

-- Add comment to explain the column
comment on column public.tasks.category is 'Category of the task (website, marketing, seo, content)';
