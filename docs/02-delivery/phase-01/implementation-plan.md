# Phase 1 — Unblock Production

> Restore error visibility, close the auth security gap, and eliminate unmaintained/zombie dependencies.

## Epic

Tier 1 of `notes/public/revival-roadmap.md`.

## Product contract

When this phase is complete:
- Sentry is receiving errors from production
- Auth cookie validation is server-verified (not client-trusted)
- `axios`, `eslint-plugin-svelte3`, and `@vitest/coverage-c8` are absent from `package.json`
- ESLint is running on a maintained plugin with full config migration

## Grill-Me decisions locked

- **Sentry scope** → upgrade to latest stable + uncomment both hooks (client + server); sourcemap uploads disabled (deferred to standalone PR)
- **Axios scope** → full removal: all 7 files (6 server routes + `+page.svelte`), drop from `package.json`
- **ESLint migration** → full config migration to `eslint-plugin-svelte`, not a minimal fix
- **Ticket order** → auth fix first (proves CI baseline), Sentry last (most uncertain, avoids gating earlier PRs)

## Ticket Order

1. `P1.01 getSession → getUser`
2. `P1.02 Remove @vitest/coverage-c8`
3. `P1.03 eslint-plugin-svelte3 → eslint-plugin-svelte full migration`
4. `P1.04 Replace axios with native fetch`
5. `P1.05 Upgrade + uncomment Sentry, sourcemaps off`

## Ticket Files

- `ticket-01-get-user.md`
- `ticket-02-drop-coverage-c8.md`
- `ticket-03-eslint-svelte-migration.md`
- `ticket-04-axios-to-fetch.md`
- `ticket-05-sentry.md`

## Exit Condition

All 5 PRs merged and CI green. Sentry dashboard is receiving production errors. `axios`, `eslint-plugin-svelte3`, and `@vitest/coverage-c8` do not appear in `package.json`. ESLint passes with `eslint-plugin-svelte`.

## Review Rules

- Tickets must be merged in order.
- Each ticket PR must pass CI before the next ticket starts.

## Explicit Deferrals

- Sentry sourcemap uploads — deferred to a standalone PR after phase closes
- Client-side Sentry Replay integration — not in scope
- Any ESLint rule tuning beyond getting lint passing — not in scope
- `getSession` usages outside `hooks.server.ts` — not in scope

## Stop Conditions

- Broken CI that cannot be resolved within the ticket scope
- Sentry upgrade introduces a SvelteKit incompatibility that requires a major version decision

## Phase Closeout

Retrospective: skip
Why: No new product surface, no durable architectural boundary introduced.
Trigger: none
