# P6.02 Shared presentational primitives + slot→snippet

Size: 3 points
Type: refactor
Scope: ui
Red: skip

## Outcome

- These 9 files use runes only: `Container.svelte`, `ChartTitle.svelte`, `common/ChartContainer.svelte`, `common/BigChartContainer.svelte`, `Stats/StatPanelItem.svelte`, `PageTransition.svelte`, `assets/svg/{Moon,Sun,System}.svelte`.
- `<slot>` / named slots → snippets (`{@render children()}` / `{#snippet}` / `{@render name()}`); `export let` → `$props()`; `$:` → `$derived`/`$effect` per the triage rule.
- Consumer call-sites that pass **named** slot content to these wrappers are updated in this same ticket (ripple owned here).
- Each converted file carries `<svelte:options runes={true}>`.
- `grep` for legacy idioms in these files returns zero.

## Red

- `Red: skip` — behavior-preserving conversion. Existing `Container.spec.ts`, `ChartTitle.spec.ts`, `PageTransition.spec.ts`, `StatPanelItem.spec.ts` render tests are the guard.

## Green

- Convert each wrapper. Default `<slot/>` → `{@render children?.()}` with `children` from `$props()`; named slots → named snippet props rendered via `{@render name()}`.
- Update every consumer that uses named-slot syntax (`slot="x"`) on these wrappers to the `{#snippet x()}…{/snippet}` form. Default-slot consumers need no change (interop preserved).
- Add `<svelte:options runes={true}>` to each file.

## Refactor

- No new abstractions. Snippet param shapes mirror the previous slot props exactly.

## Review Focus

- Snippet vs slot fallback content: any `<slot>default</slot>` fallback must become `{@render children?.() ?? fallback}` or equivalent — confirm fallbacks preserved.
- That all named-slot consumers were found and updated (grep `slot=` after conversion for these wrappers' call-sites).
- `PageTransition` is animation/transition-driven — confirm transitions still fire.

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: n/a (`Red: skip`).
Why this path: shared primitives are consumed by charts/navbar/routes; converting them early stabilizes the snippet API before downstream tickets.
Alternative considered: deferring snippet-consumer ripple across later tickets — rejected (leaves slot API half-migrated across PR boundaries).
Deferred: `NavLogo` slot (T06), `+layout` slot (T07).
Contract note: —
