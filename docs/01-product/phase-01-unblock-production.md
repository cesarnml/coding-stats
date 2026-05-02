# Phase 1 — Unblock Production

## Goal

Get this app back to a trustworthy production baseline before any new features ship.

## Why now

The app has been dormant ~2 years. Three specific gaps make it unsafe to build on:

1. **Zero error visibility** — Sentry is fully commented out. Production failures are invisible.
2. **Auth security gap** — `getSession()` trusts the local cookie without server-side JWT validation. `getUser()` closes this.
3. **Zombie dependencies** — `eslint-plugin-svelte3` (unmaintained), `@vitest/coverage-c8` (deprecated), and `axios` (unnecessary dep for internal fetch calls) add maintenance surface with no value.

## Success looks like

- Sentry is receiving errors from production
- Auth is server-validated on every request
- `axios`, `eslint-plugin-svelte3`, and `@vitest/coverage-c8` are gone from `package.json`
- ESLint runs on a maintained plugin with correct config
- CI is green

## Non-goals

- No new features
- No Sentry sourcemap uploads (deferred — separate standalone PR)
- No schema changes
- No UI work

## Delivery

See `docs/02-delivery/phase-01/implementation-plan.md`.
