# P6.04 Standalone charts

Size: 3 points
Type: refactor
Scope: charts
Red: skip

## Outcome

- These 8 files use runes only: `LineChart/LineChart.svelte`, `PieChart/PieChart.svelte`, `ScatterPlot/ScatterPlot.svelte`, `Treemap/Treemap.svelte`, `TimelineChart/TimelineChart.svelte`, `GaugeChart/DailyGauge.svelte`, `AiTokenBarChart/AiTokenBarChart.svelte`, `AiLinesPieChart/AiLinesPieChart.svelte`.
- All apply the T01 ECharts recipe (`$derived option` + `$effect(setOption)`).
- Each file carries `<svelte:options runes={true}>`.
- `grep` for legacy idioms in these files returns zero.

## Red

- `Red: skip` — behavior-preserving. Existing `PieChart.spec.ts`, `AiTokenBarChart.spec.ts`, `AiLinesPieChart.spec.ts`, the `*Helpers.spec.ts` suites, plus smoke e2e are the guard.

## Green

- Apply the T01 recipe to each chart; guard `$effect` against uninitialized chart refs.
- Add `<svelte:options runes={true}>` to each.

## Refactor

- No structural change; do not touch the chart helper modules.

## Review Focus

- Recipe applied uniformly across all 8; no residual `afterUpdate`.
- `DailyGauge` and `Treemap` may have chart-type-specific reactive state beyond `option` — confirm `$derived`/`$effect` split is correct.
- Smoke: each chart renders and redraws on date-range change.

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: n/a (`Red: skip`).
Why this path: mechanical application of the proven T01 recipe across the remaining standalone charts.
Alternative considered: per-chart tickets — rejected as ceremony for a solo operator on mechanical work.
Deferred: chart control components (T05).
Contract note: —
