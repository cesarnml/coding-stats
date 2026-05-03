# Phase 04: UX Polish + AI Chart Redesign

**Delivery status:** Not started — product definition only; no `docs/02-delivery/phase-04/` implementation plan until tickets are approved.

## TL;DR

**Goal:** Make the dashboard client-presentable — fix broken charts, surface a data freshness signal, redesign the AI section into two focused panels, and unlock arbitrary date range exploration.

**Ships:**
- Activity chart promoted to top position; AI section replaced by two half-width charts (lines pie + token bar)
- Consistent empty state component used across all charts
- Activity chart bars clamped to `>= 0` (defensive chart-side fix)
- "Data through [date]" timestamp on the dashboard via `MAX(date)` from summaries
- Custom date range picker backed by Supabase summaries

**Defers:**
- `is_finalized` column + ingestion contract rewrite → Tier 3 data-model phase
- `HOUR_GOAL` configurability + Discipline Gauge goal editing → post-auth-decision
- Auth removal → separate phase
- Per-day token trend beyond the 7-day adaptive threshold → future drill-down chart

---

Phases 01–03 unblocked production, modernized the CSS pipeline, and added AI coding activity to the dashboard. The site is publicly viewable with no login required — the target audience is the owner plus clients reviewing effort data. The remaining friction is visual: broken empty states across most charts, a negative-bar bug in Activity, an oversized AI chart that wastes space, and no way to explore an arbitrary date range for a specific client engagement.

## Phase Goal

This phase should leave the product in a state where:

- Every chart renders a meaningful message ("No data for this range") instead of blank axes, broken needles, or a grey circle when there is no data for the selected range
- The Activity chart is the first thing a visitor sees and never shows bars below zero
- The AI section shows two focused half-width panels: a lines pie chart (ai vs human additions/deletions as share of total lines touched) and an adaptive token bar chart (per-day when ≤ 7 days, range total when > 7 days)
- The dashboard shows "Data through [date]" so clients know how current the data is
- A date range picker lets the owner select arbitrary start/end dates, backed by Supabase summaries, enabling "show me exactly what I built during your project"

## Committed Scope

### Dashboard layout

- Move Activity chart to the top slot (full-width)
- Replace the current full-width AI vs Human Additions stacked bar with two half-width charts in a side-by-side row

### AI lines pie chart (left half)

- 4 slices: `ai_additions`, `ai_deletions`, `human_additions`, `human_deletions`
- Values sourced from `summaries.grand_total`, aggregated across the selected range
- Represents each slice as a percentage of total lines touched (all four sum to 100%)
- Hover tooltip shows percentage, not absolute line counts

### AI token bar chart (right half)

- Two series: `ai_input_tokens` and `ai_output_tokens`, sourced from `summaries.grand_total`
- **Adaptive:** grouped bars per day when selected range is ≤ 7 days; two-bar range total when > 7 days
- Hover tooltip shows absolute token counts

### Empty states

- Standardize a single empty state component: short message ("No data for this range") with an optional CTA ("Try a wider date range")
- Apply consistently to: Languages pie, Discipline Gauge, Project Breakdown, Weekly Breakdown, Coding Time by Project, Coding Time by Category, Context Switch, and any new charts in this phase

### Activity chart bug fix

- Clamp all bar values to `>= 0` in the chart helper — chart-side defensive fix only
- Root cause (ingestion contract) deferred to Tier 3

### Data freshness signal

- Display "Data through [date]" on the dashboard
- Source: `MAX(date)` queried from the `summaries` table at page load
- No schema changes required

### Custom date range picker

- Replace or extend the current `DateRangeSelect` fixed-range dropdown with a date range picker supporting arbitrary `start` / `end` dates
- Backed by Supabase summaries (not the live WakaTime proxy) — enables historical client-engagement queries
- `WakaApiRange` gains a `Custom` entry; internal API calls pass `start` + `end` params when custom range is active

## Explicit Deferrals

- **`is_finalized` column + ingestion contract rewrite** — root cause of negative bars. Touches GitHub Actions cron and Supabase schema; belongs in the Tier 3 data-model phase alongside the JSON blob migration.
- **`HOUR_GOAL` config + Discipline Gauge goal editable** — depends on auth direction. Deferred until auth removal or restructure is decided.
- **Auth removal** — the site is already public by default; auth refactor is a separate phase when the owner is ready to commit to the single-user model fully.
- **Per-day token trend beyond 7-day threshold** — useful for trend analysis but belongs in a dedicated full-width drill-down chart, not a half-width summary panel.
- **`last_scraped_at` column on profiles** — correct monitoring signal for scraper liveness; deferred to Tier 3 alongside data-model work.

## Exit Condition

The phase is done when, on the live Vercel deployment: (1) the Activity chart is the first chart visible and never renders a bar below zero, (2) the AI section shows two half-width panels — a lines pie and an adaptive token bar — with correct hover behavior, (3) every chart in the app shows a meaningful empty state instead of broken or blank UI when there is no data for the selected range, (4) the dashboard shows a "Data through [date]" line, and (5) the owner can select an arbitrary start and end date and receive correct summaries data from Supabase for that window.

## Retrospective

`skip` — phase is UI polish and one feature addition; no operator workflow changes, no durable architectural boundaries introduced.
