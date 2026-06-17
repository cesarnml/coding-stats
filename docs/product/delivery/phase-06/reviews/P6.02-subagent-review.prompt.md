You are conducting an adversarial review of a code change.
You may add extra attack surfaces when your independent repo read finds a plausible
ticket-relevant failure path.
Findings outside the three finding-discipline clauses belong in **Advisory Observations** —
anything off-scope but real is welcome there.
Your job is not a general code review — it is a targeted attack on the behavior this ticket is supposed to
protect. Start from the invariants and attack surfaces below, then independently inspect
the diff and directly related implementation code for missing ticket-relevant risks. You
are looking for paths where the ticket's intended behavior breaks, not for general
improvements.

### Ticket scope

**Outcome:**
- 9 files converted to Svelte 5 runes: `Container.svelte`, `ChartTitle.svelte`, `common/ChartContainer.svelte`, `common/BigChartContainer.svelte`, `Stats/StatPanelItem.svelte`, `PageTransition.svelte`, `assets/svg/{Moon,Sun,System}.svelte`.
- `<slot>` / named slots → snippets (`{@render children?.()}`); `export let` → `$props()`.
- Consumer call-sites that pass named slot content updated in this ticket (ripple owned here). No named slots existed — no consumer updates needed.
- Each converted file carries `<svelte:options runes={true}>`.
- `grep` for legacy idioms in these files returns zero.

**Rationale notes:**
- Default `<slot />` → `{@render children?.()}` using optional chaining to allow childless rendering.
- No named slots existed across the 9 files, so no consumer call-site ripple was needed.
- Moon/Sun/System SVGs have no reactive state — `<svelte:options runes={true}>` added only.
- `PageTransition` transitions (`fade`, `cubicInOut`) are unchanged; `duration` is a non-reactive `const`.
- `Red: skip` — behavior-preserving conversion.

### Files touched

Implementation:
- `src/lib/components/Container.svelte`
- `src/lib/components/ChartTitle.svelte`
- `src/lib/components/common/BigChartContainer.svelte`
- `src/lib/components/common/ChartContainer.svelte`
- `src/lib/components/Stats/StatPanelItem.svelte`
- `src/lib/components/PageTransition.svelte`
- `src/lib/assets/svg/Moon.svelte`
- `src/lib/assets/svg/Sun.svelte`
- `src/lib/assets/svg/System.svelte`

Tests:
- (none changed)

### Invariants to hold

1. Default-slot content passed to any of the 9 wrapper components must still render — `{@render children?.()}` must receive and render the `children` snippet from consumers.
2. `StatPanelItem` `title`, `icon`, and `label` props must remain required and accessible in the template — no prop is accidentally dropped or made optional.
3. `PageTransition` fade transitions must still fire on `pathname` key-change — the `in:fade` and `out:fade` directives and `{#key pathname}` block must be intact.

### Attack surfaces to probe

1. **`children` optional-chaining silent drop** — when `{@render children?.()}` is used, a consumer that always passes content will work, but if `children` is accidentally undefined (e.g. a misconfigured consumer), the slot silently renders nothing with no error. Probe whether any consumers of these wrappers pass no children when content is expected.
2. **StatPanelItem slot-for-value semantics** — the original `<slot />` was inside `.stat-value`, carrying the displayed stat number. Confirm the `{@render children?.()}` sits in the exact same DOM position and that `children?` optional chaining won't cause silent blank stat values in consuming callers.
3. **PageTransition transition directive survival** — the `in:fade` and `out:fade` attributes are template-side; verify they were not accidentally removed or altered during the slot→snippet conversion. Confirm the `{#key pathname}` block still wraps the transition div.
4. **SVG-only files runes mode compatibility** — `Moon/Sun/System.svelte` have no `<script>` logic. Confirm `<svelte:options runes={true}>` on a script-less Svelte file is valid and compiles without error.

#### Diff-derived attack surfaces

