## Son-of-Anton Skill Triggers

Use these skills when working in a consumer repo that has installed Son-of-Anton
via `git subtree add --prefix .son-of-anton`.

- **`soa`** — canonical entrypoint: `/soa plan`, `/soa decompose`, `/soa execute`, `/soa resume`. Skill at `.son-of-anton/.agents/skills/soa/SKILL.md`.
- **`soa-son-of-anton-ethos`** — invoke automatically for any approved multi-ticket phase/epic or standalone PR delivery. Trigger keywords: execute, begin, start, deliver, implement, continue, resume, run, drive, carry, work on, or explicit mention of `son of anton`. Skill at `.son-of-anton/.agents/skills/son-of-anton-ethos/SKILL.md`.
- **`soa-pr-review`** — triage AI-generated PR review comments. Trigger: user says `triage`. Skill at `.son-of-anton/.agents/skills/pr-review/SKILL.md`.
- **`soa-grill-me`** — stress-test a plan before accepting it. Use before any plan or ticket decomposition is finalized. Skill at `.son-of-anton/.agents/skills/grill-me/SKILL.md`.
- **`soa-closeout-stack`** — squash-merge completed stacked PRs onto main after developer approval. Skill at `.son-of-anton/.agents/skills/closeout-stack/SKILL.md`.
- **`soa-enter-worktree`** — bootstrap a fresh git worktree with deps and env before starting ticket work. Skill at `.son-of-anton/.agents/skills/enter-worktree/SKILL.md`.
- **`soa-write-retrospective`** — write a phase or epic retrospective to `docs/product/retrospectives/`. Skill at `.son-of-anton/.agents/skills/write-retrospective/SKILL.md`.

## Subagent Review Rules

When invoking a review subagent during orchestrated delivery:

- **Same-type default:** when `reviewSubagentOverride` is absent in `orchestrator.config.json`, use the same agent type as the primary agent.
- **Override is canonical:** when `reviewSubagentOverride` is present, use that value exactly.
- **Adversarial prompt required:** the subagent prompt must assume the implementation has holes and find them. Do not rationalize away anything you notice — flag it and let the human decide. A checklist of "did the ticket spec land?" is not a review.
- **No rationalizing away findings:** the subagent must not suppress or downplay what it finds. Flag everything; the human decides what to act on.

## Pre-Commit Discipline

Before committing: run the repo's format and verify commands for touched files. Run a spellcheck when docs, Markdown, config examples, PR text, or user-facing copy changed.

If this repo uses Son-of-Anton's default commands: `bun run format`, `bun run verify`, `bun run verify:quiet`, `bun run ci`, `bun run ci:quiet`.
