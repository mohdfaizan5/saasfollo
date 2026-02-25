-- Add explicit ordering support for versions
ALTER TABLE public.versions
ADD COLUMN IF NOT EXISTS position integer;

WITH ranked_versions AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY project_id
      ORDER BY created_at ASC, id ASC
    ) - 1 AS new_position
  FROM public.versions
)
UPDATE public.versions v
SET position = r.new_position
FROM ranked_versions r
WHERE v.id = r.id
  AND (v.position IS NULL OR v.position <> r.new_position);

ALTER TABLE public.versions
ALTER COLUMN position SET DEFAULT 0;

UPDATE public.versions
SET position = 0
WHERE position IS NULL;

ALTER TABLE public.versions
ALTER COLUMN position SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_versions_project_id_position
ON public.versions (project_id, position);