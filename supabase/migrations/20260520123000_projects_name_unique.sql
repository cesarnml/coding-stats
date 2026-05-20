-- Deduplicate projects by name (keep latest row), merge project_summaries safely, enforce unique name.

CREATE TEMP TABLE project_loser_map ON COMMIT DROP AS
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
)
SELECT r.id AS loser_id, k.keeper_id
FROM ranked r
INNER JOIN keepers k ON k.name IS NOT DISTINCT FROM r.name
WHERE r.rn > 1;

-- Among loser summaries targeting the same keeper+date, keep only the newest.
WITH loser_summaries AS (
  SELECT
    ps.id,
    ROW_NUMBER() OVER (
      PARTITION BY l.keeper_id, ps.date
      ORDER BY ps.updated_at DESC NULLS LAST, ps.created_at DESC NULLS LAST, ps.id DESC
    ) AS rn
  FROM public.project_summaries ps
  INNER JOIN project_loser_map l ON ps.project_id = l.loser_id
)
DELETE FROM public.project_summaries ps
USING loser_summaries ls
WHERE ps.id = ls.id
  AND ls.rn > 1;

-- Keeper already has this date: drop the loser summary.
DELETE FROM public.project_summaries ps
USING project_loser_map l,
  public.project_summaries keeper_row
WHERE ps.project_id = l.loser_id
  AND keeper_row.project_id = l.keeper_id
  AND keeper_row.date = ps.date;

UPDATE public.project_summaries ps
SET project_id = l.keeper_id
FROM project_loser_map l
WHERE ps.project_id = l.loser_id;

WITH summary_ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY project_id, date
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM public.project_summaries
)
DELETE FROM public.project_summaries ps
USING summary_ranked sr
WHERE ps.id = sr.id
  AND sr.rn > 1;

WITH project_ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY name
      ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST, id DESC
    ) AS rn
  FROM public.projects
)
DELETE FROM public.projects p
USING project_ranked pr
WHERE p.id = pr.id
  AND pr.rn > 1;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_name_key UNIQUE (name);
