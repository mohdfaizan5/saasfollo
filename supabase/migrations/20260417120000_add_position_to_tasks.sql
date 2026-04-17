ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS position integer;

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY project_id, COALESCE(kanban_column_nanoid, status)
      ORDER BY created_at ASC, id ASC
    ) AS new_position
  FROM public.tasks
)
UPDATE public.tasks t
SET position = ranked.new_position
FROM ranked
WHERE t.id = ranked.id
  AND (t.position IS NULL OR t.position <> ranked.new_position);

ALTER TABLE public.tasks
  ALTER COLUMN position SET DEFAULT 1;

UPDATE public.tasks
SET position = 1
WHERE position IS NULL;

ALTER TABLE public.tasks
  ALTER COLUMN position SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_kanban_column_position
  ON public.tasks (kanban_column_nanoid, position);

CREATE INDEX IF NOT EXISTS idx_tasks_project_status_position
  ON public.tasks (project_id, status, position);
