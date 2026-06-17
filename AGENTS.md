# Repo Rules

- If the user says `triage`, use `.agents/skills/ai-code-review/SKILL.md`.
- For phase work, read `docs/00-overview/start-here.md` and `docs/01-delivery/delivery-orchestrator.md` first, then surface the orchestrator path before coding.
- Use `.agents/skills/son-of-anton-ethos/SKILL.md` automatically when executing any approved multi-ticket phase/epic or standalone (non-ticketed) PR — including when the user says execute, begin, start, deliver, implement, continue, resume, run, drive, carry, work on, or explicitly mentions `son of anton` / `son-of-anton ethos`. That skill owns execution mechanics, stop conditions, polling, and review outcome recording.
- For new product feature-set expansion, phase shaping, or epic decomposition: run a planning pass and use `grill-me` before accepting any plan. Developer approval of ticket decomposition is required before implementation.
- Prefer `bun run deliver --plan ...` over ad hoc implementation. The delivery orchestrator reads `orchestrator.config.json` at repo root; see `docs/01-delivery/delivery-orchestrator.md`. For orchestrated ticket work, the handoff under `.agents/delivery/<plan-key>/handoffs/` is required input alongside plan and ticket docs.
- `codex-preflight` requires invoking the `codex:codex-rescue` skill first. Recording `clean` without running the skill is observable in the commit trail (no `[codexPreflight]` commit) and is a policy violation. `codex-preflight clean` requires a note summarizing what Codex reviewed and concluded — no note is a policy violation visible in the PR body.
- New product phase/epic starts only after developer-approved ticket decomposition. Docs-only, cleanup-only, and tooling-only changes skip this. Smaller bounded changes may ship as standalone PRs using the orchestrator's `ai-review` path.
- Final merge of stacked PR slices requires developer approval. Close completed phases with `bun run closeout-stack --plan <plan-path>`.
- PR titles: Conventional-Commit-style subject + active ticket suffix (e.g. `[P3.02]`) when the ticket is clear from branch/docs/diff. Apply even when the user did not type `pr`.

## Pre-Commit

Before committing: run the repo's format and verify commands for touched files.

## Ticket Completion Checklist

Before closing a delivery ticket:

- Add/update `## Rationale` in the ticket doc when behavior or trade-offs changed; append later findings there — not in PR bodies or chat.
- Check `README.md` when user-visible behavior, commands, or project status changed.
- Check `docs/00-overview/start-here.md` when delivered scope, commands, status, or deferrals changed.
- Verify the relevant tests or checks for the completed work.

## On Phase or Epic Completion

Write `notes/public/<plan-path>-retrospective.md` using `.agents/skills/write-retrospective/SKILL.md` for section structure and placement conventions.

<!-- soa:start -->

## Son-of-Anton Skill Triggers

Use these skills when working in a consumer repo that has installed Son-of-Anton
via `git subtree add --prefix .son-of-anton`.

- **`soa`** — canonical entrypoint for all SoA commands. Invoke via `Skill` tool with `skill: "soa"` and args such as `plan`, `decompose`, `execute`, `resume`, `triage-ticket`, or `triage-standalone`. Skill: `.son-of-anton/.agents/skills/soa/SKILL.md`.
- **`soa-son-of-anton-ethos`** — invoke automatically whenever the user executes, begins, starts, delivers, implements, continues, resumes, runs, drives, carries, or works on any approved multi-ticket phase/epic or standalone PR. This skill owns execution mechanics, stop conditions, polling, and review outcome recording. Skill: `.son-of-anton/.agents/skills/son-of-anton-ethos/SKILL.md`.
- **`soa-pr-review`** — invoke when the user says `triage`. Triages AI-generated PR review comments. Skill: `.son-of-anton/.agents/skills/pr-review/SKILL.md`.
- **`soa-grill-me`** — invoke before accepting any plan or ticket decomposition. Stress-tests assumptions. Skill: `.son-of-anton/.agents/skills/grill-me/SKILL.md`.
- **`soa-closeout-stack`** — squash-merges completed stacked PRs onto main. Only invoked with explicit developer approval. Skill: `.son-of-anton/.agents/skills/closeout-stack/SKILL.md`.
- **`soa-enter-worktree`** — bootstraps a fresh git worktree with deps and env before starting ticket implementation. Skill: `.son-of-anton/.agents/skills/enter-worktree/SKILL.md`.
- **`soa-write-retrospective`** — writes phase or epic retrospectives to `docs/product/retrospectives/`. Skill: `.son-of-anton/.agents/skills/write-retrospective/SKILL.md`.

## Subagent Review Rules

When invoking a review subagent during orchestrated delivery:

- **Preferred-runner:** pass `--subagent <claude-cli|codex-cli|cursor-cli>` to `subagent-review`. The CLI tries the preferred runner first, then the other programmatic runners, then records an honest `skipped` if none are available. No config changes needed when switching agent platforms.
- **Adversarial prompt required:** assume the implementation has holes. Do not rationalize away anything you notice — flag it and let the human decide. A "did the spec land?" checklist is not a review.
- **No rationalizing findings:** report everything you find. The human decides what to act on.

## Pre-Commit

**Prerequisite:** Son-of-Anton requires a global `bun` install. All CLI delivery commands run via `bun run deliver …`.

Before committing: run `bun run format` **first**, then stage, then commit. Use `bun run verify` (or `bun run verify:quiet`) and `bun run ci:quiet` as the final publication gate before opening a PR.

**Orchestrator-written artifacts must be formatted before staging.** Files written by `bun run deliver` commands (review JSON, triage JSON, state files, handoffs) never pass through the editor and bypass format-on-save. Stage and commit them before running format and the next CI run will reformat them, leaving a trivially-dirty working tree. Always: format → stage → commit.

<!-- soa:end -->
