# P2.03 Verify + visual smoke test

Size: 1 point

## Outcome

- `pnpm check` passes with 0 errors
- `pnpm lint` passes clean
- `pnpm test:unit` passes (31 files, 60 tests or better)
- `pnpm build` completes with no errors or unresolved PostCSS warnings
- Developer confirms in dev server: `synthwave` theme renders correctly, `night` theme renders correctly, theme toggle works
- Any daisyUI v5 class renames found during smoke test are fixed and committed in this ticket

## Red

Start `pnpm dev` after P2.02 is merged. Navigate to `/`, toggle between synthwave/night. A regression (wrong colors, broken layout, missing component styles) is the failing state.

## Green

Fix any class rename issues discovered during visual smoke test. Common daisyUI v4 → v5 renames to check:
- `join` → verify still works (v5 kept it)
- `loading` → verify still works
- `stats`/`stat` → verify still works
- `carousel`/`carousel-item` → verify still works

If no renames found: this ticket is just a confirmation commit updating the implementation plan exit condition.

## Refactor

None.

## Review Focus

- No regressions in component styling vs pre-migration screenshots
- `pnpm build` output size is comparable to pre-migration (within ~10%)
- No `!important` overrides introduced to paper over v5 issues
- If fixes were made: each fix is a targeted class update, not a wholesale style rewrite

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: visual regression in synthwave/night theme rendering
Why this path: separate verify ticket keeps the diff reviewable — config migration and fixes are in separate PRs
Alternative considered: folding fixes into P2.02 — rejected because fixes are unknown until visual test, making the P2.02 scope unbounded
Deferred: Playwright automated visual regression tests — out of scope for this phase
Observed during implementation: developer manually confirmed at `http://localhost:5174/` that both `synthwave` and `night` render correctly and the theme toggle works after the Tailwind v4 + daisyUI v5 migration
