# Phase 01 Retrospective — Unblock Production

## Scope delivered

Six tickets, PRs #117–#122, merged to main 2026-05-02. All shipped same-day.

- **P1.01 (#117)** — `getSession()` → `getUser()` in `hooks.server.ts`: closes server-side JWT validation gap
- **P1.02 (#118)** — Remove deprecated `@vitest/coverage-c8`; `coverage-v8` is now the sole provider
- **P1.03 (#119)** — `eslint-plugin-svelte3` → `eslint-plugin-svelte`; full ESLint 9 flat-config migration
- **P1.04 (#120)** — `axios` → native `fetch` across all 7 call sites; `axios` removed from `package.json`
- **P1.05 (#121)** — Sentry upgraded and enabled in both hooks; production errors now flowing to dashboard
- **P1.06 (#122)** — Closeout: CLAUDE.md, roadmap, and plan updated to reflect phase completion

Product contract fulfilled: Sentry receiving errors, auth server-validated, `axios` / `eslint-plugin-svelte3` / `@vitest/coverage-c8` absent from `package.json`, ESLint running on a maintained plugin.

---

## What went well

**Ticket order held.** Auth fix first (P1.01) confirmed the verify/CI baseline before any structural changes. No subsequent ticket was gated on an auth-related regression.

**Pre-phase infrastructure work removed blockers before the phase started.** MSW v1→v2 migration, pnpm v10 upgrade, and CI job disabling happened before P1.01 branched. This meant the phase itself had a clean starting point instead of hitting infrastructure surprises mid-ticket.

**Grill-me decisions locked upfront prevented mid-phase scope creep.** Every major scoping call (Sentry: upgrade-only, no Replay; axios: full removal, no shared fetch helper; ESLint: full migration, no minimal fix) was recorded in `implementation-plan.md` before work started. When P1.03 surfaced additional lint violations the decision record made it easy to confirm: document as compatibility waivers, don't tune.

**Son-of-Anton orchestration kept ticket PRs small and sequential.** Each PR touched exactly the files in scope, with rationale recorded in the ticket doc. This made the late AI review triage fast — every finding was easy to locate against a known diff.

---

## Pain points

**P1.03 scope exceeded the ticket as written — avoidable waste.** The ticket said "update `.eslintrc.cjs`." But ESLint 9 had already silently stopped loading `.eslintrc.cjs` before the phase began, so the migration had to go all the way to `eslint.config.js` flat config. This expansion was discovered at the red step, not during planning. Root cause: the pre-phase audit didn't verify `pnpm lint` actually ran end-to-end before writing the ticket. A one-line check during planning would have caught it.

**P1.04 axios → fetch ticket was silent on `response.ok`.** The refactor spec said "No error handling additions — match the existing axios error surface." This is ambiguous: `axios` throws on non-2xx; native `fetch` does not. Two bugs shipped in P1.04 as a result (`durations` route and `loading.off()` not guarded) and were caught only by the late AI review pass. The ticket should have been explicit: "fetch does not throw on HTTP errors — audit each call site and add `!response.ok` guards where the cron pipeline reads the result."

**AI review comments arrived as a second-pass surprise.** Qodo and CodeRabbit posted findings after all PRs had passed self-audit and were already "clean." This created unplanned triage and patch work (three branches, four commits) that wasn't in the phase scope. Expected cost for a phase that introduces AI reviewers mid-run, but the phase plan should budget for it explicitly going forward.

**CI remains partially disabled at phase close.** Lint job requires a Node 20 bump; Test/Coverage job requires the same; Playwright requires Vercel preview bypass. The exit condition says "CI passes" but the jobs that would catch type errors and test regressions are disabled. This is tracked as follow-up, but it means Phase 01 shipped on a weaker CI baseline than the spec implied.

---

## Surprises

**ESLint 9 had already broken the existing config before the phase touched it.** The red step of P1.03 revealed `pnpm lint` was silently failing to load `.eslintrc.cjs` — the legacy plugin was unreachable. Phase 01 fixed a pre-existing silent failure it didn't know was there. This is good, but the gap between "known issues" in CLAUDE.md and "actual state of the repo" was larger than expected after 2 years of dormancy.

**`filterSerializedResponseHeaders` + `sequence()` was a latent production correctness bug with a comment on it.** `hooks.server.ts` had an explicit comment acknowledging the incompatibility (even linked to the SvelteKit issue), yet the P1.05 implementation added `sequence(sentryHandle(), supabaseHandle)` in production without moving the filter option to the outer handle. The code documented its own bug and shipped it anyway. The AI reviewer (Qodo) caught it. Lesson: a "known issue" comment that isn't also a tracked follow-up item is a bug waiting to be inherited.

**Phase 01 completed in a single calendar day.** Given the 2-year dormancy and 6-ticket scope, same-day delivery was faster than expected. The son-of-anton orchestration pattern and pre-phase infrastructure work deserve most of the credit. No blockers required external input.

**Late AI review triage surfaced three issues that weren't in any prior review.** Beyond the `filterSerializedResponseHeaders` bug: missing `!response.ok` in the durations proxy route (cron could write error payloads to Supabase), and `loading.off()` not in a `finally` block (UI could freeze on fetch failure). Both are real reliability issues that self-review missed. The AI review pass has non-trivial signal value even when it's late.

---

## What we'd do differently

**Specify the `fetch` error contract explicitly in migration tickets.** The original choice — "match existing axios behavior" — seemed correct as a way to keep scope tight. The mistake was not checking whether axios and fetch have the same error contract, which they don't. Any future migration from a library with implicit error-throwing to one without should include a mandatory checklist item: "audit each call site for `!response.ok` guards."

**Track known code limitations as follow-up items, not just comments.** The `filterSerializedResponseHeaders` comment had been in the file long enough to be inherited by P1.05 without being questioned. The original reasoning was probably "we'll fix this when we add sequence." That's a follow-up, not a comment. Future agents should treat `// known issue` comments as signals that a follow-up ticket is missing.

**Budget a late-review triage step in the phase plan.** AI reviewers post after the fact. If they're enabled, the phase plan should include an explicit "triage AI review findings" step with estimated scope. Treating it as unexpected work makes the phase appear "done" when there are still open review items.

**Run the retrospective skill before the closeout commit.** P1.06 committed the retrospective as a zero-byte placeholder. The `soa-write-retrospective` skill wasn't invoked until after the PRs landed on main. The skill should be the prerequisite for the closeout commit, not a follow-up task.

---

## Net assessment

Phase 01 delivered on every item in the product contract: Sentry active, auth server-validated, three zombie deps removed, ESLint on a maintained plugin. The phase moved faster than expected given the dormancy gap. The main miss is that CI remains partially disabled — the "CI passes" exit condition is technically met (the enabled jobs pass) but the safety net is thinner than it should be. That's a known follow-up, not a hidden failure. Phase 01 succeeded.

---

## Follow-up

1. **Bump CI to Node 20.x** (`node-version: 20` in `.github/workflows/ci.yaml`) to re-enable Lint and Test jobs. One-line fix. Do before Phase 02 branches to restore the safety net.
2. **Validate Sentry traces are readable without sourcemaps.** Trigger a test error and confirm the stack trace is actionable. If not, the sourcemap PR becomes higher priority.
3. **Add `pnpm spellcheck` script + CI step** (`cspell.json` already exists). Qodo flagged missing spellcheck coverage on all four late-reviewed PRs (#119–#122). Low effort, eliminates a recurring AI review finding.
4. **Fix `filterSerializedResponseHeaders` audit pattern for future `sequence()` usage.** The patch shipped in `ce47738`. When `sequence()` is used in hooks going forward, verify that resolve options are applied at the outermost handle, not inside an inner handler.

---

_Created: 2026-05-02. PRs #117–#122 merged to main._
