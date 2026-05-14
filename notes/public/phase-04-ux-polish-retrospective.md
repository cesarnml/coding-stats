# Phase 04 Retrospective — UX Polish and AI Chart Redesign

## Scope delivered

Five tickets, PRs #132–#136, stacked on `main` from the base of P3's merged work. Phase 04 was fully UX-facing: no schema migrations, no new Supabase tables, no new cron routes. The shipped scope:

- **P4.01** — Clamped the Activity chart's negative minute bars to zero and promoted the chart to the top slot above the stats panel. A 15-line fix to a visible regression from the ingestion model.
- **P4.02** — Built a reusable `EmptyState` component and applied it across eight charts that previously rendered broken axes or empty SVG when no data existed for the selected range.
- **P4.03** — Redesigned the AI section: replaced the single stacked-bar chart with a focused 5-stat row (AI additions, AI deletions, human additions, human deletions, total tokens) plus two dedicated panels (`AiLinesPieChart` and `AiTokenBarChart`). Sourced entirely from existing page data.
- **P4.04** — Added a `max_date` field to the summaries route response via a concurrent global `MAX(date)` query, and surfaced "Data through [date]" in the dashboard header. The signal is independent of the selected range filter.
- **P4.05** — Added a custom date range picker: a `WakaApiRange.Custom` entry, a `customDateRange` store, native `<input type="date">` elements in `DateRangeSelect`, and a `buildSummariesUrl` helper that routes to `?start=&end=` or `?range=` depending on the selected mode.

## What went well

**Stacked PRs stayed clean.** Each ticket branched from the previous one, and the separation of concerns was respected throughout — no ticket bled scope into an adjacent one. The diff per PR was small enough to review without context fatigue.

**The red-first discipline held throughout.** Every code ticket committed failing tests before the implementation. The test for `max_date` (P4.04) forced explicit specification of the null-table case before any code ran. The `buildSummariesUrl` tests (P4.05) pinned the URL-construction contract precisely, which caught an edge case (Custom range selected but only one date set) before it could surface as a runtime bug.

**`buildSummariesUrl` extracted the right seam.** The summaries fetch URL logic was inline in `+page.svelte` before P4.05. Extracting it to a helper made it testable in isolation and kept the component free of conditional URL assembly. The function is small (10 lines) but covers all the cases cleanly.

**No backend surface area expanded.** P4.03's AI stats are computed from existing `summaries.data` in the client, not a new route. P4.04's `max_date` reuses the same summaries endpoint with a second concurrent query. P4.05's custom range reuses the existing summaries route's `start`/`end` params. The entire phase added zero new Supabase tables, zero new cron jobs, and zero new API routes.

## Pain points

**Pre-existing flaky tests surfaced during P4.04.** The `BreakdownChart > no filter` test times out when run in the full suite but passes in isolation. The `page.spec.ts > Home > it...` test also flakes under load. Neither was introduced by Phase 04 work, but both appear as noise in CI output and require manual verification to confirm they are pre-existing.

**State.json in the primary checkout was stale.** The orchestrator's `state.json` at the primary checkout still showed P4.01 as `in_progress` after all five tickets were delivered. Delivery artifacts (handoffs, reviews) lived in individual worktrees and were not synced back. This is a repeat of the pattern noted in the Phase 03 retrospective — the control plane fragmentation problem is real and still unsolved.

## Key decisions and deferrals

**Custom range uses a parallel store, not a `{start,end}` migration for all ranges.** The clean version of date range handling would replace `selectedRange` (a string value) with a `{start, end}` materialised form for all ranges, including named ones like "Last 7 Days". That would require migrating the `profiles.range` column in Supabase and special-casing Today/Yesterday in the server-side date math. P4.05 deferred this and instead added a narrow `customDateRange` store that only activates when the user explicitly selects "Custom". All existing named range consumers — profile sync, `WakaToShortcutApiRange`, range label display — are completely untouched.

**The correct Tier 3 path for full `{start,end}` migration**: do not attempt this without the `profiles.range` schema migration. The column currently stores string values like `"Last 7 Days"`. A future phase would need to migrate it to store `{start, end}` pairs (or a separate `custom_start`/`custom_end` column pair), update `hooks.server.ts` to hydrate the store correctly on load, and update the server-side date math in `+server.ts` to accept materialised dates instead of the shortcut range map. That is a multi-ticket scope — not a quick add-on.

**`is_finalized` ingestion contract deferred.** The Activity chart clamp (P4.01) is a client-side guard against the upstream root cause. The correct fix is in the scraper: mark yesterday's rows as finalized after the day closes and skip re-writing them. Adding an `is_finalized boolean` column to `durations` was noted in Phase 03 and Phase 04 but remains deferred. It requires a schema migration and cron logic change — out of scope for a UX phase.

**Auth removal deferred.** Single-user use case makes the full Supabase OAuth flow overhead for what is effectively a read-mostly dashboard. Deferred to a future simplification pass.

## Surprises

**The `AiLinesPieChart` percentage math needed a last-remainder correction.** The initial implementation divided AI/human additions into percentage slices and rounded each independently. With small totals, the rounded slices summed to 99% or 101%. A last-remainder correction (assign the final slice `100 - sum_of_others`) was needed to guarantee the pie sums to exactly 100. This was a unit-level correctness issue that would have been invisible in visual testing but would have shown up as incorrect chart labels.

**The `max_date` signal is more robust than `data.at(-1)?.date`.** The initial design discussion considered deriving the data freshness date from the last element of the range query results. That approach silently returns `null` when the selected date range has no data — exactly when a staleness signal is most useful. The global `MAX(date)` query is independent of the range filter and correctly surfaces the freshness of the database regardless of what the user is viewing.

## What we'd do differently

**Sync delivery artifacts back to the primary checkout at each ticket boundary.** The Phase 03 follow-up item said this explicitly and it still did not happen in Phase 04. The pattern needs to become an automatic step in the `gated` boundary flow, not a manual reminder. Until it is, the primary `state.json` will always lag the actual worktree state.

**Fix the flaky tests before the next phase.** The `BreakdownChart` and `page.spec.ts` timeouts are pre-existing but they create noise in every phase. Fixing them (likely: increase timeout or make the tests async-safe) is cheap and high-value. They should be cleaned up at the start of Phase 05 rather than carried as known failures indefinitely.

## Net assessment

Phase 04 delivered all five tickets as scoped. The dashboard now has: negative bars clamped, empty states on all charts, a redesigned AI section, a data freshness signal, and a custom date range picker. No backend surface area was added. The main process gap — delivery artifact fragmentation — is documented and deferred to tooling work. The product gap — full `{start,end}` migration — is explicitly deferred with a documented rationale and a clear prerequisite (schema migration first).

## Follow-up

1. Fix `BreakdownChart > no filter` and `page.spec.ts > Home > it...` flaky tests before Phase 05.
2. Add automatic delivery artifact sync (`state.json`, `handoffs/`, `reviews/`) from worktrees back to the primary checkout on each ticket boundary.
3. Phase 05 candidate: `is_finalized` ingestion contract for `durations` (Tier 3, schema migration required).
4. Phase 05 candidate: `last_scraped_at` on `profiles` + stale-data warning in the UI (Tier 3).

_Created: 2026-05-04. PRs #132–#136 stacked on Phase 03 work._
