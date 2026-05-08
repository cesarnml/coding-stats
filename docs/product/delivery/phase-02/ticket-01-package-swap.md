# P2.01 Package swap — Tailwind v4 + daisyUI v5

Size: 1 point

## Outcome

- `tailwindcss` is v4.x in `package.json` and `pnpm-lock.yaml`
- `@tailwindcss/postcss` is installed as a dev dependency
- `daisyui` is v5.x in `package.json`
- `autoprefixer`, `@tailwindcss/forms`, and `@tailwindcss/typography` are absent from `package.json`
- `pnpm install` completes without errors

## Red

No unit test applies — this ticket is pure package management. The failing state is `pnpm install` with the new versions completing without error and `pnpm build` failing because the config still references v3 APIs. That failure is expected and is resolved in P2.02.

## Green

```bash
pnpm remove autoprefixer @tailwindcss/forms @tailwindcss/typography
pnpm add -D tailwindcss@latest @tailwindcss/postcss daisyui@5
```

Verify `package.json` reflects the correct versions. Do not touch any config files — that is P2.02's scope.

## Refactor

None — package management only.

## Review Focus

- `package.json` has no `autoprefixer`, `@tailwindcss/forms`, `@tailwindcss/typography`
- `tailwindcss` is v4.x, `daisyui` is v5.x, `@tailwindcss/postcss` is present
- `pnpm-lock.yaml` is updated consistently
- No config files modified in this PR

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: n/a — package-only ticket
Why this path: isolating the package swap from the config rewrite makes each PR independently reviewable
Alternative considered: doing both in one PR — rejected because a combined diff is harder to bisect if something breaks
Deferred: all config changes (postcss, tailwind, app.css) — P2.02
