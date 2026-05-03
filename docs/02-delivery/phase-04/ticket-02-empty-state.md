# P4.02 EmptyState component + apply to 8 charts

Size: 2 points

## Outcome

- `src/lib/components/EmptyState.svelte` exists and accepts a required `message` prop and optional `cta` prop
- Applied internally to: `PieChart` (Languages), `DailyGauge` (Discipline Gauge), `BreakdownChart` (Project Breakdown), `WeekdaysBarChart` (Weekly Breakdown), `StackedBarChart` ×2 (Coding Time by Project + by Category), `TimelineChart` ×2 (Context Switch by project + by language)
- Each modified chart renders the empty state when its data array is empty or null; renders the chart normally otherwise
- `AiActivityChart`'s bespoke empty state is left untouched — it is deleted in P4.03

## Red

- Write a render test for `EmptyState`: assert it renders the message string when `show={true}` and renders nothing (no DOM output) when `show={false}`
- Commit the failing test before creating the component

## Green

- Create `EmptyState.svelte` — minimal: conditional render of a `<div>` with message and optional CTA link/button
- In each of the 8 chart components, import `EmptyState` and wrap the chart render: `{#if hasData}<chart />{:else}<EmptyState message="No data for this range" cta="Try a wider date range" />{/if}`
- Define `hasData` as: data prop is non-null and `data.length > 0` (or equivalent for the chart's data shape)

## Refactor

- Extract the `hasData` check to a local `$derived` or `$:` reactive variable in each chart — keep the template readable
- Do not touch any chart helpers or ECharts option logic

## Review Focus

- `EmptyState` has no hardcoded strings — message and cta come from props
- All 8 charts have consistent empty check logic (no chart uses a different condition)
- No chart previously had an empty state — confirm none are accidentally broken by the `hasData` guard on charts that receive non-array data shapes (e.g. DailyGauge may receive a single object, not an array)
- `AiActivityChart` not modified in this ticket

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: [what test failed first]
Why this path: one component tested once is higher ROI than 8 identical per-chart tests; empty state logic is mechanical and uniform
Alternative considered: external wrapper pattern in `+page.svelte` — rejected; couples the page to each chart's internal data shape and bloats the layout file
Deferred: skeleton loaders, animated chart-to-empty transitions
