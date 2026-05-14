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

`getSession()` trusts the client-provided JWT without server-side verification, so a forged or replayed token would be accepted. `getUser()` validates the token against the Supabase auth server, closing the security gap.

**Why this path:** Kept `getSession` as the public Locals API name (backward compat with all 3 callers) and changed internals only: call `getUser()` first; return `null` on error or missing user; then call `getSession()` to return the full `Session` object. No type changes, no caller changes.

**Alternative considered:** Rename the local to `getUser` returning `User | null` — would require touching `+layout.server.ts`, `login/+page.server.ts`, `account/+page.server.ts`, and `app.d.ts`. Out of scope for a 1-point ticket.

**Deferred:** Removing the internal `getSession()` call (making `getUser()` the sole auth source) — deferred because callers depend on the `Session` type having `access_token`, `refresh_token` etc. that `User` lacks.
