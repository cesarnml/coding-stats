# Phase 3: AI Coding Story

**Delivery status:** Not started — product definition only; no `docs/02-delivery/phase-03/` implementation plan until tickets are approved.

## TL;DR

**Goal:** Surface AI vs. human coding activity on the main dashboard so the portfolio tells a transparent, differentiated story about how work gets done.

**Ships:**
- "AI vs Human Lines" stacked bar chart on `/`, scoped to the selected date range
- "AI Coding Activity" stat panel on `/` showing `ai_additions` total for the range
- Graceful empty state on both with a note that AI data accumulates daily from ship date

**Defers:**
- `/ai` detail route with per-file breakdown and `top_files` table (Tier 5)
- `ai/heuristics` endpoint integration — paywalled on current plan
- Extracting AI fields from the `durations` JSON blob into typed columns (Tier 3 — Data Model Health covers all blob columns)
- AI acceptance rate / follow-up rate metrics — sourced from `ai/heuristics`, not available on free plan

---

Phase 1 unblocked production. Phase 2 migrated to Tailwind v4. Phase 3 ships the feature that makes this dashboard worth showing to clients: proof that you track not just how long you coded, but how much was human vs. AI-assisted. The WakaTime `durations` endpoint already returns `ai_additions`, `human_additions`, `ai_input_tokens`, and related fields per duration segment — they are being scraped daily and stored in the `durations` blob, but never read or displayed.

## Phase Goal

This phase should leave the product in a state where:

- A visitor to the main dashboard sees an "AI vs Human Lines" stacked bar chart for any selected date range, rendered from data already in the `durations` table
- A stat panel shows total `ai_additions` for the selected range alongside the existing grand total and daily average panels
- Both components degrade to a consistent empty state (matching the empty state work from Tier 5 if done, or a simple inline message if not) with copy explaining that AI data accumulates forward from the date this feature shipped
- The daily durations cron continues to capture AI fields automatically — no additional scraper work required

## Committed Scope

### Supabase read route

- Extend or add a read route that aggregates `ai_additions`, `human_additions` per day from the `durations` blob for a given date range
- Must handle rows where AI fields are zero or absent (pre-ship scrapes)

### Dashboard chart

- New "AI vs Human Lines" stacked bar ECharts component on `/`
- Two series: AI additions (stacked) and human additions (stacked), one bar per day
- Scoped to `selectedRange` store like all other charts
- Paired `*Helpers.ts` file for the ECharts option object

### Dashboard stat panel

- New stat panel: total `ai_additions` for the selected range
- Positioned alongside the existing grand total / daily average / streak panels

### Empty state

- Both chart and stat panel show a consistent empty state when no AI data exists
- Empty state copy: "AI data accumulates daily — check back after [ship date]"

## Explicit Deferrals

- **`/ai` detail route** — per-file AI breakdown, `top_files` table, trend lines. Named as a Tier 5 candidate; not in this phase.
- **`ai/heuristics` endpoint** — returns `follow_up_events`, `files_with_follow_up_percent`, human follow-up rate. Paywalled on current WakaTime plan. Revisit if plan upgrades.
- **Historical backfill** — WakaTime durations are limited to last 7 days on the free plan. Rows older than 7 days at ship time cannot be backfilled. Forward-only.
- **AI fields as typed columns** — `durations.data` is a JSON blob. Extracting AI fields into dedicated columns is deferred to Tier 3 (Data Model Health), which plans a full blob→typed migration for all tables.
- **Token counts and prompt metrics** — `ai_input_tokens`, `ai_output_tokens`, `ai_prompt_events` are in the blob but not surfaced this phase. Too noisy for the client pitch; revisit for the `/ai` detail page.

## Exit Condition

The main dashboard at `/` shows an "AI vs Human Lines" stacked bar chart and an "AI Coding Activity" stat panel. Both are scoped to the active date range. A developer can open the dashboard, select "Last 7 Days", and see bars broken down by AI vs. human line additions for each day in the range. If no data exists for the range, both components show a short explanatory message rather than blank axes. The existing durations cron requires no changes — AI fields are already captured in the daily scrape.

## Retrospective

`skip` — UI addition to an existing pattern; no new architecture, no durable boundary changes, no likely follow-up learning that wouldn't be captured in the Tier 3 or Tier 5 phases.
