# P6.05 Events→callback props + dynamic component

Size: 3 points
Type: refactor
Scope: controls
Red: skip

## Outcome

- These 4 files use runes only: `DateRangeSelect.svelte`, `BarChart/DailyChartControls.svelte`, `GaugeChart/DailyGaugeControls.svelte`, `DarkModeToggle.svelte`.
- `createEventDispatcher` + component `on:` events → callback props passed via `$props()`; consumer call-sites updated to pass callbacks instead of `on:event` handlers (ripple owned here).
- `DarkModeToggle`'s `<svelte:component>` → Svelte 5 dynamic component pattern; `bind:group` confirmed native (no `$bindable` unless it targets a custom prop).
- Each file carries `<svelte:options runes={true}>`.
- `grep` for legacy idioms in these files returns zero.

## Red

- `Red: skip` — behavior-preserving. Existing `DateRangeSelect.spec.ts`, `DarkModeToggle.spec.ts` render tests plus smoke e2e are the guard.

## Green

- Replace each `createEventDispatcher()` + `dispatch('x', detail)` with a `onX?: (detail) => void` callback prop; update consumers from `on:x={…}` to `onX={…}`.
- Convert `<svelte:component this={…}>` in `DarkModeToggle` to the rune-era dynamic render (`{@const C = …}` + `<C />` or equivalent).
- Verify `bind:group` targets a native `<input>`; if it targets a component prop, add `$bindable()` to that child and note it.
- Add `<svelte:options runes={true}>` to each.

## Refactor

- No new abstractions. Callback prop names mirror the previous event names (`update` → `onUpdate`, etc.); keep signatures identical to the dispatched detail.
- Do not restructure the controls' markup or styling.

## Review Focus

- Every dispatched event (`on:update`, `on:change`, custom) has a corresponding callback prop and every consumer call-site is updated — grep `on:` against these components' usages after conversion.
- Dynamic component swap in `DarkModeToggle` renders the correct icon per theme selection.
- Two-way binding behavior unchanged (`bind:group` radio selection).

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: n/a (`Red: skip`).
Why this path: dispatcher→callback and `<svelte:component>`→dynamic-render are the remaining non-chart structural idioms; grouped because they share the "update consumer call-sites" ripple.
Alternative considered: folding these into the routes ticket — rejected; controls have their own interactive smoke surface worth an isolated boundary.
Deferred: Navbar (T06), routes (T07).
Contract note: —
