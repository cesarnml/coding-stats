# P6.06 Navbar cluster

Size: 2 points
Type: refactor
Scope: navbar
Red: skip

## Outcome

- These 7 files use runes only: `Navbar/{Navbar,NavDropdown,NavEnd,NavLink,NavLinks,NavLogo,NavMenu}.svelte`.
- `export let` → `$props()`; `$:` → `$derived`/`$effect`; `NavLogo`'s `<slot>` → snippet (consumer ripple owned here).
- `$dropdown`/`$loading`/`$navigating` store auto-subscription is **kept as-is** (valid in runes mode — intentional per the stores-stay deferral).
- Each file carries `<svelte:options runes={true}>`.
- `grep` for legacy idioms in these files returns zero.

## Red

- `Red: skip` — behavior-preserving. Existing `Navbar.spec.ts` plus smoke e2e are the guard.

## Green

- Convert each Navbar file mechanically; leave `$store` references untouched.
- Convert `NavLogo` slot → snippet and update its consumer call-site.
- Add `<svelte:options runes={true}>` to each.

## Refactor

- No structural change. Snippet param shape for `NavLogo` mirrors its previous slot exactly.
- Leave store subscriptions and dropdown toggle logic untouched.

## Review Focus

- `$dropdown`/`$loading`/`$navigating` NOT converted to `$state` — confirm they remain store subscriptions (regressing this breaks the stores-stay deferral).
- Dropdown open/close toggling and `class:dropdownVisible={$dropdown}` reactivity unchanged.
- Smoke: mobile nav dropdown opens/closes; loading/navigating indicator still reacts.

## Rationale

> Append here (do not edit above) when behavior or trade-offs change during implementation.

Red first: n/a (`Red: skip`).
Why this path: Navbar is a self-contained cluster and the primary consumer of the kept `writable` stores; isolating it makes the "store auto-sub stays" intent reviewable in one diff.
Alternative considered: converting `$dropdown`/`$loading` to `$state` runes — rejected per product-plan stores-stay deferral.
Deferred: routes and remaining leaves (T07).
Contract note: —
