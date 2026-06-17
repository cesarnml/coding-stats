# Phase 06 — Svelte 5 Runes Migration

**Delivery status:** Delivered. All 8 tickets done (PRs #170–#177). Awaiting developer closeout.

> Convert all 51 `.svelte` files from Svelte 4 legacy syntax to Svelte 5 runes, then flip the compiler to `runes: true` so legacy syntax becomes a build error. Behavior-preserving, mechanical-only.

## Epic

Enabling-debt phase. Product plan: `docs/product/plans/phase-06-svelte5-runes-migration.md`.

## Product contract

When this phase is complete:

- `grep` for legacy idioms (`export let`, `$:`, `createEventDispatcher`, `on:` component events, `<slot>`, `beforeUpdate`/`afterUpdate`) returns **zero** hits across `src`.
- `svelte.config.js` compiles with `runes: true` globally; reintroduced legacy syntax fails the build.
- All 45 existing test files pass, `svelte-check` is clean, and the single Playwright smoke test (`tests/smoke-test.test.ts`) is green.
- The app behaves identically to pre-migration, verified by documented manual-smoke notes over high-risk interactive surfaces.

## Grill-Me decisions locked

- **Landing strategy** — per-file `<svelte:options runes={true}>` as a transient bridge so each ticket is independently mergeable and `main` stays green in mixed mode; the final ticket flips the global flag and strips every directive in one mechanical commit.
- **Sequencing** — recipe-first (T01 proves the ECharts pattern on one chart), then bottom-up by cluster.
- **Stores stay** — the 2 `writable` stores (`dropdown.ts`, `loading.ts`) are NOT converted. `$store` auto-subscription (`$dropdown`/`$loading`/`$navigating`) keeps working in runes mode and stays as-is; each store-consuming ticket states this is intentional.
- **Mechanical-only** — behavior-preserving translation, zero drive-bys. Real bugs found mid-migration are logged as deferred findings, not fixed in-phase.
- **`$:` triage rule** — pure value → `$derived`; side-effecting (DOM, ECharts `setOption`, external) → `$effect`. Ambiguous cases get a one-line Rationale note.
- **`bind:` rule** — current read: all `bind:value`/`bind:group`/`bind:this` target native DOM elements, so no `$bindable` expected. If any `bind:` turns out to target a custom-component prop at conversion time, that child gets `$bindable()`, documented per-occurrence.
- **Slot ripple** — named-slot → named-snippet consumer call-site updates land in the **same ticket as the wrapper** they belong to (ripple owned by the wrapper ticket).
- **All tickets `Red: skip`** — behavior-preserving refactor with no net-new behavior; the guard is existing tests + smoke staying green, not a new failing test. No net-new characterization tests.

## ECharts recipe (established in T01, applied in T03/T04)

Legacy pattern (repeated across 13 chart files):

```text
$: option = createOption(...)
afterUpdate(() => chart.setOption(option))
```

Runes pattern:

```text
const option = $derived(createOption(...))
$effect(() => { chart?.setOption(option) })
```

Semantic note: `afterUpdate` fires after _any_ component update; `$effect` fires only when `option`'s dependencies change. This is the intended behavior (redraw on data change) and is the single highest-risk conversion in the phase — T01 validates it with manual smoke before the batch tickets apply it.

## Ticket Order

1. `P6.01 ECharts recipe proof (VerticalBarChart)`
2. `P6.02 Shared presentational primitives + slot→snippet`
3. `P6.03 BarChart family charts`
4. `P6.04 Standalone charts`
5. `P6.05 Events→callback props + dynamic component`
6. `P6.06 Navbar cluster`
7. `P6.07 Routes + remaining leaves`
8. `P6.08 Global runes:true flip + directive cleanup + retrospective`

## Ticket Files

- `ticket-01-echarts-recipe-proof.md`
- `ticket-02-shared-primitives-snippets.md`
- `ticket-03-barchart-family.md`
- `ticket-04-standalone-charts.md`
- `ticket-05-events-and-dynamic-component.md`
- `ticket-06-navbar-cluster.md`
- `ticket-07-routes-and-remaining-leaves.md`
- `ticket-08-global-flip-and-retro.md`

## Exit Condition

1. Repo-wide grep for all six legacy idioms returns zero hits across `src`.
2. `svelte.config.js` has `compilerOptions: { runes: true }`; no `<svelte:options runes={true}>` directives remain.
3. `bun run format`, `bun run verify` (`svelte-check` + vitest), and the Playwright smoke test all pass.
4. Manual-smoke notes recorded for high-risk surfaces (chart redraw, `DateRangeSelect`, controls, `DarkModeToggle` dynamic render, Navbar dropdown).
5. Retrospective written to `notes/public/phase-06-svelte5-runes-migration-retrospective.md`.

## CI Baseline

> To be recorded at P6.01 start on `main`.

## Review Rules

- Tickets merge in order. Each ticket adds `<svelte:options runes={true}>` to the files it converts; mixed mode keeps `main` green between tickets.
- Only T08 touches `svelte.config.js` and removes the per-file directives.
- Each ticket PR passes `format` + `verify` + smoke e2e before the next ticket starts.
- Reviewer verifies the recipe was applied uniformly within a cluster and that no drive-by changes crept in (diffs should read as "same component, new syntax").

## Explicit Deferrals

- `writable` store → `$state` `.svelte.ts` conversion.
- Component extraction, prop/API renames, styling changes, `any`/type cleanup.
- Net-new characterization tests for high-risk surfaces.
- SvelteKit `$app/stores` → `$app/state` migration (`$navigating`/`$page`) — separate axis, auto-subscription works in runes mode.

## Stop Conditions

- A chart's `afterUpdate`→`$effect` conversion changes redraw behavior in a way manual smoke catches and the recipe can't cleanly resolve — stop, log a finding, escalate before forcing it.
- A `bind:` turns out to target a custom-component prop requiring non-trivial `$bindable` redesign beyond mechanical translation — log and confirm scope before proceeding.
- `runes: true` global flip surfaces a file that can't compile in rune mode (e.g. a missed legacy idiom or third-party `.svelte` dep) — fix the file, do not soften the flag.

## Phase Closeout

Retrospective: `required` (per product plan — `runes: true` is a durable architectural boundary changing every future component PR's assumptions; captures reusable migration patterns/gotchas). Written in P6.08.

## File-to-ticket map (51 files)

- **T01 (1):** `BarChart/VerticalBarChart.svelte`
- **T02 (9):** `Container.svelte`, `ChartTitle.svelte`, `common/ChartContainer.svelte`, `common/BigChartContainer.svelte`, `Stats/StatPanelItem.svelte`, `PageTransition.svelte`, `assets/svg/{Moon,Sun,System}.svelte`
- **T03 (5):** `BarChart/ActivityChart.svelte`, `BarChart/BreakdownChart.svelte`, `BarChart/StackedBarChart.svelte`, `BarChart/WeekdaysBarChart.svelte`, `BarChart/DailyTitleContent.svelte`
- **T04 (8):** `LineChart/LineChart.svelte`, `PieChart/PieChart.svelte`, `ScatterPlot/ScatterPlot.svelte`, `Treemap/Treemap.svelte`, `TimelineChart/TimelineChart.svelte`, `GaugeChart/DailyGauge.svelte`, `AiTokenBarChart/AiTokenBarChart.svelte`, `AiLinesPieChart/AiLinesPieChart.svelte`
- **T05 (4):** `DateRangeSelect.svelte`, `BarChart/DailyChartControls.svelte`, `GaugeChart/DailyGaugeControls.svelte`, `DarkModeToggle.svelte`
- **T06 (7):** `Navbar/{Navbar,NavDropdown,NavEnd,NavLink,NavLinks,NavLogo,NavMenu}.svelte`
- **T07 (17):** `routes/+error.svelte`, `routes/+layout.svelte`, `routes/+page.svelte`, `routes/AiStatPanel.svelte`, `routes/account/+page.svelte`, `routes/iterations/+page.svelte`, `routes/iterations/[iterationId]/+page.svelte`, `routes/login-redirect/+page.svelte`, `routes/login/+page.svelte`, `routes/projects/+page.svelte`, `routes/projects/[projectName]/+page.svelte`, `Footer.svelte`, `ProjectList.svelte`, `EmptyState.svelte`, `Stats/StatsPanel.svelte`, `common/NinjaSpinner.svelte`, `common/SearchInput.svelte`
- **T08 (0 conversions):** `svelte.config.js` + strip all `<svelte:options runes={true}>` directives + retrospective
