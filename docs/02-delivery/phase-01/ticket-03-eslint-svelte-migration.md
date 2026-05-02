# P1.03 eslint-plugin-svelte3 → eslint-plugin-svelte full migration

Size: 2 points

## Outcome

- `eslint-plugin-svelte3` is absent from `package.json`
- `eslint-plugin-svelte` is installed and active
- `.eslintrc.cjs` is updated to use the new plugin's syntax and processors
- `pnpm lint` passes with no rule errors from the migration

## Red

- Run `pnpm lint` before changes to capture the current rule set and any existing warnings
- This establishes what "passing" looks like before the migration

## Green

- `pnpm remove eslint-plugin-svelte3`
- `pnpm add -D eslint-plugin-svelte`
- Update `.eslintrc.cjs`:
  - Replace `plugins: ['svelte3']` with `plugins: ['svelte']`
  - Replace `overrides[{ files: ['*.svelte'], processor: 'svelte3/svelte3' }]` with `eslint-plugin-svelte` recommended config pattern
  - Remove `settings['svelte3/typescript']`
  - Add `parser` for `.svelte` files: `svelte-eslint-parser`
- Run `pnpm lint` to confirm green

## Refactor

- Do not tune or add rules beyond what's needed to get lint passing
- If the new plugin surfaces existing violations, fix them only if trivial — otherwise disable and log as follow-up

## Review Focus

- `eslint-plugin-svelte3` absent from `package.json`
- `.eslintrc.cjs` uses `eslint-plugin-svelte` syntax correctly
- `pnpm lint` exits 0
- No rules silently disabled without a comment explaining why

## Rationale

> Append here during implementation.

Red first: `pnpm lint` failed before changes because ESLint 9 no longer loads `.eslintrc.cjs`; the legacy `eslint-plugin-svelte3` config was therefore unreachable.
Why this path: Migrated directly to `eslint.config.js`, replaced `eslint-plugin-svelte3` with `eslint-plugin-svelte` plus `svelte-eslint-parser`, and carried forward the repo's recommended JS/TypeScript/Svelte/Prettier layers.
Alternative considered: Updating `.eslintrc.cjs` only, but that would not satisfy ESLint 9 and would leave `pnpm lint` broken.
Expanded scope: Verification surfaced type/test cleanup that was implied by moving this ticket onto the maintained Svelte lint path, including Vitest matcher types, Testing Library query options, nullable session handling, Svelte event target typing, and generated Vite inspect output.
Deferred: The maintained Svelte/TypeScript rules surfaced remaining app debt (`no-explicit-any`, unused symbols, keyed each blocks, navigation resolve handling, reactive reassignment). Those are documented compatibility waivers in `eslint.config.js` so this ticket stays focused on restoring lint with the maintained plugin.
Verification note: `pnpm lint`, `pnpm run verify:quiet`, and `pnpm run ci:quiet` pass after the migration and cleanup.
