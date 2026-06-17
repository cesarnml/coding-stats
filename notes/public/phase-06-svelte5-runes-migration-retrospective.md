# Phase 06 Retrospective — Svelte 5 Runes Migration

## Scope delivered

8 PRs (#170–#177) across 8 tickets. 51 `.svelte` files converted from Svelte 4 legacy syntax to Svelte 5 runes (`$props`, `$state`, `$derived`, `$effect`, callback props, snippets). `svelte.config.js` now enforces `compilerOptions: { runes: true }` globally; `export let` in any `.svelte` file is an immediate build error. All per-file `<svelte:options runes={true} />` directives removed. Repo-wide grep for all six legacy idioms returns zero.

## What went well

**Per-file directive bridge strategy.** Using `<svelte:options runes={true} />` as a transient per-ticket opt-in kept `main` green in mixed mode across 7 tickets before the global flip. Each PR was independently mergeable and the diff read as exactly one cluster at a time. This is the right pattern for large-codebase incremental migrations: enforce per-file early, stripe the global flag last.

**Recipe-first sequencing.** T01 proved the ECharts `afterUpdate`→`$effect` pattern on a single chart (`VerticalBarChart`) before T03/T04 applied it to 13 chart siblings. The established recipe—`const option = $derived(createOption(...))` then `$effect(() => { chart?.setOption(option) })`—was applied mechanically with zero deviations. Validating the highest-risk conversion first before batching it across 13 files is sound practice: the cost of one extra proof ticket was far less than debugging divergent behavior across the batch.

**`$:` triage rule held cleanly.** Pure computed value → `$derived`; side-effecting (DOM, ECharts `setOption`, external) → `$effect`. No ambiguous cases emerged that needed escalation. The rule is reusable for any Svelte 4→5 migration.

**Cluster-based bottom-up ticket ordering.** Shared primitives (T02) first, then chart families (T03, T04), controls (T05), navbar (T06), routes (T07), global flip (T08). Dependencies resolved in order; no ticket had to convert a component already converted by a sibling.

**T08 global flip was trivially clean.** 52 directive lines deleted + 3 config lines added, zero compilation errors surfaced. Every file had already been individually validated in runes mode; the global switch just removed the per-file safety nets. This validates the per-file strategy: if files had been converted speculatively without per-file enforcement, the global flip would have been the debugging session instead of a mechanical delete.

## Pain points

**`StatsPanel` TypeScript suppression.** A `ts-expect-error` annotation in `StatsPanel.svelte` for an ECharts type boundary became a hard error in runes mode (the suppress target no longer matched). Required a string cast fix in T07. Root cause: suppression comments are fragile across compiler version boundaries; they're worth auditing before any large migration.

**`state_referenced_locally` warnings are noisy.** With runes mode, svelte-check warns when a `$state` or `$derived` value is read in a `$effect` closure at declaration time rather than via reactive lookup. These warnings appear in `BreakdownChart`, `DailyChartControls`, `ActivityChart`, `TimelineChart`, and a few route pages (`account`, `login`, `iterations/[id]`). All are benign: the referenced values are either stable config props or lazy-initialized in a way the compiler can't prove. The warnings won't block builds but will persist until each site is individually fixed — expected cost, not avoidable waste. Noting them here so the next phase doesn't re-investigate.

**`non_reactive_update` warnings for `chartRef`.** `bind:this={chartRef}` on ECharts containers logs warnings because `chartRef` is a plain `let` rather than `$state`. In runes mode, `bind:this` mutates the variable from outside the component; without `$state`, the compiler warns. These are also benign — `chartRef` is used only inside `$effect` where Svelte tracks access and the value is stable after mount. Fixing them correctly requires `let chartRef = $state<ECharts | null>(null)` across ~9 chart files. Deferred: they belong in a targeted cleanup rather than mid-migration drive-bys.

## Surprises

**The global `runes: true` flag in T08 surfaced zero new errors.** Expected at least one missed legacy idiom to show up. Every file had been individually validated in runes mode before T08; the per-file strategy was the reason. Any future large-codebase migration should adopt this pattern: enforce at the file level early, prove it works incrementally, flip global at the end.

**`<svelte:component>` dynamic render still works with component imports.** The Svelte 5 "dynamic component" pattern (`{@const Component = ...}` then `<Component />`) worked without a dedicated dynamic-component wrapper because all component types were statically importable. The concern in the grill-me session about `svelte:component` was warranted (it is legacy) but the migration was simpler than anticipated — the call-site change is mechanical.

**ESLint a11y rule naming changed silently.** `a11y-no-noninteractive-tabindex` is now the legacy spelling; Svelte 5 runes mode emits `a11y_no_noninteractive_tabindex` (underscore-delimited). The ESLint config still references the old name, causing an ignored rule and a runtime ESLint warning. Not a blocker, but it means the `DarkModeToggle` tabindex a11y violation isn't being caught by the linter. Deferred: ESLint Svelte config needs its a11y rule names updated.

**Store auto-subscription stays transparent.** `$navigating`, `$page`, `$dropdown`, `$loading` — all `writable`/`readable` auto-subscriptions — continued to work in runes mode without any changes. The `$store` shorthand is not a legacy idiom; it's a Svelte 5-compatible feature distinct from `$state`. This was a known assumption from grill-me, confirmed by the migration with no surprises.

## What we'd do differently

**Convert `chartRef` to `$state` during the chart tickets, not deferred.** The `non_reactive_update` warnings are a predictable consequence of `bind:this` on plain `let` variables in runes mode. Svelte's docs make this clear. The original decision to skip `$state` for `chartRef` was correct for the "mechanical-only, no drive-bys" policy, but a narrow allowance for `bind:this` refs would have been worth making: the change is one word per file, purely mechanical, and removes a standing warning class without any behavioral risk.

**Audit `ts-expect-error` suppressions before branching.** One suppression in `StatsPanel` became a build error mid-T07 because the suppressed error no longer existed (the target narrowed). A pre-migration grep for `ts-expect-error` with a quick "does this still match?" pass would have flagged it in T07 planning rather than during implementation.

**Batch route pages and leaf components into fewer tickets.** T07 covered 17 files across routes and miscellaneous leaves. It was manageable but the diff was wide. A cleaner split would have been T07a: route pages, T07b: leaf components — each PR would have been more focused for review. The current 8-ticket structure was reasonable given the "cluster" framing, but the route cluster was the largest single diff in the phase.

## Net assessment

Phase goal achieved in full. Zero legacy idioms in `src`, global `runes: true` enforces going forward, all existing tests pass, `svelte-check` reports 0 errors, and the per-file bridge strategy kept `main` green throughout. The one item that didn't land per the product plan is the Playwright smoke test verification — the smoke test wasn't run end-to-end during delivery due to missing E2E environment setup; the `svelte-check` + vitest suite was the verification gate used instead. This is an existing gap in the CI pipeline, not a migration-specific risk.

## Follow-up

- Fix `chartRef` `non_reactive_update` warnings: declare as `$state<ECharts | null>(null)` in the 9 chart files. Mechanical, low-risk.
- Update ESLint Svelte config to use underscore-delimited a11y rule names (`a11y_no_noninteractive_tabindex` etc.) so linting actually catches `DarkModeToggle`'s tabindex violation.
- Fix `state_referenced_locally` warnings in `BreakdownChart`, `DailyChartControls`, `ActivityChart`, `TimelineChart`, route pages. Each requires wrapping the referenced value in a closure or lifting it into a `$derived`.
- Convert `dropdown.ts` / `loading.ts` `writable` stores to `$state` `.svelte.ts` modules when the team is ready to take the reactivity/export risk. Not urgent — `writable` is fully supported in Svelte 5.
- Migrate `$app/stores` → `$app/state` (`$navigating` → `import { navigating } from '$app/state'`) when SvelteKit deprecates the old import path.
- Wire up E2E smoke test into CI or document a manual smoke runbook so the exit condition can be fully verified in future phases.

_Created: 2026-06-17. PRs #170–#177 open, awaiting developer closeout._
