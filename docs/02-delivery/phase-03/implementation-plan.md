# Phase 3 — AI Coding Story

> Surface AI vs. human coding activity on the main dashboard using data already scraped daily into the `durations` table.

## Epic

Tier 2 of `notes/public/revival-roadmap.md`. Product plan: `docs/01-product/phase-03-ai-coding-story.md`.

## Product contract

When this phase is complete:
- The main dashboard at `/` shows an "AI vs Human Lines" stacked bar chart scoped to the selected date range
- A stat panel displays total `ai_additions` for the selected range alongside existing panels
- Both components show a graceful empty state when no AI data exists for the range
- No new cron routes, tables, or migrations are required — AI fields are already in the `durations` blob

## Grill-Me decisions locked

- **Data source** → `summaries.grand_total` per day, not `durations` — summaries already returns pre-aggregated AI totals per day; durations only supports single-date queries and would require manual aggregation
- **No new read route** → AI fields are already in `summaries` page data fetched on load; the chart consumes `summaries.data[N].grand_total` directly, no new API call
- **Type both `WakaDuration` and `grand_total`** → all AI fields added, not just the ones P3.02 needs; eliminates latent `unknown` in durations blob reads for Tier 5 work
- **Test strategy** → `pnpm check` for P3.01; helpers unit tests (pure function, highest ROI) + component render tests for empty/populated states in P3.02
- **Forward-only** → no backfill possible on free WakaTime plan; empty state copy explains accumulation from ship date
- **`ai/heuristics` endpoint** → paywalled, deferred; see roadmap for premium backfill plan

## Ticket Order

1. `P3.01 Add AI fields to WakaTime types`
2. `P3.02 AI activity chart and stat panel`

## Ticket Files

- `ticket-01-ai-types.md`
- `ticket-02-ai-chart.md`

## Exit Condition

The main dashboard shows an "AI vs Human Lines" stacked bar chart and an "AI Coding Activity" stat panel. Both are scoped to the active date range via the `selectedRange` store. Selecting "Last 7 Days" renders bars broken down by AI vs. human line additions per day. When no AI data exists for the range, both components display a short explanatory message rather than blank axes or zero bars. No new API calls were added to the page load. `pnpm test:unit` and `pnpm check` pass.

## CI Baseline

> Baseline to be recorded at the start of P3.01 — run `pnpm check && pnpm test:unit && pnpm lint` on `main` and record pass/fail here before first commit.

## Review Rules

- Tickets must be merged in order — P3.02 depends on the types from P3.01.
- Each ticket PR must pass CI before the next ticket starts.
- Pre-existing CI failures documented in **CI Baseline** above do not block a ticket; newly introduced failures do.

## Explicit Deferrals

- **`/ai` detail route** — per-file AI breakdown, `top_files` table, time-of-day resolution. Tier 5 candidate.
- **`ai/heuristics` endpoint** — paywalled on current plan. Premium backfill strategy documented in revival roadmap.
- **AI fields as typed columns** — `durations.data` remains a JSON blob. Full blob→typed migration is Tier 3.
- **Token / prompt metrics** — `ai_input_tokens`, `ai_output_tokens`, `ai_prompt_events` are typed in P3.01 but not surfaced in the UI this phase.
- **Per-project or per-language AI breakdown** — not available from `summaries`; requires `durations` per-segment aggregation. Tier 5.

## Stop Conditions

- `summaries.grand_total` AI fields are absent or zero for all rows in the DB — indicates the fields weren't present when those rows were scraped. Pause and verify against a live API response before assuming a chart bug.
- CI failure introduced by the type additions that cannot be resolved within P3.01 scope.

## Phase Closeout

Retrospective: `skip` — UI addition to an existing pattern; no new architecture, no durable boundary changes.
