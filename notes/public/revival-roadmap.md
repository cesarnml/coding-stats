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
- MSW v1→v2 API incompatibility — `src/mocks/handlers.ts` still uses `rest.get` from MSW v1; MSW v2 uses `http.get`. All 31 unit test files fail at setup because `setupFiles` imports the broken handler. Fix: migrate handlers to MSW v2 `http` API.

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

## Son-of-Anton: Extract to Standalone Template Repo (2026-05-01)

Son-of-Anton currently lives inside `Pirate-Claw` under `tools/delivery/`. That's the wrong home for it. It's a **standalone AI-first development framework** — not a Pirate-Claw internal tool. Both this repo and Pirate-Claw should consume it from a canonical source.

### Why a template repo

- Pirate-Claw is the product. Son-of-Anton is the methodology tooling. They should evolve on separate timelines.
- Any improvement to the orchestrator (new boundary mode, better review polling, updated ticket format) currently requires a PR into Pirate-Claw. That's wrong — it conflates product work with tooling work.
- A standalone repo can be versioned, published to npm or consumed via git submodule/subtree, and pulled into any project (including this one) as the tooling matures.
- The philosophy — "we don't vibe; we develop with AI as team" — is a positioning statement that deserves its own README, its own docs, its own release cadence.

### What belongs in the template repo

The `.agents/skills/` directory is the behavioral layer — without it, the CLI tool exists but Claude has no contract for how to use it. The skills are what wire Claude Code's skill invocation system to the `bun run deliver` CLI. They must travel with the tooling.

```
son-of-anton/
├── tools/delivery/                        ← CLI orchestrator (move from pirate-claw)
│   ├── cli-runner.ts
│   ├── ticket-flow.ts
│   ├── review.ts
│   ├── state.ts
│   └── ... (all existing modules)
├── .agents/skills/                        ← behavioral layer (THE CRITICAL PART)
│   ├── son-of-anton-ethos/SKILL.md        ← primary trigger: drives the per-ticket loop
│   ├── ai-code-review/
│   │   ├── SKILL.md                       ← detection/triage contract
│   │   └── scripts/
│   │       ├── fetch_ai_pr_comments.sh    ← gh + jq: pulls CodeRabbit/Qodo/Greptile/SonarQube
│   │       └── triage_ai_review.sh        ← classifies findings → clean|needs_patch|patched
│   ├── enter-worktree/SKILL.md            ← bootstraps fresh worktree (deps + .env copy)
│   ├── grill-me/SKILL.md                  ← stress-tests plans before any code is written
│   ├── closeout-stack/SKILL.md            ← squash-merges completed stacked PRs onto main
│   └── write-retrospective/SKILL.md       ← writes notes/public/<plan>-retrospective.md
├── docs/
│   ├── 00-overview/
│   │   ├── start-here.md
│   │   └── philosophy.md                  ← "AI as team, not vibe-coding"
│   ├── 01-delivery/
│   │   ├── delivery-orchestrator.md       ← authoritative command surface (33KB doc)
│   │   ├── son-of-anton.md               ← doctrine: why this workflow exists
│   │   ├── ticket-format.md
│   │   ├── plan-format.md
│   │   └── boundary-modes.md
│   └── 02-templates/
│       ├── implementation-plan.template.md
│       ├── ticket.template.md
│       └── orchestrator.config.template.json
├── orchestrator.config.json               ← example config
└── README.md
```

**How the skills connect to the CLI:**

`son-of-anton-ethos` is the entry-point skill (triggers on "start/implement/continue/deliver"). It:
- Reads `docs/01-delivery/delivery-orchestrator.md` in full before doing anything
- Drives the per-ticket loop: implement → verify → `bun run deliver post-verify-self-audit` → `codex-preflight` → `open-pr` → `poll-review` → patch → `record-review` → `advance`
- Invokes `ai-code-review` skill during `poll-review` which runs `fetch_ai_pr_comments.sh` + `triage_ai_review.sh`
- Invokes `codex:codex-rescue` (via Agent tool) for the preflight pass
- Invokes `write-retrospective` skill at phase completion → outputs to `notes/public/`
- `enter-worktree` runs implicitly on fresh worktree bootstrap
- `grill-me` and `closeout-stack` are discrete named steps, not part of the main loop

### Consumption model for this repo and pirate-claw

