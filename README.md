# WakaStats

[![wakatime](https://wakatime.com/badge/github/cesarnml/waka-shortcut-time-stats.svg)](https://wakatime.com/badge/github/cesarnml/waka-shortcut-time-stats)

Personal coding dashboard built with SvelteKit. Pulls WakaTime activity data, stores it in Supabase, and visualizes it as a portfolio/client-facing tool — "Apple Health for coders." Live at [codingstats.vercel.app](https://codingstats.vercel.app).

## Coverage

[![codecov](https://codecov.io/gh/cesarnml/waka-shortcut-time-stats/branch/main/graph/badge.svg?token=wyQL5kG765)](https://codecov.io/gh/cesarnml/waka-shortcut-time-stats)
[![CodeFactor](https://www.codefactor.io/repository/github/cesarnml/waka-shortcut-time-stats/badge)](https://www.codefactor.io/repository/github/cesarnml/waka-shortcut-time-stats)

![wakastats coverage](https://codecov.io/gh/cesarnml/waka-shortcut-time-stats/branch/main/graphs/sunburst.svg?token=wyQL5kG765)

## Development

```bash
# Full local dev setup (pulls remote data, resets local DB, seeds, gen types, starts vite)
pnpm dev:fresh

# Resume dev without re-pulling remote data
pnpm dev:resume

# Type check
pnpm check

# Lint / format
pnpm lint
pnpm format

# Unit tests
pnpm test:unit

# E2E tests
pnpm test
```

### Auth (GitHub + Supabase)

Sign-in uses Supabase Auth with GitHub OAuth. New users get a `public.profiles` row automatically via the `on_auth_user_created` trigger (see `supabase/migrations/*_on_auth_user_created.sql`).

| Environment    | GitHub OAuth app | Supabase GitHub callback (set in GitHub app)                | App redirect allow-list                                                                                                                 |
| -------------- | ---------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **Production** | CodingStats      | `https://rzrykoldaspzesdlfkgy.supabase.co/auth/v1/callback` | `https://codingstats.vercel.app/login-redirect` (and `https://coding-stats.vercel.app/login-redirect` if that hostname is still in use) |
| **Local**      | CodingStatsDev   | `http://localhost:54321/auth/v1/callback`                   | `http://localhost:5173/login-redirect`                                                                                                  |

**Production setup:** Supabase dashboard → Authentication → Providers → GitHub (enabled, CodingStats client ID/secret). Authentication → URL configuration → add the production `login-redirect` URLs above.

**Local setup:** Copy `supabase/config.toml.example` to `supabase/config.toml` (gitignored). Set `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from CodingStatsDev, then `supabase start` (or `pnpm dev:fresh` / `pnpm dev:resume`).

**Apply DB migrations to hosted Supabase:** from a linked project, `supabase db push --linked` (after P5.01 migration is merged).

**Existing user without a profile row** (one-off, no backfill script):

```sql
INSERT INTO public.profiles (id, email, name)
VALUES ('<your-auth-users-uuid>', '<email>', '<display-name>');
```

Find `<your-auth-users-uuid>` in Supabase → Authentication → Users.
