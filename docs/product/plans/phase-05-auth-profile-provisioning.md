# Phase 05: Auth Profile Provisioning

**Delivery status:** Product plan approved. Delivery decomposition: `docs/product/delivery/phase-05/implementation-plan.md`.

## TL;DR

**Goal:** Every successful GitHub sign-in (production and local Docker Supabase) automatically creates a matching `public.profiles` row so the app can load without PostgREST profile errors.

**Ships:**

- Database trigger on `auth.users` insert that calls the existing `handle_new_user()` function
- Versioned Supabase migration committed to the repo and applied to hosted production
- Local `supabase start` / reset path picks up the same trigger (no manual dashboard-only wiring)
- Documented developer checklist for GitHub OAuth on both hosted and local Supabase (provider enabled + callback URLs)

**Defers:**

- Backfill script or migration for existing auth users (owner will insert their own row manually)
- RLS hardening on `profiles`
- App-layer profile upsert fallback in SvelteKit
- GitHub metadata field mapping improvements (e.g. `name` vs `full_name`) unless signup leaves unusable nulls

---

Production GitHub auth was re-enabled, but first-time sign-in still leaves `public.profiles` empty. The app assumes a profile exists on every authenticated session (`+layout.ts` uses `.single()`). Users see a working session cookie and a broken dashboard (`PGRST116` / HTTP 406). The repo already defines `public.handle_new_user()` but never attaches it to `auth.users` — so neither hosted Supabase nor the Docker local stack provisions profiles on signup.

## Phase Goal

This phase should leave the product in a state where:

- A **new** GitHub signup on production creates exactly one `profiles` row with `id` matching `auth.users.id` before the client finishes the login redirect
- The same flow works against **local Supabase** (`supabase start`, auth on `http://localhost:54321`, app on `http://localhost:5173`) using the **CodingStatsDev** GitHub OAuth app
- Signing in no longer produces repeated failed `GET /rest/v1/profiles?...&id=eq.<user>` requests with “0 rows” / “Cannot coerce to a single JSON object”
- Operators have a short, repo-local note for which GitHub OAuth app and callback URLs belong to prod vs local (so “Invalid Redirect URI” is diagnosable without spelunking chat history)

## Committed Scope

### Database provisioning

- Add the standard Supabase `on_auth_user_created` trigger: `AFTER INSERT ON auth.users` → `public.handle_new_user()`
- Ship it as a **new migration** under `supabase/migrations/` (do not rely on editing the 2023 squash migration alone)
- Keep the existing `handle_new_user()` insert shape unless decomposition proves it cannot insert (function already exists in schema/migrations)
- Apply the migration to **hosted production** Supabase for project `rzrykoldaspzesdlfkgy`

### Local Docker / Supabase CLI parity

- Ensure `pnpm dev:fresh`, `pnpm dev:resume`, and `sb:reset` paths that rebuild from repo migrations include the trigger (no one-off SQL only in the dashboard)
- Verify end-to-end: local GitHub OAuth → session → `profiles` row exists → dashboard load succeeds

### Operator documentation (minimal)

- Add or update the smallest existing dev doc (README Development section or `docs/` note) covering:
  - Production: **CodingStats** OAuth app → `https://<project-ref>.supabase.co/auth/v1/callback`
  - Local: **CodingStatsDev** OAuth app → `http://localhost:54321/auth/v1/callback`
  - Supabase Auth → GitHub provider enabled with matching client ID/secret per environment
  - Supabase **Redirect URLs** allow `http://localhost:5173/login-redirect` and production `*/login-redirect` origins used by the app

### Production cutover for the sole existing user

- Document a one-line manual `INSERT` (or Table Editor row) for the owner's existing `auth.users` id — **not** automated in this phase

## Explicit Deferrals

- **Backfill migration** for all historical `auth.users` — only one real user today; owner handles their row manually
- **RLS policies** on `profiles` — table is currently unrestricted; tightening belongs to a security-focused phase
- **Application-level profile creation** (e.g. upsert in `login-redirect`) — database trigger is the single source of truth; avoids race/double-write
- **Hostname / branding cleanup** (`codingstats.vercel.app` vs `coding-stats.vercel.app`, `http` vs `https` on GitHub app homepage) — fix only if decomposition shows it blocks OAuth; otherwise separate hygiene
- **Seeding fake auth users in `seed.sql`** — seed data is analytics tables, not auth provisioning

## Exit Condition

A developer can demonstrate both environments:

1. **Production:** Delete test user (or use a fresh GitHub account) → Sign in with GitHub on `codingstats.vercel.app` → `profiles` contains new row → dashboard loads without profile 406.
2. **Local:** `supabase start` + configured CodingStatsDev → Sign in at `localhost:5173/login` → same outcome against local DB.

The repo contains a migration with the trigger; hosted project has it applied. README (or equivalent) lists prod vs local OAuth callback URLs. Owner's pre-existing account has a manual profile row if still needed.

## Dependencies

- **Phase 01** (server-validated auth) — already shipped; this phase assumes sessions are trustworthy
- **Supabase dashboard access** — GitHub provider credentials for prod; separate credentials for local `config.toml` / Studio
- **GitHub OAuth apps** — CodingStats (prod), CodingStatsDev (local); must stay in sync with Supabase callback URLs

## Risks

| Risk | Mitigation (product-level) |
|------|----------------------------|
| Trigger exists in repo but not applied to hosted DB | Exit condition requires production verification, not migration commit alone |
| Local OAuth misconfigured (Invalid Redirect URI) | Documented prod vs local callback checklist in committed scope |
| `handle_new_user()` metadata keys don't match GitHub | Accept nullable name/email for v1; defer mapping fix unless insert fails |
| Owner's existing session still has no row | Explicit manual insert documented; out of scope for backfill automation |

## Retrospective

`skip` — narrow database wiring fix with no new operator workflow or architectural boundary; learnings fit in ticket Rationale if anything surprising surfaces during delivery.