Option A — **npm package**: publish `@cesarnml/son-of-anton`, add as devDependency, wire `deliver` script to the CLI. Cleanest for versioning.

Option B — **git subtree**: `git subtree add --prefix tools/son-of-anton <repo> main --squash`. Updates pulled with `git subtree pull`. No submodule pain.

Option C — **copy-on-init**: a bootstrap script copies the template files into the consuming repo on setup. Simple but manual updates.

**Recommendation: start with Option B (subtree)** while the tooling is still maturing. Switch to npm package once the API stabilizes. This way both Pirate-Claw and coding-stats get updates from one source without submodule friction.

### Immediate action

Before onboarding son-of-anton to this repo, extract it from Pirate-Claw first:
1. Create `cesarnml/son-of-anton` repo
2. Move `tools/delivery/` → root of new repo
3. Move the template/format docs from Pirate-Claw docs into new repo
4. Add the philosophy README ("AI as team" framing)
5. Wire both Pirate-Claw and coding-stats to consume via subtree

---

## Son-of-Anton Readiness Assessment (2026-05-01)

Son-of-Anton is a ticket-scoped delivery orchestrator. It manages a lifecycle per ticket: `start → post-verify-self-audit → codex-preflight → open-pr → poll-review → advance`. Each ticket gets its own git worktree and branch. It drives Claude/Codex agents through the work, opens PRs, polls for review, and stacks the next ticket. Config lives in a `delivery.config.ts`; work is defined in a plan markdown file parsed by `parsePlan()`.

### What's already in place ✓

- **pnpm** — son-of-anton's `inferPackageManager()` picks it up natively; `run deliver` invocation works as-is
- **TypeScript** — the orchestrator expects a typed codebase; this one qualifies
- **GitHub repo** — son-of-anton uses `gh` CLI for PR creation, review polling, and thread resolution; the repo is already on GitHub
- **Test suite exists** — `pnpm test:unit` and `pnpm test` give the orchestrator's `post-verify-self-audit` step something to run against
- **`pnpm check`** — type-check command maps directly to the preflight verify step
- **Clear build command** — `pnpm build` is unambiguous
- **CLAUDE.md** — onboarding context for the AI agents is already written (added this session)
- **Revival roadmap** — the tier structure in this file maps cleanly to son-of-anton ticket definitions; each bullet is already ~1–3 hour scope

### Gaps to close before son-of-anton can run ✗

**Critical — orchestrator won't function without these:**

1. **No `.agents/skills/` directory** — this is the behavioral layer. Without it, Claude has no contract for how to drive the CLI, triage reviews, bootstrap worktrees, or write retrospectives. The six skills from pirate-claw (`son-of-anton-ethos`, `ai-code-review` + scripts, `enter-worktree`, `grill-me`, `closeout-stack`, `write-retrospective`) must be present. This is the most important missing piece — the CLI alone does nothing without the agent behavioral layer.

2. **No `deliver` script in `package.json`** — son-of-anton expects `pnpm run deliver -- <command>`. Needs to be wired to the orchestrator CLI entry point.

3. **No `orchestrator.config.json`** — `loadOrchestratorConfig(cwd)` looks for this at repo root. Needs at minimum: `packageManager: "pnpm"`, `defaultBranch: "main"`, `runtime: "node"` (this repo uses node, not bun), `ticketBoundaryMode: "gated"`, and `reviewPolicy`.

4. **No plan markdown file** — `parsePlan()` needs a structured markdown file with `## Ticket Order` and `## Ticket Files` sections in exact format. The revival roadmap is the raw material — needs conversion to ticket IDs (`CS1.01`…), individual `ticket-NN-*.md` files with Red/Green/Refactor sections, and a proper `implementation-plan.md`.

5. **No `.env.example`** — `enter-worktree` skill copies `.env` from the primary worktree. If `.env.example` is absent or incomplete, new worktrees start with missing secrets and fail silently. Audit and document all required env vars.

**Important — will cause friction:**

5. **Sentry is dead** — the `post-verify-self-audit` step relies on the agent confirming nothing regressed. Without error monitoring in production, the AI has no feedback loop beyond the test suite. Fix Sentry first (Tier 1).

6. **Broken Supabase local workflow for worktrees** — each worktree needs its own connection to the local Supabase instance. The `db:reset`/`seed` scripts assume a single working directory. Need to verify `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY` are in `.env.example` so worktree bootstrap copies them correctly.

