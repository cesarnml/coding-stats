# P5.03 Auth operator guide + phase exit

Size: 1 point
Type: docs
Scope: auth
Red: skip

## Outcome

- `README.md` **Development** section includes **Auth (GitHub + Supabase)** with:
  - **Production:** CodingStats OAuth app → `https://rzrykoldaspzesdlfkgy.supabase.co/auth/v1/callback`; enable GitHub provider in Supabase dashboard; redirect allow-list includes production `*/login-redirect` origins (note current app hostnames: `codingstats.vercel.app` and `coding-stats.vercel.app` if both are in use)
  - **Local:** CodingStatsDev OAuth app → `http://localhost:54321/auth/v1/callback`; copy `supabase/config.toml.example` → `supabase/config.toml`; fill GitHub client id/secret
  - **Profile provisioning:** new signups get a `profiles` row via `on_auth_user_created` (P5.01)
  - **Existing sole user:** one-line manual `INSERT INTO public.profiles (id, email, name) VALUES ('<auth.users.id>', ...)` — no backfill script
- Product plan `docs/product/plans/phase-05-auth-profile-provisioning.md` delivery status reflects decomposition complete / phase delivered
- Phase exit checklist in ticket Rationale or PR body: prod + local signup smoke results recorded

## Red

- `Red: skip` — documentation only

## Green

- Update README as above (concise table or bullet list — no essay)
- Update product plan delivery status line
- Record manual verification outcomes for prod and local signup in **Rationale** (pass/fail, date, which GitHub account)

## Refactor

- None

## Review Focus

- No secrets in README
- Manual insert snippet uses placeholders, not real UUIDs from production
- Docs distinguish CodingStats vs CodingStatsDev apps clearly
- Links to Supabase Studio paths are optional; exact dashboard clicks may drift

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Why this path: smallest operator surface in README; defers a full `docs/` auth guide
Alternative considered: separate `docs/auth.md` — rejected for 1-point doc ticket
Deferred: RLS; backfill; hostname cleanup PR

Phase exit (2026-05-20): README auth section and product plan status updated. Hosted `supabase db push --linked` and fresh prod/local GitHub signup smoke checks are **operator-owned** — not run in this delivery session (worktree has no `supabase link`). After merge: push migration, sign in once on prod and local to confirm `profiles` row exists.
