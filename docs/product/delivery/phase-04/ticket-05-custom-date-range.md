# P4.05 Custom date range picker

Size: 3 points

## Outcome

- `WakaApiRange` in `src/lib/constants.ts` gains a `'Custom'` entry
- `src/lib/stores/customDateRange.ts` exports a writable store typed `{ start: string | null, end: string | null }` initialised to `{ start: null, end: null }`
- `DateRangeSelect.svelte` renders date picker inputs (native `<input type="date">`) when `$selectedRange === 'Custom'`; inputs bind to `customDateRange` store
- The summaries fetch in `+page.svelte` (or wherever it is triggered) passes `?start=...&end=...` query params when `$selectedRange === 'Custom'` and both dates are non-null; falls back to the existing `?range=...` param for all other values
- Profile sync in `DateRangeSelect.svelte` skips the Supabase write when `$selectedRange === 'Custom'`
- `WakaToShortcutApiRange` mapping in `constants.ts` has no entry for `'Custom'` — the custom path bypasses it entirely
- All existing named ranges behave identically to pre-phase behavior

## Red

- Unit test `customDateRange` store: assert initial state is `{ start: null, end: null }`; assert setting start/end updates the store; assert resetting to a named range does not clear the store (caller responsibility)
- Integration-style test for the summaries fetch: assert the constructed URL includes `start` and `end` params when range is `'Custom'` and both dates are set; assert it uses `range` param otherwise
- Commit failing tests before modifying any component or store

## Green

- Add `Custom: 'Custom'` to the `WakaApiRange` object in `constants.ts`
- Create `src/lib/stores/customDateRange.ts`
- Update `DateRangeSelect.svelte`: add `{#if $selectedRange === 'Custom'}` block with two `<input type="date">` elements bound to `$customDateRange.start` and `$customDateRange.end`; wrap profile sync in `if ($selectedRange !== 'Custom')`
- Update the summaries fetch call: read both stores; if `Custom` and both dates set, pass `start`/`end`; otherwise pass `range` as before

## Refactor

- The date inputs should have a `max` attribute set to today's date to prevent selecting future dates
- Clear `customDateRange` store when user switches away from `'Custom'` to a named range — prevents stale custom dates from persisting across range switches

## Review Focus

- The `'Custom'` range does not appear in `WakaToShortcutApiRange` — confirm nothing reads that mapping for custom ranges
- Profile sync: confirm a Supabase write is not triggered when `$selectedRange === 'Custom'`
- Summaries fetch: confirm that switching from `'Custom'` back to a named range immediately reverts to the `?range=...` param (no residual `start`/`end` in the URL)
- Native `<input type="date">` value format is `YYYY-MM-DD` — confirm this matches the format the summaries route expects for `start`/`end` params
- No bundle size regression from a third-party date picker library — this ticket uses native inputs only

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: [what test failed first]
Why this path: parallel `customDateRange` store minimises blast radius; existing `selectedRange` consumers (profile sync, range label display, range-to-days mapping) are untouched
Alternative considered: full `{start,end}` store migration for all ranges — deferred; requires `profiles.range` schema migration (Tier 3) and special-casing Today/Yesterday; the clean version cannot be done in this phase without touching deferred scope
Deferred: full named-range → `{start,end}` materialisation (Tier 3, alongside profile schema migration)
