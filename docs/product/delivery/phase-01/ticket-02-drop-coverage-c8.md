# P1.02 Remove @vitest/coverage-c8

Size: 1 point

## Outcome

- `@vitest/coverage-c8` is absent from `package.json` and `pnpm-lock.yaml`
- `@vitest/coverage-v8` (already installed at 4.0.16) is the sole coverage provider
- `vitest.config.ts` (or equivalent) references `coverage-v8`, not `coverage-c8`
- `pnpm test:unit` passes

## Red

- Confirm `pnpm test:unit` passes before removal (establishes baseline)
- Note any explicit `provider: 'c8'` config that would break after removal

## Green

- `pnpm remove @vitest/coverage-c8`
- Update any vitest config that references `c8` to reference `v8`
- Run `pnpm test:unit` to confirm green

## Refactor

- None needed

## Review Focus

- `package.json` has no `@vitest/coverage-c8` entry
- Vitest config explicitly uses `v8` provider (or omits provider, defaulting to `v8`)
- No test scripts reference `c8`

## Rationale

> Append here during implementation.

Red first:
Why this path:
Alternative considered:
Deferred:
