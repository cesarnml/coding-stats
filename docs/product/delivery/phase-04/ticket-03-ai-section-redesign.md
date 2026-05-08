# P4.03 AI section redesign

Size: 3 points

## Outcome

- `src/lib/components/AiActivityChart/` directory deleted
- `src/lib/components/AiLinesPieChart/AiLinesPieChart.svelte` + `AiLinesPieChartHelpers.ts` created:
  - 4 slices: `ai_additions`, `ai_deletions`, `human_additions`, `human_deletions`
  - Each slice is a percentage of total lines touched (all four sum to 100%)
  - Sourced from `summaries.grand_total`, aggregated across the selected range
  - Hover tooltip shows percentage, not absolute line counts
  - Uses `EmptyState` internally when all four values are zero or data is absent
- `src/lib/components/AiTokenBarChart/AiTokenBarChart.svelte` + `AiTokenBarChartHelpers.ts` created:
  - Two series: `ai_input_tokens`, `ai_output_tokens`
  - Adaptive: grouped bars per day when selected range ≤ 7 days; two-bar range total when > 7 days
  - Hover tooltip shows absolute token counts
  - Uses `EmptyState` internally when all token values are zero or data is absent
- Existing single AI stat panel replaced with a 5-stat row: `ai_additions`, `ai_deletions`, `human_additions`, `human_deletions`, total tokens (`ai_input_tokens + ai_output_tokens`)
- Dashboard layout: 5-stat row above a side-by-side row of `AiLinesPieChart` (left half) + `AiTokenBarChart` (right half)

## Red

- Unit test `AiLinesPieChartHelpers`: given a summaries array, assert slices sum to 100% and each slice value is correctly computed as a proportion
- Unit test `AiTokenBarChartHelpers`: assert adaptive logic — given ≤ 7 days of data returns per-day series; given > 7 days returns two-bar totals
- Render test `AiLinesPieChart`: empty state renders when all slice values are zero; chart renders when data is present
- Render test `AiTokenBarChart`: empty state renders when all token values are zero; chart renders when data is present
- Commit failing tests before creating any component or helper

## Green

- Create helpers first (pure functions, easiest to test in isolation)
- Create components wiring ECharts with `echarts.init(ref, 'dark', { renderer: 'svg' })` following the existing chart pattern
- Delete `AiActivityChart/` directory
- Update `+page.svelte`: remove `AiActivityChart` import, add the 5-stat row + two new chart components in a side-by-side layout
- Update the existing AI stat panel to the 5-stat row

## Refactor

- Ensure slice computation in `AiLinesPieChartHelpers` handles the zero-total edge case (all four fields are 0) — return empty signal rather than NaN percentages
- Ensure token bar adaptive threshold is computed from the summaries array length, not the range string — more robust to future range changes

## Review Focus

- Pie chart percentages: verify slices sum to exactly 100% (floating point — use `toFixed` or round consistently)
- Token bar adaptive threshold: confirm the cutoff is `summaries.data.length <= 7`, not a string comparison against the range label
- `AiActivityChart` import fully removed from `+page.svelte` and `index.ts` barrel (if one exists)
- 5-stat row: total tokens is `ai_input_tokens + ai_output_tokens` summed across the range, not a single day
- Half-width layout: confirm both charts are responsive and don't collapse awkwardly on narrow viewports

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: [what test failed first]
Why this path: new files rather than repurposing AiActivityChart — the existing component shares no logic (different chart type, different data shape, different helpers); renaming would leave a misleading history trail
Alternative considered: repurposing/renaming AiActivityChart — rejected; preserving git history on a component whose entire logic is replaced is not worth the confusion
Deferred: per-project or per-language AI breakdown (requires durations per-segment aggregation, Tier 5)
