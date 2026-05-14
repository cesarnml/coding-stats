# P3.02 AI activity chart and stat panel

Size: 2 points

## Outcome

- `src/lib/components/AiActivityChart/AiActivityChart.svelte` renders a stacked bar ECharts chart with two series (AI additions, human additions) scoped to `selectedRange`
- `src/lib/components/AiActivityChart/AiActivityChartHelpers.ts` exports `buildAiActivityOption(data)` — pure function, data → ECharts option object
- `src/lib/components/AiActivityChart/AiActivityChartHelpers.spec.ts` passes — covers data→series mapping, empty array, and zero-value days
- `src/lib/components/AiActivityChart/AiActivityChart.spec.ts` passes — covers empty state message and populated chart container
- A stat panel on `+page.svelte` displays total `ai_additions` for the selected range; shows a zero/empty state when total is 0
- Both components react to `selectedRange` store changes without a page reload
- No new API calls added to the page server load — data sourced from `summaries.data[N].grand_total` already in page data
- `pnpm test:unit` and `pnpm check` pass

## Red

Write failing tests before any implementation:

**`AiActivityChartHelpers.spec.ts`:**
```ts
import { buildAiActivityOption } from './AiActivityChartHelpers'

it('maps daily summaries to stacked AI and human series', () => {
  const result = buildAiActivityOption([
    { date: '2026-05-01', ai_additions: 100, human_additions: 40 },
    { date: '2026-05-02', ai_additions: 200, human_additions: 80 },
  ])
  expect(result.series[0].data).toEqual([100, 200]) // AI series
  expect(result.series[1].data).toEqual([40, 80])   // Human series
  expect(result.xAxis.data).toEqual(['2026-05-01', '2026-05-02'])
})

it('returns empty state option when data array is empty', () => {
  const result = buildAiActivityOption([])
  expect(result.graphic).toBeDefined()
})

it('handles zero-value days without crashing', () => {
  const result = buildAiActivityOption([
    { date: '2026-05-01', ai_additions: 0, human_additions: 0 },
  ])
  expect(result.series[0].data).toEqual([0])
})
```

**`AiActivityChart.spec.ts`:**
```ts
it('shows empty state message when data is empty', () => {
  render(AiActivityChart, { props: { data: [] } })
  expect(screen.getByText(/AI data accumulates daily/i)).toBeInTheDocument()
})

it('renders chart container when data is present', () => {
  render(AiActivityChart, { props: { data: mockAiData } })
  expect(screen.getByTestId('ai-activity-chart')).toBeInTheDocument()
})
```

Commit the failing tests. Then make them pass.

## Green

**`AiActivityChartHelpers.ts`:**
- Accept `{ date: string; ai_additions: number; human_additions: number }[]`
- Return an ECharts option with:
  - `xAxis.data` = dates
  - Two `bar` series: AI additions (stack: 'ai-human'), human additions (stack: 'ai-human')
  - `stack: 'ai-human'` on both series makes them stacked
  - Guard: if `data.length === 0`, return an option with a `graphic` text overlay ("No AI data for this range")
- Follow the same dark theme + SVG renderer pattern as existing chart helpers

**`AiActivityChart.svelte`:**
- Props: `data: { date: string; ai_additions: number; human_additions: number }[]`
- `echarts.init(ref, 'dark', { renderer: 'svg' })` in `onMount`
- `chart.setOption(option)` in `afterUpdate`
- `data-testid="ai-activity-chart"` on the container div
- If `data.length === 0`, render empty state copy instead of initializing ECharts (avoids blank SVG)

**Stat panel on `+page.svelte`:**
- Compute `aiTotal = summaries.data.reduce((sum, d) => sum + (d.grand_total.ai_additions ?? 0), 0)`
- Display alongside existing grand total / daily average panels
- Zero state: show `—` when `aiTotal === 0` with subtext "AI data accumulates daily"

**Wire up:**
- In `+page.server.ts` or `+page.svelte`: derive `aiData` from existing `summaries.data` — map each day to `{ date, ai_additions: grand_total.ai_additions, human_additions: grand_total.human_additions }`
- Pass `aiData` as prop to `AiActivityChart`
- No new `fetch` calls

## Refactor

- Extract the `aiData` derivation into a small helper in `AiActivityChartHelpers.ts` if it reads more clearly — `extractAiSeriesData(summaries: SummariesResult)`
- Ensure the empty state copy is consistent with whatever empty state pattern Tier 5 settles on — if there's already a shared `EmptyState` component, use it; otherwise a simple `<p>` is fine for now

## Review Focus

- `selectedRange` change triggers chart re-render — verify by switching ranges in the browser
- Empty state renders when switching to a range with no data (e.g. a far future range) — not blank axes
- Stat panel zero state copy is visible on ranges with no AI activity
- No new fetch calls in the network tab on page load
- `pnpm test:unit` green — all four new test cases pass
- ECharts instance is destroyed on component unmount (memory leak check) — follow existing chart pattern for `onDestroy`

## Rationale

Red first: wrote all four test cases (two helpers, two component), confirmed failures before implementation.
AI stat panel placed directly in `+page.svelte` using `StatPanelItem` rather than modifying `StatsPanel` — `StatsPanel` owns summaries-derived stats, AI total is a separate concern; avoided coupling to keep `StatsPanel` testable in isolation.
Zero state on the stat panel uses `—` with subtext per ticket spec; zero state on the chart is an ECharts `graphic` text overlay returned from `buildAiActivityOption` when `data.length === 0`.
`extractAiSeriesData` helper added to `AiActivityChartHelpers.ts` per Refactor section suggestion; tested separately.
Why this path: sourcing from existing `summaries` page data avoids a new DB query and a new read route; the data is already on the page, just unread.
Alternative considered: new `/api/supabase/ai-durations` read route with per-segment aggregation from `durations` blob — rejected because `summaries.grand_total` already has the aggregated totals and durations only supports single-date queries.
Deferred: per-project AI breakdown (needs durations per-segment), time-of-day chart, token/prompt metrics — all Tier 5 `/ai` route work.
