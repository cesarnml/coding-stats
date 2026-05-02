# WakaStats

[![wakatime](https://wakatime.com/badge/github/cesarnml/waka-shortcut-time-stats.svg)](https://wakatime.com/badge/github/cesarnml/waka-shortcut-time-stats)

Personal coding dashboard built with SvelteKit. Pulls WakaTime activity data, stores it in Supabase, and visualizes it as a portfolio/client-facing tool — "Apple Health for coders." Live at [coding-stats.vercel.app](https://coding-stats.vercel.app).

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
