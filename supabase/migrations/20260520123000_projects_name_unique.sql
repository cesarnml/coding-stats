-- Deduplicate projects by name (keep latest row), merge project_summaries safely, enforce unique name.

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
-- Keeper already has this date: drop the loser summary instead of repointing (avoids unique_project_id_date violation).
DELETE FROM public.project_summaries ps
USING losers l
INNER JOIN public.project_summaries keeper_row
  ON keeper_row.project_id = l.keeper_id
  AND keeper_row.date = ps.date
WHERE ps.project_id = l.loser_id;

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

WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY project_id, date
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM public.project_summaries
)
DELETE FROM public.project_summaries ps
USING ranked r
WHERE ps.id = r.id
  AND r.rn > 1;

DELETE FROM public.projects p
USING (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY name
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM public.projects
) ranked
WHERE p.id = ranked.id
  AND ranked.rn > 1;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_name_key UNIQUE (name);
