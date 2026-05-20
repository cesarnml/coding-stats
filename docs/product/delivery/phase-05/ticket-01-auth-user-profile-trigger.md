# P5.01 on_auth_user_created migration + schema parity

Size: 2 points
Type: fix
Scope: supabase
Red: required

## Outcome

- New migration under `supabase/migrations/` creates trigger `on_auth_user_created` on `auth.users` (`AFTER INSERT`, `FOR EACH ROW`, `EXECUTE FUNCTION public.handle_new_user()`)
- `supabase/schema.sql` includes the same trigger definition (kept in sync with migration)
- Migration applies cleanly on local Supabase (`supabase db reset` or `pnpm sb:reset` path)
- Migration applied to **hosted** project `rzrykoldaspzesdlfkgy` via `supabase db push --linked` (or documented equivalent)
- After hosted apply: a **new** GitHub signup creates a `profiles` row (verified manually or with a disposable GitHub account)

## Red

- Add `src/lib/supabase/migration-contract.spec.ts` (or colocate under `supabase/` if the repo already tests SQL contracts elsewhere — pick one path and stay consistent)
- Test reads the latest `supabase/migrations/*_on_auth_user_created.sql` (or the migration file added by this ticket) and asserts the SQL text includes all of:
  - `on_auth_user_created`
  - `auth.users`
  - `handle_new_user`
  - `AFTER INSERT`
- Run `pnpm test:unit` (or the repo's unit test command) and confirm the test fails before the migration file exists
- Commit with suffix `[red]`: `test(P5.01): require on_auth_user_created migration contract [red]`

## Green

- Add migration file, e.g. `supabase/migrations/<timestamp>_on_auth_user_created.sql`:

```sql
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- Append equivalent `CREATE TRIGGER` to `supabase/schema.sql` (after `handle_new_user` function definition)
- Run local reset: `supabase db reset` (or `pnpm sb:reset` if that is the repo's documented path) — must exit 0
- Apply to hosted: `supabase db push --linked` (document command output / confirmation in PR or ticket Rationale)
- If GitHub signup inserts a row with only null `name`/`email` but valid `id`, that is acceptable for this phase; if insert **fails**, update `handle_new_user()` to `coalesce` GitHub `name` / `full_name` fields in the same PR
- Run unit tests + `pnpm verify` (or repo equivalent)

## Refactor

- None expected — SQL-only surface

## Review Focus

- Trigger targets `auth.users`, not `public.profiles`
- No duplicate trigger name on re-apply (migration is idempotent-safe: `drop trigger if exists` only if needed for local dev reruns — prefer plain `create` in new migration per Supabase conventions)
- `schema.sql` and migration stay aligned
- Confirm production apply is evidenced (not repo-only)
- No secrets or backfill SQL in the migration

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: [what test failed first]
Why this path: [smallest migration-only fix]
Alternative considered: app upsert on login-redirect — rejected per product plan
Deferred: backfill migration; RLS on profiles
