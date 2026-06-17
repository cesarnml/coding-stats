# P6.01 ECharts recipe proof (VerticalBarChart)

Size: 2 points
Type: refactor
Scope: charts
Red: skip

## Outcome

- `BarChart/VerticalBarChart.svelte` uses runes only: `export let` → `$props()`, `$:` derived values → `$derived`, `afterUpdate(() => chart.setOption(option))` → `$effect(() => { chart?.setOption(option) })`.
- File carries `<svelte:options runes={true}>` so it compiles in rune mode under the default mixed compiler.
- The documented ECharts recipe (in this ticket's Rationale and the implementation plan) is validated and ready for T03/T04 to apply.
- `grep` for legacy idioms in this file returns zero.
- Chart still initializes on mount, redraws on data change, and the `chart.on('click', …)` story-branch handler still works.

## Red

- `Red: skip` — behavior-preserving conversion; no net-new behavior to test-drive. Existing `BarChart` unit/helper tests plus the smoke e2e are the guard.

## Green

- Convert `VerticalBarChart.svelte` to runes following the `$:`→`$derived` / `afterUpdate`→`$effect` translation.
- Guard the `$effect` against the not-yet-initialized chart (`chart?.setOption`), since `onMount` init and the effect can interleave differently than `afterUpdate` did.
- Add `<svelte:options runes={true}>`.

## Refactor

- No structural change. Keep the `onMount` init + resize listener + click handler intact.
- Do not touch `verticalBarChartHelpers.ts` or the chart option-builder logic.

## Review Focus

- The `afterUpdate`→`$effect` semantic shift: `afterUpdate` fired after _every_ update; `$effect` fires only when `option`'s reactive dependencies change. Confirm redraw still happens on `summaries`/`title` change and not spuriously.
- Effect ordering vs `onMount`: ensure no "setOption before init" runtime error.
- That the click handler and resize cleanup are unchanged.

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: n/a (`Red: skip`).
Why this path: behavior-preserving mechanical conversion; establishes the canonical recipe for 12 sibling charts before batching.
Alternative considered: a net-new characterization test asserting `setOption` fires on data change — rejected per product plan's "no net-new characterization tests" deferral; manual smoke + existing tests cover it.
Deferred: the other 12 charts (T03/T04).
Contract note: —
