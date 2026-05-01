# coding-stats Revival Roadmap

> Angle: "Apple Health for coders" — own your WakaTime history, show clients real effort data, differentiate with AI coding transparency.

---

## Tier 1 — Unblock Production (do these first)

### Fix Sentry
- Currently fully commented out on both client and server hooks
- Zero error visibility in production right now
- Likely broke during a dep update — isolate which Sentry package version conflicts and upgrade incrementally
- Target: errors flowing to Sentry dashboard before any new features ship

### Swap `getSession()` → `getUser()` in hooks.server.ts
- `getSession()` trusts the local cookie without server-side JWT validation
- `getUser()` validates against Supabase Auth server — closes a real auth surface
- One-line change, high signal

### Drop zombie dependencies
- `eslint-plugin-svelte3` → replace with `eslint-plugin-svelte` (svelte3 plugin is unmaintained)
- `@vitest/coverage-c8` at 0.33.0 → remove (c8 deprecated; `@vitest/coverage-v8` already installed)
- `axios` → replace with native `fetch` for internal SvelteKit API route calls (one less dep, no behavior change)

---

## Tier 2 — The AI Coding Story (highest strategic value)

### Wire in WakaTime AI data endpoints
- WakaTime now exposes AI completions data: accepted vs. rejected, by language, by editor
- This is the 2025 differentiator for clients: "I track not just how long I coded but how much was human vs. AI-assisted"
- Schema additions needed: `ai_completions` table or columns on `summaries`
- New chart: AI vs. human coding ratio over time (stacked bar or gauge)
- New stat panel metric: "AI acceptance rate this month"

### Add AI coding share to the client-facing pitch
- The "show clients my effort" angle gets much stronger with: total hours + language breakdown + AI usage rate
- Positions you as transparent about your workflow, not hiding AI use

---

## Tier 3 — Data Model Health

### Migrate JSON blob columns to typed columns
- `summaries.languages`, `summaries.grand_total`, `durations.data` etc. are opaque JSON
- Can't index, filter, or aggregate server-side without `->>`  gymnastics
- Migration path: add typed columns, backfill from JSON, drop blobs
- Unlocks: server-side filtering by language/project, proper aggregation queries, faster loads

### Confirm the scraper is alive and monitored
- The WakaTime → Supabase ingestion script is not in this repo
- If it silently fails, stats go stale with no alert
- At minimum: add a `last_scraped_at` timestamp to `profiles` and surface a stale-data warning in the UI if > 24h

---

## Tier 4 — Simplification

### Evaluate the Shortcut integration
- Full OpenAPI-generated client, iteration routes, WakaTime↔Shortcut range mappings
- Shortcut is not a tool most clients use — this is permanent maintenance surface for narrow value
- Decision: keep behind a feature flag, or extract to a separate optional integration

### Consolidate dev workflow scripts (already done)
- `dev:fresh` — full remote sync + reset + seed + types + vite
- `dev:resume` — local-only restart (skip remote dump)
- `sb:stop` — convenience wrapper
- `prcs` zshrc alias → `pnpm run dev:fresh`

---

## Tier 5 — UX / Empty States (screenshots 2026-05-01)

### Empty state handling is broken across most charts
Screenshots show the following rendering with no data or broken state:
- **Languages pie chart** — renders a blank grey circle with no label, no message
- **Discipline Gauge** — shows `NaN% of Avg` and `AVG:` with no value; emojis render but the needle/number are broken
- **Project Breakdown** — empty axes, no "no data" message
- **Weekly Breakdown** — flat line with no context that the range has no data
- **Coding Time By Project / By Category** — completely empty charts, no empty state copy
- **Context Switch (language view)** — shows "No Data" text but inconsistently styled vs. the project view which shows data

Every chart needs a consistent empty state: a short message ("No data for this range"), optionally a CTA ("Try a wider date range").

### Activity chart shows negative minutes (screenshot 2026-05-01, Apr 30th view)
- The Activity bar chart renders bars below zero (e.g. -55min at 3p on Apr 30)
- Root cause: today's in-progress WakaTime data is partial — durations are cumulative snapshots, not deltas. When a later poll overwrites an earlier one without diffing correctly, the subtraction goes negative
- This is a scraper + data model problem, not a chart problem — the chart is rendering what's in the DB faithfully
- Fix lives in ingestion: treat "today" rows as always-overwrite (upsert the full snapshot), and only lock/finalize "yesterday" rows once the day has closed
- Chart-side guard: clamp bars to `>= 0` as a short-term defensive fix to stop the visual corruption

### Today vs. yesterday data resolution strategy
Current situation: a GitHub Actions cron polls WakaTime every 10–30 min during the day. WakaTime's API returns cumulative durations for the current day that grow as you code — they are not finalized until midnight. Yesterday's data is complete and authoritative; today's is a live, partial snapshot.

Problems this causes:
- If the scraper stores each poll as a delta or appends, you get double-counting and negative bars (see screenshot)
- If it blindly upserts the daily total, you lose intraday resolution
- The `durations` table has a `UNIQUE (date)` constraint — one row per day — so today's row keeps getting overwritten, which is correct, but the `data` JSON blob inside may be getting merged instead of replaced

Recommended ingestion contract:
- **Today**: always full-replace the row (`ON CONFLICT (date) DO UPDATE SET data = EXCLUDED.data`). Never diff or append. Accept that the row is a live snapshot.
- **Yesterday** (and older): write once, mark finalized. Add a `is_finalized boolean DEFAULT false` column to `durations`. The cron skips rows where `is_finalized = true`. On the day rollover (first poll where `date < today`), write the final snapshot and set `is_finalized = true`.
- **UI signal**: show a subtle "live" badge on today's data so users know it's a partial count

### Add a custom date range picker
- Current `DateRangeSelect` only exposes WakaTime's fixed ranges (Today, Last 7 Days, Last 30 Days, etc.)
- No way to pick an arbitrary start/end date — users can't explore specific sprints, months, or client engagements
- Add a date range picker (e.g. `daterangepicker` or a lightweight calendar component) that maps to WakaTime's custom range API param
- The `WakaApiRange` constant enum would need a `Custom` entry and the API calls would pass `start`/`end` params instead of `range`
- This directly serves the client pitch: "show me exactly what I built during your project"

---

## Quick Wins (low effort, visible polish)

- [ ] Show a "last updated" timestamp on the dashboard so clients know data is live
- [ ] Add a public shareable link / read-only view per client (no login required)
- [ ] `HOUR_GOAL = 5` is hardcoded in constants.ts — make it configurable per profile
- [ ] The Discipline Gauge is a great idea — make the goal editable in the account page
- [ ] Standardize "No Data" empty state component and use it across all charts
