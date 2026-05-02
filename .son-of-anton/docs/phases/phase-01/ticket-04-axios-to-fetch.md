# P1.04 Replace axios with native fetch

Size: 2 points

## Outcome

- `axios` is absent from `package.json` and `pnpm-lock.yaml`
- All 7 files previously using `axios` now use native `fetch`
- Response destructuring updated: axios returns `{ data }`, fetch returns the response body directly via `.json()`
- `pnpm check` and `pnpm test:unit` pass

## Files in scope

- `src/routes/+page.svelte`
- `src/routes/api/shortcut/iterations/+server.ts`
- `src/routes/api/shortcut/iterations/[iterationId]/stories/+server.ts`
- `src/routes/api/wakatime/current/durations/+server.ts`
- `src/routes/api/wakatime/current/projects/+server.ts`
- `src/routes/api/wakatime/current/summaries/+server.ts`
- `src/routes/api/wakatime/current/all-time-since-today/+server.ts`

## Red

- Note the axios response shape used in each file (`{ data }` destructure) — these will silently break if not updated
- Confirm `pnpm check` passes before changes

## Green

- Replace each `axios.get(url)` with `fetch(url).then(r => r.json())` (or async/await equivalent)
- Update destructuring: remove `{ data }` wrapping, use the resolved value directly
- `pnpm remove axios`
- Run `pnpm check` and `pnpm test:unit`

## Refactor

- No error handling additions — match the existing axios error surface (uncaught rejections)
- No opportunistic refactors in surrounding code

## Review Focus

- `axios` absent from `package.json`
- All 7 files confirmed converted
- Response destructuring correct in each file — no silent `undefined` from missing `.data` unwrap
- `pnpm check` exits 0

## Rationale

> Append here during implementation.

Red first:
Why this path:
Alternative considered:
Deferred:
