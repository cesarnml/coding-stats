# P2.02 Config migration — CSS-first config, rename app.css

Size: 2 points

## Outcome

- `tailwind.config.ts` is deleted
- `postcss.config.js` uses `@tailwindcss/postcss` only (no `tailwindcss` or `autoprefixer` keys)
- `src/app.postcss` is renamed to `src/app.css`
- `src/app.css` contains `@import "tailwindcss"`, `@plugin "daisyui"` with theme config, `@theme {}` with custom color and aspect ratio, and the existing loader media queries
- `+layout.svelte` imports `../app.css` (not `../app.postcss`)
- `+error.svelte` `prose` class is replaced with an inline style
- `pnpm check` passes with 0 errors
- `pnpm build` completes successfully

## Red

`pnpm check` reports 0 errors after P2.01 but before this ticket's changes would show build errors from v3 config (e.g. `@tailwind base` directive unrecognized in v4). This is the failing baseline that P2.02 resolves.

## Green

**1. Update `postcss.config.js`:**
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

**2. Delete `tailwind.config.ts`.**

**3. Rename `src/app.postcss` → `src/app.css` and rewrite:**
```css
@import "tailwindcss";

@plugin "daisyui" {
  themes: synthwave, night --prefersdark;
}

@theme {
  --color-chart-dark: #0F0C28;
  --aspect-panoramic: 3/1;
}

@media (prefers-color-scheme: dark) {
  .loader {
    color: #4aa3e5 !important;
  }
}

@media (prefers-color-scheme: light) {
  .loader {
    color: #cb4aa1 !important;
  }
}

[data-theme='night'] .loader {
  color: #4aa3e5 !important;
}

[data-theme='synthwave'] .loader {
  color: #cb4aa1 !important;
}
```

**4. Update `src/routes/+layout.svelte`:**
```ts
import '../app.css'  // was: import '../app.postcss'
```

**5. Update `src/routes/+error.svelte`:**
Replace `class="prose"` with `style="font-family: monospace; white-space: pre-wrap;"` or equivalent.

## Refactor

None — scope is config migration only. Do not touch any other Svelte files.

## Review Focus

- `tailwind.config.ts` is absent from the repo
- `postcss.config.js` has exactly one plugin key: `@tailwindcss/postcss`
- `app.css` `@plugin "daisyui"` block has `synthwave` and `night --prefersdark` (sets night as dark default)
- `@theme` block has both `--color-chart-dark` and `--aspect-panoramic`
- `+error.svelte` no longer references `prose`
- `pnpm build` output is clean (no PostCSS warnings about unknown directives)

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: v3 `@tailwind base/components/utilities` directives unrecognized by v4 PostCSS plugin
Why this path: CSS-first config is the v4 canonical approach; JS config is not supported in v4
Alternative considered: keeping `tailwind.config.ts` with v4 compat shim — not supported; v4 dropped JS config entirely
Deferred: any daisyUI v5 component class renames — discovered and fixed in P2.03
Observed during implementation: Tailwind v4 also requires `@reference` in Svelte component `<style lang="postcss">` blocks that use `@apply`, so five existing components/routes needed scoped-style reference updates to make `pnpm build` pass after the CSS-first migration
Why acceptable: this is still migration fallout from removing the JS Tailwind config, not a separate feature change
Observed during implementation: daisyUI component classes used via `@apply` on the account page no longer compiled cleanly after the v5 migration, so those classes were moved inline onto the elements instead
