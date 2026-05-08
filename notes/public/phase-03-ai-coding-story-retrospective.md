# Phase 03 Retrospective — AI Coding Story

## Scope delivered

Two tickets, PRs #130 and #131, landed on `main` on 2026-05-03 via `closeout-stack`. The shipped scope was narrow and product-visible: **P3.01** typed the live WakaTime AI fields for `summaries.grand_total` and `durations`, and **P3.02** added the dashboard AI activity chart plus the AI coding activity stat panel, both sourced from existing page data with no new API route.

## What went well

**The phase used the cheapest data path that could work.** Reusing `summaries.data[N].grand_total` avoided a new Supabase read route and avoided per-day aggregation from the `durations` blob. That kept the feature in the UI layer, which meant the chart and stat panel could ship without adding persistence or API surface area.

**The type-first ticket paid off immediately in the UI ticket.** Extracting `WakaGrandTotal` and tightening the AI fields in P3.01 made the P3.02 implementation straightforward: the chart code could consume `grand_total.ai_additions` and `grand_total.human_additions` without falling back to `unknown` or ad hoc guards. The first ticket removed ambiguity instead of just moving it.

**Codex preflight caught real lifecycle bugs before merge.** The preflight patch on P3.02 was not cosmetic. It corrected ECharts lifecycle cleanup, stabilized resize handling, and added tests for delayed init and unmount cleanup. That is the kind of bug that would otherwise survive review because the happy-path UI still renders.

## Pain points

**Public docs were not a trustworthy source of truth for this phase's API contract.** The late CodeRabbit review leaned on the public WakaTime docs and concluded several AI fields were invalid. Live responses from the repo's actual WakaTime account showed the opposite. Root cause: this phase depends on account-specific payload shape that currently diverges from the public docs. Treating docs as authoritative here would have caused a regression.

**Delivery artifacts fragmented across multiple working trees.** The primary checkout only had the P3.01 handoff and stale phase state, while the authoritative `state.json` and P3.02 review artifacts lived in the P3.02 working tree. This is avoidable waste: closeout should not depend on manually reconstructing the control plane at the end of the phase.

**Tooling wrappers introduced unnecessary friction at closeout time.** `bun run closeout-stack` tripped `pnpm`'s build-approval/install path in a fresh working tree, even though the closeout script itself does not need a dependency install to merge branches. The direct `bun ./scripts/closeout-stack.ts` path worked. The wrapper is too eager for this repo shape.

## Surprises

**The live WakaTime API includes more AI fields than the docs advertise.** On 2026-05-03, the repo's real `summaries` payload included `ai_prompt_length_sum` and `ai_prompt_events`, and the real `durations` payload included `ai_session`, `ai_prompt_length_sum`, and `ai_prompt_events`. That was the decisive fact in rejecting CodeRabbit's late findings on P3.01.

**The AI chart feature needed lifecycle hardening, not visual redesign.** The biggest defect in P3.02 was not chart appearance or data shaping. It was mount/update/dispose correctness under Svelte's lifecycle. That is a good reminder that frontend chart work often fails at resource management before it fails at presentation.

**`closeout-stack` closes PRs rather than marking them merged.** After closeout, PRs #130 and #131 are `CLOSED` with their branch changes landed as squash commits on `main`. That is expected for this repo's workflow, but it matters for anyone reading GitHub state later because `mergedAt` remains null.

## What we'd do differently

**Make "verify against the live endpoint" an explicit review rule for third-party schemas with known doc drift.** The original plan assumed the grill-me capture plus docs were enough. That looked reasonable because the ticket was type-only. The new information is that public docs and account payloads can diverge materially. Future tickets that type or validate vendor payloads should require a live sample check before accepting review comments.

**Mirror delivery artifacts continuously, not only at closeout.** The original workflow relies on the current working tree as the artifact sink, which is simple while a single ticket is active. It breaks down across stacked working trees. The better design is to sync `state.json`, `reviews/`, and `handoffs/` back to the primary checkout after each ticket reaches `done`, so closeout starts from a coherent control plane.

**Prefer direct script execution for repo orchestration commands in fresh working trees.** The original choice to use `bun run <script>` is convenient when dependencies are already settled. In a fresh working tree it can route through package-manager safety checks unrelated to the task. For closeout and other GitHub-only automation, a direct runtime path is more robust.

## Net assessment

Phase 03 achieved the product contract. The dashboard now surfaces AI-vs-human coding activity using existing data already present in the app, and it did so without expanding the backend surface area. The main misses were process-level, not product-level: stale delivery artifacts across multiple working trees and the need to reject a plausible but wrong AI review based on live API evidence. The phase itself succeeded.

## Follow-up

1. Add an orchestrator safeguard that syncs `.agents/delivery/<plan-key>/state.json`, `handoffs/`, and `reviews/` back to the primary checkout whenever a ticket reaches `done`.
2. Record a small repo policy note for WakaTime work: validate schema-affecting changes against a live payload when available, not only public docs.
3. Consider switching orchestration wrappers such as `closeout-stack` from `bun run ...` to direct script execution when the command does not need dependency installation.

_Created: 2026-05-03. PRs #130 and #131 landed on `main` via closeout-stack._
