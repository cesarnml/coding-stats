## Son-of-Anton Skill Triggers

Use these skills when working in a consumer repo that has installed Son-of-Anton
via `git subtree add --prefix .son-of-anton`.

- **`soa`** — canonical entrypoint for all SoA commands. Invoke via `Skill` tool with `skill: "soa"` and args `plan`, `decompose`, `execute`, or `resume`. Skill: `.son-of-anton/.agents/skills/soa/SKILL.md`.
- **`soa-son-of-anton-ethos`** — invoke automatically whenever the user executes, begins, starts, delivers, implements, continues, resumes, runs, drives, carries, or works on any approved multi-ticket phase/epic or standalone PR. This skill owns execution mechanics, stop conditions, polling, and review outcome recording. Skill: `.son-of-anton/.agents/skills/son-of-anton-ethos/SKILL.md`.
- **`soa-pr-review`** — invoke when the user says `triage`. Triages AI-generated PR review comments. Skill: `.son-of-anton/.agents/skills/pr-review/SKILL.md`.
- **`soa-grill-me`** — invoke before accepting any plan or ticket decomposition. Stress-tests assumptions. Skill: `.son-of-anton/.agents/skills/grill-me/SKILL.md`.
- **`soa-closeout-stack`** — squash-merges completed stacked PRs onto main. Only invoked with explicit developer approval. Skill: `.son-of-anton/.agents/skills/closeout-stack/SKILL.md`.
- **`soa-enter-worktree`** — bootstraps a fresh git worktree with deps and env before starting ticket implementation. Skill: `.son-of-anton/.agents/skills/enter-worktree/SKILL.md`.
- **`soa-write-retrospective`** — writes phase or epic retrospectives to `docs/product/retrospectives/`. Skill: `.son-of-anton/.agents/skills/write-retrospective/SKILL.md`.

## Subagent Review Rules

When invoking a review subagent during orchestrated delivery:

- **Same-type default:** when `reviewSubagentOverride` is absent in `orchestrator.config.json`, use the same agent type as the primary agent.
- **Override is canonical:** when `reviewSubagentOverride` is present, use that value exactly.
- **Adversarial prompt required:** assume the implementation has holes. Do not rationalize away anything you notice — flag it and let the human decide. A "did the spec land?" checklist is not a review.
- **No rationalizing findings:** report everything you find. The human decides what to act on.

## Pre-Commit

Before every commit: run format and verify for all touched files. Run spellcheck when docs, Markdown, config examples, PR text, or user-facing copy changed.

If this repo uses Son-of-Anton's default commands: `bun run format`, `bun run verify`, `bun run ci`.
