-- Deduplicate projects by name (keep latest row), repoint summaries, enforce unique name.

WITH ranked AS (
  SELECT
    id,
    name,
    ROW_NUMBER() OVER (
      PARTITION BY name
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM public.projects
),
keepers AS (
  SELECT id AS keeper_id, name
  FROM ranked
  WHERE rn = 1
),
losers AS (
  SELECT r.id AS loser_id, k.keeper_id
  FROM ranked r
  INNER JOIN keepers k ON k.name IS NOT DISTINCT FROM r.name
  WHERE r.rn > 1
)
UPDATE public.project_summaries ps
SET project_id = l.keeper_id
FROM losers l
WHERE ps.project_id = l.loser_id;

DELETE FROM public.projects p
USING ranked r
WHERE p.id = r.id
  AND r.rn > 1;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_name_key UNIQUE (name);
