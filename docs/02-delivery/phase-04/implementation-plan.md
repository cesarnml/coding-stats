# Phase 4 — UX Polish + AI Chart Redesign

> Make the dashboard client-presentable: fix broken charts, surface data freshness, redesign the AI section into two focused panels, and unlock arbitrary date range exploration.

## Epic

Tier 2 of `notes/public/revival-roadmap.md`. Product plan: `docs/01-product/phase-04-ux-polish.md`.

## Product contract

When this phase is complete:
- The Activity chart is the first thing a visitor sees and never renders a bar below zero
- Every chart in the app shows a meaningful empty state instead of blank axes, broken needles, or grey circles when no data exists for the selected range
- The AI section shows a 5-stat row (ai_additions, ai_deletions, human_additions, human_deletions, total tokens) plus two half-width panels: a lines pie chart and an adaptive token bar chart
- The dashboard displays "Data through [date]" reflecting the most recently ingested date regardless of selected range
- The owner can select an arbitrary start and end date and receive correct summaries data from Supabase for that window

## Grill-Me decisions locked

- **max_date source** → `SELECT MAX(date)` added to the summaries route handler response; global freshness, not range-scoped tail
- **Custom range store shape** → `'Custom'` added to `WakaApiRange`; parallel `customDateRange` store `{ start, end }`; profile sync skips custom; `WakaToShortcutApiRange` mapping untouched
- **AI chart files** → `AiActivityChart/` deleted; two new component directories: `AiLinesPieChart/` and `AiTokenBarChart/`, each with own helpers file
- **AI stat panels** → existing single AI stat replaced by 5-stat row: ai_additions, ai_deletions, human_additions, human_deletions, total tokens
- **EmptyState placement** → internal to each chart component; `EmptyState` tested once as a unit, not per-chart
- **Full {start,end} store migration deferred** → converting all named ranges to materialized dates requires `profiles.range` schema migration (Tier 3) and special-casing Today/Yesterday; deferred to the Tier 3 data-model phase

## Ticket Order

1. `P4.01 Activity chart clamp + promote to top slot`
2. `P4.02 EmptyState component + apply to 8 charts`
3. `P4.03 AI section redesign`
4. `P4.04 Data freshness signal`
5. `P4.05 Custom date range picker`
6. `P4.06 Doc update + retrospective`

## Ticket Files

- `ticket-01-activity-chart-fix.md`
- `ticket-02-empty-state.md`
- `ticket-03-ai-section-redesign.md`
- `ticket-04-data-freshness.md`
- `ticket-05-custom-date-range.md`
- `ticket-06-doc-update.md`

## Exit Condition

On the live Vercel deployment: (1) Activity chart is first and never renders below zero, (2) all charts show a meaningful empty state for ranges with no data, (3) AI section shows a 5-stat row and two half-width panels (lines pie + adaptive token bar) with correct hover behavior and empty states, (4) "Data through [date]" is visible and reflects global ingestion freshness, (5) owner can select arbitrary start/end dates and receive correct summaries.

## CI Baseline

> To be recorded at P4.01 start on `main`.

## Review Rules

- Tickets must be merged in order.
- P4.03 has a hard dependency on P4.02 (`EmptyState` component must exist before AI charts use it).
- P4.04 and P4.05 both touch `summaries/+server.ts`; merge P4.04 before starting P4.05 to avoid conflicts.
- Each ticket PR must pass CI before the next ticket starts.
- Pre-existing CI failures documented in **CI Baseline** above do not block a ticket; newly introduced failures do.

## Explicit Deferrals

- **Full `{start,end}` store migration** — converting named ranges to materialized dates requires `profiles.range` schema migration and Today/Yesterday special-casing; belongs in Tier 3 alongside the JSON blob migration
- **`is_finalized` column + ingestion contract rewrite** — root cause of negative Activity bars; Tier 3
- **`HOUR_GOAL` config + Discipline Gauge goal editing** — depends on auth direction
- **Auth removal** — separate phase
- **Per-day token trend beyond 7-day threshold** — future full-width drill-down chart
- **`last_scraped_at` column on profiles** — Tier 3

## Stop Conditions

- `summaries.grand_total` AI fields (`ai_additions`, `ai_input_tokens`, etc.) are absent or zero for all DB rows — verify against a live API response before assuming a chart bug.
- CI failure introduced by the `WakaApiRange` type addition that cannot be resolved within P4.05 scope.
- Date picker library choice produces a bundle size regression — pause and evaluate before merging.

## Phase Closeout

Retrospective: required
Why: phase introduces a durable custom-range exploration pattern; defers a significant store refactor whose rationale should be recorded for the Tier 3 phase; retro cadence being tuned in son-of-anton to default required.
Trigger: Developer approval of P4.06 PR merge.
Artifact: `notes/public/pp4-retrospective.md`
