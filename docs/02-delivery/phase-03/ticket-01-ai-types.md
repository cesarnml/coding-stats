# P3.01 Add AI fields to WakaTime types

Size: 1 point

## Outcome

- `WakaDuration` in `src/types/wakatime.d.ts` includes all AI fields returned by the durations endpoint: `ai_session`, `ai_additions`, `ai_deletions`, `human_additions`, `human_deletions`, `ai_input_tokens`, `ai_output_tokens`, `ai_prompt_length_sum`, `ai_prompt_events`
- `grand_total` shape (within `SummariesResult`) includes all AI fields returned by the summaries endpoint: `ai_additions`, `ai_deletions`, `human_additions`, `human_deletions`, `ai_input_tokens`, `ai_output_tokens`, `ai_prompt_length_avg`, `ai_prompt_length_sum`, `ai_prompt_events`
- `pnpm check` passes — no TypeScript errors introduced or pre-existing errors made worse
- No behavior change — types only

## Red

TypeScript is the test harness for this ticket. The "failing test" is:

```ts
// In any consumer file, attempt to access a typed AI field:
const additions: number = summary.grand_total.ai_additions
// Before this ticket: TS error — property does not exist on type
// After this ticket: compiles cleanly
```

Run `pnpm check` before making changes and confirm the AI fields produce type errors on access. Record the baseline error count in the CI Baseline section of `implementation-plan.md`.

## Green

Add the following fields to `WakaDuration`:

```ts
ai_session: string | null
ai_additions: number
ai_deletions: number
human_additions: number
human_deletions: number
ai_input_tokens: number
ai_output_tokens: number
ai_prompt_length_sum: number
ai_prompt_events: number
```

Add the following fields to the `grand_total` shape in `SummariesResult` (locate where `grand_total` is currently typed — likely an inline type or a named `WakaGrandTotal` type):

```ts
ai_additions: number
ai_deletions: number
human_additions: number
human_deletions: number
ai_input_tokens: number
ai_output_tokens: number
ai_prompt_length_avg: number
ai_prompt_length_sum: number
ai_prompt_events: number
```

Run `pnpm check` — it must pass cleanly.

## Refactor

- If `grand_total` is typed inline inside `SummariesResult`, extract it to a named `WakaGrandTotal` type — P3.02 will import it directly and an inline type can't be imported.
- No other refactoring.

## Review Focus

- All field names match the live API response exactly (compare against the HAR/curl output recorded during grill-me: `ai_additions`, `human_additions`, not `aiAdditions` etc.)
- `ai_session` is `string | null` not `string` — the API returns `null` for non-AI sessions
- `grand_total` AI fields are all `number` — the API returns integers, not strings
- `WakaGrandTotal` is exported if extracted, so P3.02 can import it
- `pnpm check` passes with zero new errors

## Rationale

> Append here during implementation if behavior or trade-offs change.

Red first: `pnpm check` before changes — record pre-existing error count.
Why this path: type-only change; TypeScript compilation is the meaningful test; no unit test file warranted.
Alternative considered: only add `ai_additions`/`human_additions` to `grand_total` (the P3.02 minimum) — rejected because `WakaDuration` AI fields are also untyped and Tier 5 `/ai` route work will need them; doing it now costs nothing.
Deferred: surfacing token/prompt metrics in the UI — typed here, consumed in Tier 5.
