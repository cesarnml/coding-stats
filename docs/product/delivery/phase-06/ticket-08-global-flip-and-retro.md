# P6.08 Global runes:true flip + directive cleanup + retrospective

Size: 2 points
Type: chore
Scope: svelte
Red: skip

## Outcome

- `svelte.config.js` sets `compilerOptions: { runes: true }` globally.
- Every `<svelte:options runes={true}>` directive added in T01–T07 is removed (now redundant).
- Repo-wide `grep` for all six legacy idioms (`export let`, `$:`, `createEventDispatcher`, `on:` component events, `<slot>`, `beforeUpdate`/`afterUpdate`) returns zero across `src`.
- `bun run format`, `bun run verify` (`svelte-check` + vitest), and the Playwright smoke test all pass with the global flag on.
- A reintroduced legacy idiom now fails the build (verified once, then reverted).
- Retrospective written to `notes/public/phase-06-svelte5-runes-migration-retrospective.md`.
- Product plan + implementation plan `Delivery status` lines updated to reflect completion.

## Red

- `Red: skip` — config/build change plus directive removal; no component behavior changes. The whole suite + smoke under the global flag is the guard.

## Green

- Add `compilerOptions: { runes: true }` to `svelte.config.js`.
- Remove every `<svelte:options runes={true}>` directive across the converted files.
- Run `bun run verify` + smoke; fix any file the global flip surfaces (do not soften the flag).
- Write the retrospective per `.agents/skills/write-retrospective/SKILL.md` section structure.

## Refactor

- Directive removal only — no logic changes.

## Review Focus

- The flag actually enforces: temporarily reintroduce an `export let` somewhere and confirm the build fails, then revert.
- No `<svelte:options runes={true}>` directives remain anywhere.
- `svelte-check` clean and the full suite green under the global flag.
- Retrospective captures the `$:`→`$derived` vs `$effect` decisions, `afterUpdate`→`$effect` recipe, snippet conversions, and any deferred findings logged during T01–T07.

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: n/a (`Red: skip`).
Why this path: the global flip is the durable lock that makes the migration self-policing; bundled with directive cleanup and the retrospective as the phase-closeout ticket.
Alternative considered: leaving per-file directives in place (no global flag) — rejected; enforcement would be convention, not a guarantee, and the product plan requires `runes: true`.
Deferred: SvelteKit `$app/stores`→`$app/state` migration; `writable`→`$state` store conversion; `chartRef` `$state` fix; ESLint a11y rule name migration; `state_referenced_locally` warning cleanup.
Contract note: T08 global flip surfaced zero new compilation errors — per-file bridge strategy validated. Verified enforcement: `export let` in runes mode → `legacy_export_invalid` build error (tested and reverted). Retrospective written to `notes/public/phase-06-svelte5-runes-migration-retrospective.md`.