7. **`pnpm lint` is broken** — `eslint-plugin-svelte3` is unmaintained and likely fails. Son-of-anton's preflight will surface this as a blocker on the first ticket. Drop it before starting (Tier 1, zombie deps).

8. **No `is_finalized` column yet** — the cron/ingestion tickets will need a migration. Son-of-anton handles migrations fine, but Supabase migration files need to be committed — confirm `supabase/migrations/` is the pattern being used.

### Is the artifact a good starting point for pirate-claw-style phase/epic rigor?

**Yes as raw material. No as-is.** Here's the gap:

The revival roadmap tiers are good *product thinking* — they identify what's broken, why it matters, and roughly what order to fix it. That's the "grill-me" pre-work pirate-claw requires before any code. But son-of-Anton's orchestrator can't consume this file — `parsePlan()` expects a precise markdown contract.

What needs to happen is a **conversion pass**:

| Roadmap item | Son-of-Anton artifact |
|---|---|
| Each tier → | `docs/02-delivery/phase-NN/implementation-plan.md` |
| Each bullet → | `ticket-NN-*.md` with Outcome / Red / Green / Refactor / Review Focus |
| Tier title → | Phase exit condition prose |
| "Known issues" section → | Stop conditions + explicit deferrals |

Ticket ID prefix suggestion: **`CS<phase>.<seq>`** (e.g. `CS1.01 Fix Sentry`, `CS1.02 Swap getSession to getUser`).

The tiers already map well to phases:
- `CS1` — Tier 1: Unblock Production (4 tickets, ~2pts each)
- `CS2` — Tier 2: AI Coding Story (2 tickets, 3pts each — bigger)
- `CS3` — Tier 3: Data Model Health (2 tickets)
- `CS4` — Tier 4: Simplification (1 ticket)
- `CS5` — Tier 5: UX / Empty States (4 tickets)

Quick wins fold into whichever phase they're adjacent to — they're not a phase of their own.

### Recommended onboarding sequence

```
0. Extract son-of-anton → standalone template repo (do once, upstream)
   └── copy .agents/skills/ + tools/delivery/ + doc templates to cesarnml/son-of-anton

1. Add son-of-anton to this repo via git subtree
   git subtree add --prefix .son-of-anton git@github.com:cesarnml/son-of-anton.git main --squash
   └── symlink or copy .agents/skills/ from subtree into repo root

2. Fix zombie deps (eslint-plugin-svelte3, coverage-c8, axios)   ← 30 min, manual
   └── pnpm lint must pass cleanly before codex-preflight runs

3. Audit .env and write .env.example with all keys documented     ← 15 min, manual
   └── enter-worktree skill depends on this

4. Add orchestrator.config.json + deliver script to package.json  ← 20 min, manual

5. Run grill-me on the revival roadmap                            ← refine plan before committing
   └── outputs locked decisions that become ticket files

6. Convert roadmap tiers → docs/02-delivery/phase-NN/ structure   ← 2 hours, manual
   └── implementation-plan.md + ticket-NN-*.md per tier

7. pnpm run deliver --plan docs/02-delivery/phase-01/implementation-plan.md start
   └── son-of-anton takes over from here
```

Steps 0–6 are human pre-flight. Step 7 is where the AI takes the wheel.

### Boundary mode recommendation

Start with **`gated`** — requires human approval before advancing to the next ticket. This project has been dormant 2 years; you want eyes on each PR before stacking the next one. Switch to `glide` once you trust the agent's output on this codebase.

### Estimated plan size

Tier 1 (4 tickets) + Tier 2 (2) + Tier 3 (2) + Tier 4 (1) + Tier 5 (4) + Quick Wins (5) = **~18 tickets** at ~1–3h each. Realistic full revival: 2–4 weeks of son-of-anton sessions.

---

## Quick Wins (low effort, visible polish)

- [ ] Show a "last updated" timestamp on the dashboard so clients know data is live
- [ ] Add a public shareable link / read-only view per client (no login required)
- [ ] `HOUR_GOAL = 5` is hardcoded in constants.ts — make it configurable per profile
- [ ] The Discipline Gauge is a great idea — make the goal editable in the account page
- [ ] Standardize "No Data" empty state component and use it across all charts
