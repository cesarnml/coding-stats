# P4.04 Data freshness signal

Size: 1 point

## Outcome

- `src/routes/api/supabase/summaries/+server.ts` runs `SELECT MAX(date) FROM summaries` and includes `max_date: string` in the response payload alongside the existing range data
- The dashboard (`src/routes/+page.svelte`) displays "Data through [date]" using `max_date` from page load data
- The displayed date reflects global ingestion freshness — it does not change when the user switches ranges

## Red

- Write a unit test on the summaries route handler: given a mocked Supabase client that returns a known MAX(date), assert that `max_date` is present and correctly formatted in the JSON response
- Commit the failing test before modifying the route

## Green

- In `summaries/+server.ts`, add a second Supabase query: `.from('summaries').select('date').order('date', { ascending: false }).limit(1)` (or equivalent `MAX` RPC) — run it alongside the existing range query
- Add `max_date` to the response object; format as `YYYY-MM-DD` (consistent with existing `DateFormat.Query`)
- In `+page.svelte`, read `max_date` from the summaries response and render "Data through [date]" near the top of the dashboard (below the range selector, above the charts)

## Refactor

- If the Supabase client supports running both queries in a single round-trip, prefer that — but do not over-engineer; two sequential queries in the handler is acceptable

## Review Focus

- `max_date` is sourced from a global `MAX(date)` query, not from `data.at(-1)?.date` — verify the query is independent of the range filter
- If the summaries table is empty, `max_date` should be `null` and the "Data through" line should not render (guard against null in the template)
- Confirm `max_date` format matches the display format expectation (human-readable date, not ISO timestamp)

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: [what test failed first]
Why this path: adding max_date to the existing summaries route avoids a second page-load fetch; keeps data-fetching logic in one place per the established architecture pattern
Alternative considered: derive from `summaries.data.at(-1)?.date` — rejected; returns null when selected range has no data, which is exactly when the freshness signal matters most
Deferred: `last_scraped_at` column on profiles (correct monitoring signal for scraper liveness — Tier 3)
