# Phase 05 — Auth Profile Provisioning

> Wire `on_auth_user_created` so GitHub sign-in creates a `public.profiles` row on both hosted Supabase and local Docker (`supabase start`).

## Epic

Follow-up to production auth re-enablement. Product plan: `docs/product/plans/phase-05-auth-profile-provisioning.md`.

## Product contract

When this phase is complete:

- A new GitHub signup on **production** inserts a `profiles` row before the client finishes login redirect
- The same flow works on **local Supabase** (`localhost:54321` auth, `localhost:5173` app) with the **CodingStatsDev** GitHub OAuth app
- Authenticated dashboard load no longer fails `GET /profiles?...&single()` with `PGRST116` / HTTP 406 for new users
- Repo documents prod vs local OAuth callbacks, Supabase redirect URLs, and a one-line manual insert for the sole pre-existing user (no automated backfill)

## Grill-me decisions locked

- **Trigger only** — no app-layer upsert in `login-redirect`; DB is the single provisioning path
- **New migration file** — do not edit `20230603215107_remote_commit.sql`; add `supabase/migrations/<timestamp>_on_auth_user_created.sql`
- **Keep `handle_new_user()` body** unless local/prod signup proves insert fails; GitHub metadata key mapping (`name` vs `full_name`) is a follow-up inside P5.01 Green only if null-only rows block acceptance
- **Production apply is explicit** — migration committed in repo is not sufficient; ticket exit includes `supabase db push --linked` (or equivalent) and a fresh-signup smoke check on hosted project `rzrykoldaspzesdlfkgy`
- **Local parity via migrations** — `pnpm sb:reset` / `supabase db reset` must apply the trigger; no dashboard-only SQL
- **`config.toml` stays gitignored** — ship `supabase/config.toml.example` with placeholders; scrub secrets from any committed template (do not copy `config.toml_backup` verbatim)
- **No backfill migration** — owner manual `INSERT` documented in P5.03 only

## Ticket Order

1. `P5.01 on_auth_user_created migration + schema parity + hosted apply verification`
2. `P5.02 Local Supabase auth config template`
3. `P5.03 README auth operator guide + phase exit`

## Ticket Files

- `ticket-01-auth-user-profile-trigger.md`
- `ticket-02-local-auth-config-template.md`
- `ticket-03-auth-docs-and-phase-exit.md`

## Exit Condition

1. **Production:** Fresh GitHub test user (or deleted/recreated) → sign in on `codingstats.vercel.app` → `profiles` row exists → dashboard loads without profile 406.
2. **Local:** `supabase start` with `config.toml` from example + CodingStatsDev secrets → sign in at `localhost:5173/login` → `profiles` row exists → dashboard loads.
3. README lists prod vs local OAuth apps, callback URLs, and redirect allow-list entries.
4. Migration file and `schema.sql` both define the trigger; hosted DB has migration applied.

## CI baseline

> To be recorded at P5.01 start on `main`.

## Review rules

- Tickets merge in order (P5.02 may reference P5.01 migration; P5.03 documents both).
- P5.01 is the only ticket that touches SQL migrations and `schema.sql`.
- P5.02 must not commit real GitHub client secrets.
- Each ticket PR passes CI before the next ticket starts.

## Explicit deferrals

- Backfill migration for historical `auth.users`
- RLS on `profiles`
- App-layer profile upsert fallback
- Hostname hygiene (`codingstats` vs `coding-stats` Vercel URLs) unless it blocks OAuth during verification
- Seeding auth users in `seed.sql`

## Stop conditions

- Hosted Supabase rejects trigger on `auth.users` (permissions / plan limitation) — stop and escalate; do not paper over with app upsert without product plan amendment
- Local GitHub OAuth cannot be made to work without committing secrets — stop and document required env-based config approach instead
- `handle_new_user()` insert fails on GitHub signup — fix metadata mapping in P5.01 before closing the ticket

## Phase closeout

Retrospective: `skip` (per product plan — narrow DB wiring; record surprises in ticket Rationale only).
