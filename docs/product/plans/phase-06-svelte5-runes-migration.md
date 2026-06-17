# Phase 6: Svelte 5 Runes Migration

**Delivery status:** Delivered. All 8 tickets done (PRs #170–#177). Awaiting developer closeout.

## TL;DR

**Goal:** Eliminate Svelte 4 legacy-mode debt by migrating every component to Svelte 5 runes, unblocking future Svelte 5 capabilities and cutting maintenance friction.

**Ships:**

- All 51 `.svelte` files converted from legacy syntax to runes (`$props`, `$state`, `$derived`, `$effect`, callback props, snippets).
- `runes: true` compiler enforcement in `svelte.config.js` so legacy syntax becomes a build error going forward.
- A deferred-findings log capturing real bugs/improvements noticed mid-migration but intentionally not fixed in-phase.

**Defers:**

- Converting the 2 `writable` stores (`dropdown.ts`, `loading.ts`) to `$state` `.svelte.ts` modules — stores are a supported v5 pattern, not legacy debt.
- All non-mechanical changes: component extraction, prop/API renames, styling, type cleanup, test rewrites beyond what runes force.
- Net-new characterization tests for high-risk surfaces.

---

The app already runs on Svelte 5.55.9 but entirely in legacy compatibility mode: 0 of 51 components use runes, while 28 use `$:`, 32 use `export let`, 3 use `createEventDispatcher`, 8 use `<slot>`, and ~14 use `beforeUpdate`/`afterUpdate`. Legacy mode is supported today but is borrowed time — it will eventually be deprecated and removed, and a fully mixed-paradigm-free codebase is cheapest to achieve now (51 files) than later. The forcing function is enabling debt, not a user-facing feature.

## Phase Goal

This phase should leave the product in a state where:

- `grep` for legacy idioms (`export let`, `$:`, `createEventDispatcher`, `on:` component events, `<slot>`, `beforeUpdate`/`afterUpdate`) returns **zero** hits across `src`.
- The Svelte compiler runs with `runes: true` globally, so any reintroduced legacy syntax fails the build.
- All 45 existing test files pass, `svelte-check` is clean, and the Playwright e2e suite is green.
- The app behaves identically to pre-migration — verified by a documented manual smoke pass over high-risk interactive surfaces.

## Committed Scope

### Component syntax migration (all in scope)

- `export let` → `$props()` destructuring (including default values and rest props).
- `$:` reactive statements → `$derived` (pure computed values) or `$effect` (side effects) — chosen deliberately per case, since the choice can change timing/behavior.
- `createEventDispatcher` + `on:` component events → callback props.
- `<slot>` / named slots → snippets (`{#snippet}` / `{@render}`).
- `<svelte:component>` dynamic render → Svelte 5 dynamic-component pattern.
- `beforeUpdate`/`afterUpdate` → rune-based redesign. These have no 1:1 mechanical equivalent and are treated as **in-scope but flagged** for extra review/smoke scrutiny.

### Enforcement & durability

- Flip `svelte.config.js` to `runes: true` as the final landing step, locking the paradigm.
- Maintain a deferred-findings log for anything noticed-but-not-fixed.

## Explicit Deferrals

- **`writable` store → `$state` conversion** — `writable`/`readable` are fully supported in v5 and are the shared-cross-module-state idiom, not "the Svelte 4 paradigm." Converting them adds reactivity/export risk (`.svelte.ts` reassignment gotchas) for zero deprecation pressure.
- **Drive-by improvements** — component extraction, prop/API renames, styling changes, `any`/type cleanup, and flaky-test fixes are forbidden in-phase; each contaminates the regression signal. Real bugs found mid-migration are logged as findings, not fixed here.
- **Net-new characterization tests** — writing Svelte-4-era tests we'd immediately migrate is partly throwaway; high-risk coverage is handled via e2e + manual smoke instead.

## Exit Condition

The codebase contains no Svelte 4 idioms (verified by grep), the compiler enforces `runes: true`, every existing unit test and the e2e suite pass, `svelte-check` is clean, and a documented manual smoke walkthrough of the high-risk surfaces — `beforeUpdate`/`afterUpdate`-driven behavior (charts, scroll, focus, third-party widget sync), the `<svelte:component>` dynamic render, and the custom `on:` action consumers (`on:wakarange`, `on:fade`, `on:hover`) — confirms identical behavior. The deferred-findings log is committed so follow-up work is traceable. Concurrent component/feature work is frozen for the contiguous duration of the phase to avoid merge conflicts and a broken global `runes: true` flip.

## Retrospective

`required` — the `runes: true` flip is a durable architectural boundary that changes every future component PR's assumptions, and the migration will surface reusable patterns/gotchas (`$:` → `$derived` vs `$effect`, `beforeUpdate`/`afterUpdate` redesigns, snippet conversions) worth capturing once. Trigger: architecture/process impact + durable-learning risk.