1. **Output stability across schema-version drift** — does any persisted artifact, CLI stdout shape, or on-disk JSON format change in a way that breaks consumers reading prior-version output?
2. **CLI flag/arg symmetry** — for every added or changed CLI flag, is the parser, help text, validator, and downstream consumer updated together?
3. **Error-class breadth in `catch` blocks** — does each new or modified `catch` distinguish recoverable from non-recoverable errors?
4. **Defensive layering at module boundaries** — at every new cross-module call, does the callee revalidate inputs it cannot trust the caller to have normalized?
5. **Cross-file atomicity windows** — does any multi-step write leave an observable partially-committed window if interrupted?
6. **Test-contract strength** — do new tests assert the stable machine-readable contract before asserting prose, and do they cover both paths?
7. **Doc-vs-code drift in the ticket Rationale** — does the ticket's `## Rationale` describe behavior that does not match what the diff actually does?

### Diff context

The change converts 9 Svelte components from legacy syntax to Svelte 5 runes:

**Wrapper-only components** (Container, ChartTitle, BigChartContainer, ChartContainer): Added `<svelte:options runes={true}>`, added `<script lang="ts">` with `import type { Snippet } from 'svelte'` and `let { children }: { children?: Snippet } = $props()`, replaced `<slot />` with `{@render children?.()}`.

**StatPanelItem**: Added `<svelte:options runes={true}>`, `export let title/icon/label` → `let { title, icon, label, children }: { ... } = $props()`, `<slot />` inside `.stat-value` → `{@render children?.()}`.

**PageTransition**: Added `<svelte:options runes={true}>`, `export let pathname: string` → `let { pathname, children }: { pathname: string; children?: Snippet } = $props()`, `<slot />` inside transition div → `{@render children?.()}`. Transitions and `{#key pathname}` block unchanged.

**Moon/Sun/System SVGs**: Added `<svelte:options runes={true}>` only. No script, no slots, no changes to SVG content.

---

### Your directives

**Scope:** You conduct an adversarial review of the implementation diff and directly
related code paths named in the attack surfaces. Do not expand scope beyond what the
ticket outcome describes.

**Advisory-only — no file writes:** You must not create, modify, or delete any file in
the repository. Your entire deliverable is findings prose in the required output format
below. The primary execution agent owns all patches.

**Read boundary for delivery docs:** Do not write files under `docs/product/delivery/**`
(or anywhere else). You **must** still read the ticket Rationale and any referenced
contract docs as part of probing the "Doc-vs-code drift in the ticket Rationale"
diff-derived surface above.

**Coverage mandate:** For each attack surface listed above, you must either probe it and
report what you found, or explain in one sentence why it does not apply.

**Finding discipline:** Report a finding when one of the following holds:
1. The code breaks a stated invariant.
2. The code introduces a correctness gap you can demonstrate.
3. **Spec-permits-real-bug:** the ticket's stated contract literally permits the behavior, but that behavior is nevertheless unsafe in production.

Do not report style, preference, or hypothetical future requirements as blocking findings.

**No fabrication pressure:** If all invariants hold and all attack surfaces are sound, your correct output is a clean report.

---

### Required output format

After completing your review, report in this exact structure (prose only — no file edits).
The structure is canonical and machine-parsed by downstream tooling.

- Use exactly these five top-level section headings, in this order: `Invariant results`, `Surface results`, `Actionable findings`, `Advisory Observations`, `Runner termination`.
- **Do not use `---` horizontal rules anywhere in the report.**
- **`Runner termination` must be the section heading**, not an inline key-value variant.
- Inside `Advisory Observations`, write **one observation per bullet or one observation per paragraph**. Do NOT use a bold span on a line by itself before the observation body.

**Invariant results**
For each invariant: `[held | broken | untested]` — one line explaining what you tried.

**Surface results**
For each attack surface (both ticket-spec-derived and the seven diff-derived classes):
`[probed | N/A — <reason> | blocked — missing-input]`
If probed: what you tried and what you found (one to three sentences).

**Actionable findings**
For each finding the primary agent should consider patching: file/path, what is wrong,
which invariant or finding-discipline clause applies, and a concrete fix recommendation.
If none: "None."

**Advisory Observations**
Things you noticed that are outside the three finding-discipline clauses. One bullet or one paragraph per observation. If none: "None."

**Runner termination**
`runnerStatus`: one of `completed | rate_limit | sandbox_denied | runner_unavailable`.
`terminatedReason`: one short sentence explaining why this status was reported.
