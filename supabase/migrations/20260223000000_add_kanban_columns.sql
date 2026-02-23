-- Migration: Add custom kanban columns for build board
-- Purpose: Replace fixed now/next/later lanes with project-defined columns

CREATE TABLE IF NOT EXISTS public.kanban_columns (
  id bigint generated always as identity primary key,
  nanoid text not null default public.generate_nanoid(18) unique,
  project_id bigint not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 0,
  is_done_column boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

COMMENT ON TABLE public.kanban_columns IS 'Project-specific custom columns for build kanban board.';

CREATE INDEX IF NOT EXISTS idx_kanban_columns_project_id_position
  ON public.kanban_columns (project_id, position);

ALTER TABLE public.kanban_columns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view kanban columns of their own projects"
  ON public.kanban_columns
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can insert kanban columns to their own projects"
  ON public.kanban_columns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can update kanban columns of their own projects"
  ON public.kanban_columns
  FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Users can delete kanban columns of their own projects"
  ON public.kanban_columns
  FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM public.projects WHERE user_id = (SELECT auth.uid())
    )
  );

ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS kanban_column_nanoid text references public.kanban_columns(nanoid) on delete set null;

CREATE INDEX IF NOT EXISTS idx_tasks_kanban_column_nanoid
  ON public.tasks (kanban_column_nanoid);

DO $$
DECLARE
  project_row RECORD;
  col_backlog text;
  col_in_progress text;
  col_review text;
  col_done text;
BEGIN
  FOR project_row IN SELECT id FROM public.projects LOOP
    INSERT INTO public.kanban_columns (project_id, title, description, position, is_done_column)
    VALUES
      (project_row.id, 'Backlog', 'Ideas and upcoming work', 0, false),
      (project_row.id, 'In Progress', 'Work currently moving', 1, false),
      (project_row.id, 'Review', 'QA or final checks', 2, false),
      (project_row.id, 'Done', 'Completed tasks', 3, true)
    ON CONFLICT DO NOTHING;

    SELECT nanoid INTO col_backlog
    FROM public.kanban_columns
    WHERE project_id = project_row.id AND position = 0
    ORDER BY id ASC
    LIMIT 1;

    SELECT nanoid INTO col_in_progress
    FROM public.kanban_columns
    WHERE project_id = project_row.id AND position = 1
    ORDER BY id ASC
    LIMIT 1;

    SELECT nanoid INTO col_review
    FROM public.kanban_columns
    WHERE project_id = project_row.id AND position = 2
    ORDER BY id ASC
    LIMIT 1;

    SELECT nanoid INTO col_done
    FROM public.kanban_columns
    WHERE project_id = project_row.id AND position = 3
    ORDER BY id ASC
    LIMIT 1;

    UPDATE public.tasks
    SET kanban_column_nanoid = CASE
      WHEN status = 'now' THEN col_backlog
      WHEN status = 'next' THEN col_in_progress
      WHEN status = 'later' THEN col_review
      WHEN status = 'done' THEN col_done
      ELSE col_backlog
    END
    WHERE project_id = project_row.id AND kanban_column_nanoid IS NULL;
  END LOOP;
END
$$;
