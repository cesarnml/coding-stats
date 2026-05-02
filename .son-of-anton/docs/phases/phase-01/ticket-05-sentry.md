# P1.05 Upgrade + uncomment Sentry, sourcemaps off

Size: 3 points

## Outcome

- `@sentry/sveltekit` and `@sentry/opentelemetry` upgraded to latest stable
- Both `hooks.server.ts` and `hooks.client.ts` have Sentry uncommented and active in production
- Sourcemap uploads are explicitly disabled (not just absent — set `sourcemapsUploadOptions: { disable: true }` or equivalent in vite config if a Sentry Vite plugin is present)
- `PUBLIC_SENTRY_DSN` is confirmed present in `.env` and `.env.example`
- A test error reaches the Sentry dashboard (manual verification)
- CI passes

## Red

- Confirm current Sentry package versions before upgrade
- Check if a Sentry Vite plugin (`sentryVitePlugin`) is wired into `vite.config.ts` — if so, sourcemap upload config lives there

## Green

- `pnpm add @sentry/sveltekit@latest @sentry/opentelemetry@latest`
- Uncomment `Sentry.init(...)` in both hooks files
- Uncomment `handleErrorWithSentry()` calls
- In `hooks.client.ts`: remove or disable Replay integration (it was commented out — leave it out for now)
- Disable sourcemap uploads in vite config if Sentry plugin is present; if not present, no action needed
- Confirm `PUBLIC_SENTRY_DSN` is in `.env.example` (it already is in `.env`)
- Run `pnpm check` and `pnpm build` locally
- Deploy and trigger a test error to verify Sentry receives it

## Refactor

- Do not add Replay, BrowserTracing, or any integrations not already present in the commented code
- Sourcemap upload deferral is explicit — do not re-enable it

## Review Focus

- Both hooks files have Sentry active, not commented out
- `handleErrorWithSentry()` wired in both `handleError` exports
- Sourcemap uploads explicitly disabled, not just absent
- No new Sentry integrations added beyond what was originally there
- `pnpm build` succeeds without sourcemap upload attempts

## Rationale

> Append here during implementation.

Red first:
Why this path:
Alternative considered:
Deferred: Sentry sourcemap uploads — standalone PR. Replay integration — not in scope.
