# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A WakaTime data scraper and personal dashboard. It pulls coding activity from the WakaTime API, stores it in Supabase, and visualizes it as a portfolio/client-facing tool ("Apple Health for coders"). Live at codingstats.vercel.app. Single-user (owner only — no multi-tenant auth).

## Commands

```bash
# Full local dev setup (pulls remote data, resets local DB, seeds, gen types, starts vite)
pnpm dev:fresh        # alias: prcs

# Resume dev without re-pulling remote data (containers already running)
pnpm dev:resume

# Stop local Supabase
pnpm sb:stop

# Individual supabase steps
pnpm sb:dump:remote   # dump remote prod data → supabase/seed.sql (gitignored)
pnpm sb:reset         # truncate all local tables
pnpm sb:seed          # load seed.sql into local DB
pnpm sb:types         # regenerate src/lib/database.types.ts from local schema

# Tests
pnpm test:unit        # vitest unit tests
pnpm test             # playwright e2e
pnpm test:unit -- path/to/file.spec.ts   # single file

# Type checking
pnpm check

# Lint / format
pnpm lint
pnpm format
```

## Architecture

### Data flow

```
WakaTime API
    │
    ├─ Cron routes (Vercel cron, daily)
    │   /api/cron/wakatime/summaries          → supabase: summaries
    │   /api/cron/wakatime/durations          → supabase: durations
    │   /api/cron/wakatime/durations-by-language → supabase: durations_by_language
    │   /api/cron/wakatime/project-summaries  → supabase: project_summaries
    │
    └─ Live proxy routes (called on demand)
        /api/wakatime/current/summaries       → proxies WakaTime with WAKA_API_KEY
        /api/wakatime/current/durations
        /api/wakatime/current/projects

Supabase (Postgres)
    │
    └─ Read routes (called by page load functions)
        /api/supabase/summaries               → filtered by date range
        /api/supabase/durations               → last N days, for Activity chart
        /api/supabase/durations-by-language
        /api/supabase/project-summaries
        /api/supabase/profiles
        /api/supabase/projects
```

Cron routes always scrape **yesterday** (WakaTime finalizes the prior day). Today's data is partial/live and sourced from the proxy routes on demand.

### Route structure

- `/` — main dashboard (summaries + durations for selected range)
- `/projects` — project list from WakaTime live API
- `/projects/[projectName]` — per-project detail: Supabase summaries + Vercel project info + Shortcut stories
- `/iterations`, `/iterations/[iterationId]` — Shortcut sprint view (secondary feature)
- `/account` — profile settings, requires auth
- `/login`, `/login-redirect` — Supabase OAuth flow

### Data layer

**Page loads** (`+page.server.ts`) call internal `/api/supabase/*` routes via `fetch`, not Supabase directly. This keeps data-fetching logic in one place.

**`hooks.server.ts`** creates the Supabase server client per request and attaches `getSession()`, `getProfile()`, `getProjects()` to `event.locals`. Layout server load calls all three in parallel and puts them in page data for the whole app.

**`src/app.d.ts`** is the source of truth for `App.Locals` types and all Supa* row types (`SupaProfile`, `SupaSummary`, `SupaDuration`, etc.) derived from `database.types.ts`.

### Schema key points

All tables store WakaTime API response data as JSON blobs (`data json`, `languages json`, `grand_total json`, etc.) — not normalized columns. Querying inside these requires `->>`  operators. Each table has a `UNIQUE (date)` constraint for idempotent upserts. `project_summaries` has `UNIQUE (project_id, date)`.

### Charts

All charts use **Apache ECharts** initialized with `echarts.init(ref, 'dark', { renderer: 'svg' })`. Each chart component has a paired `*Helpers.ts` file that builds the ECharts `option` object. Charts call `chart.setOption(option)` in `afterUpdate` to react to prop changes.

Chart components receive typed props (e.g. `SupabaseDuration`, `SummariesResult`) directly — no chart-level data fetching.

### State management

Svelte stores in `src/lib/stores/`:
- `selectedRange` — the active WakaTime range string (e.g. `'Last 7 Days'`). Changing it triggers a `fetch` to `/api/supabase/summaries?range=...` and updates page-level `summaries` reactively without a full navigation.
- `loading` — global boolean for loading indicator
- `profile`, `session`, `project`, `dropdown` — supporting stores

### Third-party integrations

- **WakaTime** — primary data source, API key in `WAKA_API_KEY` env var
- **Supabase** — storage + auth. Env vars: `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`
- **Vercel** — deployment + project/alias API (`VERCEL_TOKEN`, `VERCEL_TEAM_ID`)
- **Shortcut** — sprint/iteration data (`SHORTCUT_API_TOKEN`). Secondary feature, not used by all views.
- **Sentry** — currently fully commented out in both hooks files. Was disabled to unblock production.

### Path aliases

`$lib` → `src/lib`, `$src` → `src` (configured in `tsconfig.json` and `vite.config.ts`).

## Known issues (as of 2026-05-02)

**Fixed in Phase 01:**
- ✅ Sentry now active in production (both client + server hooks uncommented)
- ✅ Auth cookie validation moved to server (`getUser()` in hooks.server.ts)
- ✅ `axios` replaced with native `fetch` across all internal API calls
- ✅ `eslint-plugin-svelte3` migrated to `eslint-plugin-svelte` full config
- ✅ `@vitest/coverage-c8` removed (now using `@vitest/coverage-v8`)
- ✅ ESLint flat config migration complete

**Remaining known issues:**
- CI jobs (Lint, Test) disabled in workflow — requires Node 20 bump (one-line fix, deferred from Phase 01)
- Sentry sourcemaps disabled — requires validation that error traces are readable without them
- Activity chart renders negative minute bars — cron scrapes yesterday only, but data merging produces artifacts when run multiple times
- Several charts have no empty state — render blank axes when there's no data for the selected range

See `notes/public/revival-roadmap.md` for prioritized remediation plan.
