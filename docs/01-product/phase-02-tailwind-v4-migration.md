# Phase 2: Tailwind v4 + daisyUI v5 Migration

**Delivery status:** In progress — implementation plan and tickets at `docs/02-delivery/phase-02/`.

## TL;DR

**Goal:** Upgrade the CSS pipeline to Tailwind v4 and daisyUI v5, eliminating two unused plugins and aligning config with the modern CSS-first approach.

**Ships:** Tailwind v4 + daisyUI v5 installed; `tailwind.config.ts` deleted; `app.css` (renamed from `app.postcss`) owning all config via `@import`, `@plugin`, and `@theme`; `autoprefixer`, `@tailwindcss/forms`, and `@tailwindcss/typography` removed.

**Defers:** Sourcemap upload to Sentry; Playwright CI re-enable; any daisyUI v5 component changes beyond current usage.

---

Tailwind v4 is a complete rewrite of the CSS pipeline — configuration moves from a JavaScript config file to CSS-first directives, autoprefixer is built in, and plugins are loaded via `@plugin` rather than `require()`. daisyUI v4 is incompatible with Tailwind v4; daisyUI v5 is the required upgrade path. This phase keeps the codebase on maintained, convention-aligned tooling before Tier 2 (AI Coding Story) feature work begins.

## Phase Goal

This phase should leave the project in a state where:

- `tailwindcss` v4 and `daisyui` v5 are the installed versions, with no v3-era config remaining
- the `synthwave` and `night` themes render correctly and the theme toggle works
- `pnpm check`, `pnpm lint`, and `pnpm build` pass with 0 errors
- `autoprefixer`, `@tailwindcss/forms`, and `@tailwindcss/typography` are absent from `package.json`

## Committed Scope

### Package changes

- Install `tailwindcss@4`, `@tailwindcss/postcss`, `daisyui@5`
- Remove `autoprefixer`, `@tailwindcss/forms`, `@tailwindcss/typography`

### Config migration

- Delete `tailwind.config.ts`
- Rewrite `postcss.config.js` to use `@tailwindcss/postcss` only
- Rename `src/app.postcss` → `src/app.css`; rewrite with `@import "tailwindcss"`, `@plugin "daisyui"` (themes: synthwave, night --prefersdark), and `@theme` block containing `--color-chart-dark` and `--aspect-panoramic`
- Update `+layout.svelte` import from `app.postcss` → `app.css`
- Replace the single `prose` class in `+error.svelte` with an inline style (typography plugin dropped)

### Visual verification

- Dev server smoke test: both `synthwave` and `night` themes render correctly, theme toggle works

## Explicit Deferrals

- `@tailwindcss/typography` via `@plugin` path — dropped entirely; `prose` usage was a single error page
- Tailwind v4 content detection tuning — v4 auto-detects; no action needed
- Playwright automated visual regression tests — out of scope for this phase
- Any daisyUI v5 component API changes beyond the components currently in use

## Exit Condition

`pnpm check` + `pnpm lint` + `pnpm build` pass clean. Developer confirms in the dev server that `synthwave` and `night` themes render correctly and the theme toggle works.

## Retrospective

`skip` — self-contained dependency upgrade; no durable architectural decisions, no new product surface.
