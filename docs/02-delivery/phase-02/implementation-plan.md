# Phase 2 — Tailwind v4 + daisyUI v5 Migration

> Upgrade the CSS pipeline from Tailwind v3 + daisyUI v4 to Tailwind v4 + daisyUI v5, removing two unused plugins and aligning config with the v4 CSS-first approach.

## Epic

Dependency modernization — `notes/public/revival-roadmap.md` (pre-Tier 2 maintenance).

## Product contract

When this phase is complete:
- `tailwindcss` v4, `@tailwindcss/postcss`, and `daisyui` v5 are in `package.json`
- `tailwind.config.ts`, `autoprefixer`, `@tailwindcss/forms`, and `@tailwindcss/typography` are gone
- `app.css` (renamed from `app.postcss`) contains all Tailwind config via `@import`, `@plugin`, and `@theme`
- `pnpm check`, `pnpm lint`, and `pnpm build` pass clean
- `synthwave` and `night` themes render correctly in the dev server (visual smoke test)

## Grill-Me decisions locked

- **`@tailwindcss/forms`** → drop; daisyUI v5 covers form styling entirely
- **`@tailwindcss/typography`** → drop; replace the single `prose` usage in `+error.svelte` with an inline style
- **`aspect-panoramic`** → migrate to `@theme { --aspect-panoramic: 3/1; }` in `app.css`; template unchanged
- **`chart-dark` color** → migrate to `@theme { --color-chart-dark: #0F0C28; }` in `app.css`; templates unchanged
- **`app.postcss`** → rename to `app.css`; update import in `+layout.svelte`
- **Retrospective** → skip; self-contained dependency upgrade with no durable architectural decisions

## Ticket Order

1. `P2.01 Package swap — Tailwind v4 + daisyUI v5`
2. `P2.02 Config migration — CSS-first config, rename app.css`
3. `P2.03 Verify + visual smoke test`

## Ticket Files

- `ticket-01-package-swap.md`
- `ticket-02-config-migration.md`
- `ticket-03-verify.md`

## Exit Condition

All three tickets merged to main. `pnpm check` + `pnpm lint` + `pnpm build` pass. Developer confirms `synthwave` and `night` themes render correctly in the dev server.

## CI Baseline

> Baseline recorded: 2026-05-02 — pnpm check: 0 errors, 64 warnings. pnpm lint: pass. pnpm test:unit: 31 files, 60 tests, all pass.

## Review Rules

- Tickets must be merged in order.
- Each ticket PR must pass CI before the next ticket starts.
- P2.02 depends on P2.01 being merged (package resolution must be correct before config is rewritten).
- P2.03 is the gate — visual smoke test must pass before phase is closed.

## Explicit Deferrals

- Sourcemap upload to Sentry (separate deferred item in roadmap)
- Playwright CI re-enable (separate deferred item)
- Tailwind v4 content detection config tuning (v4 auto-detects; no action needed)
- Any daisyUI v5 component API changes beyond the components currently in use

## Stop Conditions

- `pnpm build` fails after config migration and cannot be resolved within P2.02 scope → pause, report.
- daisyUI v5 theme rendering is broken in a way that requires JS-side changes → pause, report.
- Any `@plugin` directive causes a PostCSS error not resolvable within ticket scope → pause, report.
