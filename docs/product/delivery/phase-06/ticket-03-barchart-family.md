# P6.03 BarChart family charts

Size: 3 points
Type: refactor
Scope: charts
Red: skip

## Outcome

- These 5 files use runes only: `BarChart/ActivityChart.svelte`, `BarChart/BreakdownChart.svelte`, `BarChart/StackedBarChart.svelte`, `BarChart/WeekdaysBarChart.svelte`, `BarChart/DailyTitleContent.svelte`.
- ECharts components apply the T01 recipe verbatim (`$derived option` + `$effect(setOption)`); `DailyTitleContent` (presentational) converts `export let`/`$:` per the triage rule.
- Each file carries `<svelte:options runes={true}>`.
- `grep` for legacy idioms in these files returns zero.

## Red

- `Red: skip` — behavior-preserving. Existing `BreakdownChart.spec.ts`, `DailyTitleContent.spec.ts`, `barChartHelpers.spec.ts` plus smoke e2e are the guard.

## Green

- Apply the documented T01 ECharts recipe to each chart; guard `$effect` against uninitialized chart refs.
- Convert `DailyTitleContent` mechanically.
- Add `<svelte:options runes={true}>` to each.

## Refactor

- No structural change; do not touch the per-chart option/dataset helper modules.

## Review Focus

- Recipe applied uniformly — each chart's `$effect` matches the T01 shape; no chart left with a residual `afterUpdate`.
- Charts with extra per-chart `$:` state (beyond `option`) convert to the correct `$derived` vs `$effect`.
- Smoke: each chart renders and redraws on date-range change.

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: n/a (`Red: skip`).
Why this path: mechanical application of the proven T01 recipe across the largest chart cluster.
Alternative considered: one ticket for all 12 remaining charts — rejected for diff reviewability (split into T03 BarChart family + T04 standalones).
Deferred: standalone charts (T04).
Contract note: —
