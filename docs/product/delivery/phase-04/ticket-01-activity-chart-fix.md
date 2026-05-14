# P4.01 Activity chart clamp + promote to top slot

Size: 1 point

## Outcome

- `createActiveHoursData()` in `src/lib/components/BarChart/barChartHelpers.ts` never returns a bar value below zero
- `ActivityChart` is the first full-width chart rendered in `src/routes/+page.svelte`

## Red

- Write a unit test for `createActiveHoursData()` with input that produces negative minute accumulation (overlapping or reversed duration segments)
- Assert that no value in the returned array is `< 0`
- Commit the failing test before touching the helper

## Green

- Clamp the accumulated value: `acc[hour] = Math.max(0, acc[hour] + deltaMinutes)`
- Move the `<ActivityChart>` block to the top of the chart section in `+page.svelte`, above all other charts

## Refactor

- No further changes — root cause of negative values is in the ingestion contract (deferred to Tier 3); chart-side clamp is the full scope of this ticket

## Review Focus

- Confirm the clamp is in `createActiveHoursData()` only — no other helpers modified
- Confirm `ActivityChart` position in `+page.svelte` is full-width and above `StatsPanel` / AI section / all other charts
- Confirm no layout regressions on the rest of the page

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: [what test failed first]
Why this path: chart-side clamp is the smallest acceptable fix; ingestion root cause is blocked on Tier 3 schema work
Alternative considered: fixing the cron scraper to not produce overlapping durations — deferred; touches GitHub Actions and ingestion contract
Deferred: `is_finalized` column + ingestion contract rewrite (Tier 3)
