# P6.07 Routes + remaining leaves

Size: 5 points
Type: refactor
Scope: routes
Red: skip

## Outcome

- These 17 files use runes only:
  - Routes: `routes/+error.svelte`, `routes/+layout.svelte`, `routes/+page.svelte`, `routes/AiStatPanel.svelte`, `routes/account/+page.svelte`, `routes/iterations/+page.svelte`, `routes/iterations/[iterationId]/+page.svelte`, `routes/login-redirect/+page.svelte`, `routes/login/+page.svelte`, `routes/projects/+page.svelte`, `routes/projects/[projectName]/+page.svelte`.
  - Leaves: `Footer.svelte`, `ProjectList.svelte`, `EmptyState.svelte`, `Stats/StatsPanel.svelte`, `common/NinjaSpinner.svelte`, `common/SearchInput.svelte`.
- `export let data` (page data) → `$props()`; `$:` → `$derived`/`$effect`; `+layout`'s `<slot>` → `{@render children()}`.
- `$navigating`/`$page` store auto-subscription kept as-is (valid in runes mode).
- Each file carries `<svelte:options runes={true}>`.
- After this ticket every `.svelte` file in the repo is rune-mode; only the global compiler flip (T08) remains.
- `grep` for legacy idioms in these files returns zero.

## Red

- `Red: skip` — behavior-preserving. Existing `page.spec.ts`, `Footer.spec.ts`, `ProjectList.spec.ts`, `StatsPanel.spec.ts`, `EmptyState.spec.ts`, `SearchInput.spec.ts`, `NinjaSpinner.spec.ts`, route server specs, and smoke e2e are the guard.

## Green

- Convert each route/leaf mechanically. SvelteKit `export let data` becomes `let { data } = $props()`.
- `+layout.svelte` default `<slot>` → `{@render children?.()}`.
- Add `<svelte:options runes={true}>` to each.

## Refactor

- No structural change to routes or leaves; `$props()` destructuring mirrors the previous `export let` declarations exactly.
- Do not touch `load` functions, `+page.ts`/`+layout.ts`, or any non-`.svelte` route module.

## Review Focus

- `+layout` children render correctly across all routes (page content nests under layout).
- Page-data props (`data` from `load`) bind correctly via `$props()`; no lost reactivity when navigation re-runs `load`.
- `SearchInput` two-way input behavior unchanged; `ProjectList` filtering still reactive.
- This is the largest, most heterogeneous ticket — confirm no drive-by changes slipped into any route diff.

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: n/a (`Red: skip`).
Why this path: mops up all remaining route-level and leaf components so T08's global flip has nothing left to break.
Alternative considered: splitting routes from leaf components into two tickets — rejected; both are simple mechanical conversions and the combined diff is still reviewable.
Deferred: the global `runes: true` flip and directive cleanup (T08).
Contract note: —
