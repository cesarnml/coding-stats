# P1.01 getSession → getUser

Size: 1 point

## Outcome

- `hooks.server.ts` calls `supabase.auth.getUser()` instead of `supabase.auth.getSession()`
- `event.locals.getSession` is renamed to `event.locals.getUser` (or kept as `getSession` with `getUser` internals — see Rationale)
- Auth cookie is validated server-side on every request
- CI passes

## Red

- Write a test (or note the manual verification path) that confirms the auth hook calls `getUser`, not `getSession`
- Single-user app: manual verification against local Supabase is acceptable if a unit test requires excessive mocking

## Green

- Replace `supabase.auth.getSession()` with `supabase.auth.getUser()` in `hooks.server.ts`
- Update any callers of `event.locals.getSession` if the signature changes
- Confirm profile and redirect logic still works locally

## Refactor

- No opportunistic cleanup — one-line fix only

## Review Focus

- Confirm `getUser()` is used, not `getSession()`, in the hook body
- Confirm `getProfile` and `getProjects` still resolve correctly via the updated auth call
- No other files pulled into scope

## Rationale

> Append here during implementation.

Red first:
Why this path:
Alternative considered:
Deferred:
