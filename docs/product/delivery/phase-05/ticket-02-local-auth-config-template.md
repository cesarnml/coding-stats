# P5.02 Local Supabase auth config template

Size: 1 point
Type: docs
Scope: supabase
Red: skip

## Outcome

- `supabase/config.toml.example` committed (safe template — **no real client secrets**)
- Template enables GitHub OAuth for local Docker Supabase:
  - `[auth]` `site_url = "http://localhost:5173"`
  - `additional_redirect_urls` includes `http://localhost:5173/login-redirect` (and any other paths the app uses)
  - `[auth.external.github]` `enabled = true` with placeholder `client_id` / `secret` (e.g. `env(GITHUB_CLIENT_ID)` or literal `YOUR_CODINGSTATSDEV_CLIENT_ID` — match Supabase CLI env substitution if already used elsewhere)
- Short comment at top of file: copy to `supabase/config.toml` (gitignored) and fill from **CodingStatsDev** GitHub OAuth app
- Documents callback URL GitHub must allow: `http://localhost:54321/auth/v1/callback`

## Red

- `Red: skip` — doc/config template only

## Green

- Add `supabase/config.toml.example` based on `supabase/config.toml_backup` structure but with secrets removed/replaced by placeholders
- Ensure `additional_redirect_urls` is not an empty string array entry that blocks redirects
- Cross-check `src/routes/login/+page.svelte` redirect target (`/login-redirect?redirect=...`) against allow-list entries
- Do **not** commit `supabase/config.toml` or real secrets

## Refactor

- None

## Review Focus

- `git grep` for client secrets / `825cced` / production CodingStats credentials — must not appear in committed files
- Redirect URLs match local ports (54321 API, 5173 Vite)
- Example file is copy-pasteable without editing more than GitHub id/secret placeholders

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Why this path: `config.toml` is gitignored; example file is the durable contract for local Docker auth
Alternative considered: documenting-only in README without example — rejected; example reduces Invalid Redirect URI debugging
Deferred: committing env-specific `config.toml`; production Supabase dashboard settings (covered in P5.03)
