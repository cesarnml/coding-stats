# Phase Implementation Guidance

This note defines the default stance for planning and delivering a phase. Use it when creating or revising a phase plan, breaking a phase into tickets, or deciding whether a ticket is small enough to implement safely.

## The Two-Stage Planning Contract

Every phase requires **two explicit planning stages** before any code is written. These are separate artifacts with separate grill-me passes. Do not collapse them.

### Stage 1 — Product Plan (`/soa plan`)

**Purpose:** Why and what. Establishes the product rationale, committed scope, deferrals, and exit condition.

**Grill-me focus:** scope boundaries, product goals, what stays deferred, success criteria.

**Output:** `docs/01-product/phase-N-[slug].md` — written to the product plans directory and committed to `main` before Stage 2 begins.

**Template:** `.son-of-anton/docs/02-templates/product-plan.template.md`

**Gate:** Developer approves the product plan before decomposition starts.

### Stage 2 — Decomposition (`/soa decompose`)

**Purpose:** How. Breaks the approved product plan into thin, reviewable ticket slices.

**Grill-me focus:** ticket granularity, dependency order, test strategy per ticket, acceptance criteria.

**Output:** `docs/02-delivery/phase-N/implementation-plan.md` + `ticket-NN-*.md` files — committed to `main` before the orchestrator creates any branches.

**Template:** `.son-of-anton/docs/02-templates/implementation-plan.template.md`

**Gate:** Developer approves the ticket breakdown before execution starts.

### Why Two Stages

- `/soa plan` answers: is this the right thing to build?
- `/soa decompose` answers: is this the right way to slice it?

Collapsing them into one pass produces implementation plans that drift from product intent. The product plan is the contract that the implementation plan is held accountable to.

## Developer Control Points (in order)

1. **Product plan approval** — developer reviews and approves `docs/01-product/phase-N-[slug].md`
2. **Ticket approval** — developer reviews and approves the full ticket stack
3. **Slice review** — developer reviews and approves each delivered PR before it advances

Between control points 2 and 3, the agent runs autonomously through the bounded phase.

## Implementation Guidance

- build one small real behavior at a time
- keep each ticket end to end — it should touch the full vertical stack, not just a layer
- test what the user can observe through public interfaces, not internal structure
- avoid side quests; record useful refactors as follow-ups rather than widening the current ticket
- end multi-ticket product phases with a docs/phase-exit slice unless the phase is itself docs-only or there is a good reason not to

## Using `grill-me`

If a phase or ticket still feels vague, stop and pressure-test it before implementation. That is what `grill-me` is for. Run it for both Stage 1 and Stage 2 — they surface different problems.

Enforce this proportionally. The two-stage planning gate applies to new product-scope expansion. Docs-only, cleanup-only, and tooling-only changes that do not expand the product surface can skip Stage 1 and go straight to decompose.

Use Stage 1 grill-me to force clarity on:

- the real product problem being solved
- what is in scope vs. explicitly deferred
- success criteria a non-technical observer could verify

Use Stage 2 grill-me to force clarity on:

- the smallest acceptable ticket slice
- key tradeoffs and decision points
- what should stay deferred to a later ticket

## Phase Closeout Decision

Before finalizing a phase plan, decide retrospective status explicitly.

Record:

- `Retrospective: required`
- `Retrospective: skip`
- `Why:` one sentence
- `Trigger:` `product-impact`, `architecture/process impact`, `durable-learning risk`, or `none`

Default:

- engineering epics: `required`
- product phases: `skip` unless the phase materially changes operator workflow, introduces a durable product/technical boundary, generates likely follow-up learning, or meaningfully changes later phase assumptions

## Implementation Plan Contract

Every new phase plan should include `## Phase Closeout`:

- whether a retrospective is `required` or `skip`
- where the artifact goes if required (`notes/public/<phase>-retrospective.md`)
- whether the final docs/phase-exit ticket must include retrospective writing in scope
