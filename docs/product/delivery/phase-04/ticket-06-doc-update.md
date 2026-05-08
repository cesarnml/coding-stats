# P4.06 Doc update + retrospective

Size: 1 point

## Outcome

- `notes/public/revival-roadmap.md` updated to mark Phase 04 complete
- `notes/public/pp4-retrospective.md` written covering: what shipped, what was deferred, key decisions for future phases

## Red

None — documentation ticket.

## Green

- Update `revival-roadmap.md`: mark Phase 04 items as complete, note any scope changes from the original roadmap entry
- Write `pp4-retrospective.md` covering:
  - What shipped (Activity clamp, EmptyState rollout, AI redesign + 5 stats, data freshness signal, custom date range picker)
  - Deferred scope and why: full `{start,end}` store migration (requires `profiles.range` schema change — Tier 3), `is_finalized` ingestion contract, auth removal
  - Key decision for Tier 3: the correct `{start,end}` refactor requires migrating `profiles.range` column and special-casing Today/Yesterday server-side; do not attempt it without the schema migration
  - Any surprises or scope adjustments during delivery

## Refactor

None.

## Review Focus

- Retrospective captures the `{start,end}` store deferral rationale clearly enough that a future developer (or agent) can pick it up without re-litigating the decision
- Roadmap accurately reflects the shipped vs deferred state

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: N/A
Why this path: retro is required for this phase — introduces a durable custom-range pattern and defers a significant store refactor whose rationale should be recorded
Alternative considered: skip — rejected per updated son-of-anton retro policy
Deferred: nothing
