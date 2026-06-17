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
- `BarChart/VerticalBarChart.svelte` uses runes only: `export let` → `$props()`, `$:` derived values → `$derived`, `afterUpdate(() => chart.setOption(option))` → `$effect(() => { chart?.setOption(option) })`.
- File carries `<svelte:options runes={true}>` so it compiles in rune mode under the default mixed compiler.
- The documented ECharts recipe (in this ticket's Rationale and the implementation plan) is validated and ready for T03/T04 to apply.
- `grep` for legacy idioms in this file returns zero.
- Chart still initializes on mount, redraws on data change, and the `chart.on('click', …)` story-branch handler still works.

**Rationale notes:**
- `afterUpdate` fired after every component update; `$effect` fires only when `option`'s reactive dependencies change. This is the intended behavior (redraw on data change) and is the single highest-risk conversion in the phase.
- The `$effect` guard `chart?.setOption` exists because `onMount` init and the effect can interleave differently than `afterUpdate` did.
- No net-new characterization tests (deferred per product plan). Manual smoke + existing tests are the guard.
- `Red: skip` — behavior-preserving conversion.

### Files touched

Implementation:
- `src/lib/components/BarChart/VerticalBarChart.svelte`

Tests:
- (none changed)

### Invariants to hold

1. The chart must redraw when `summaries` or `title` props change — specifically, `chart.setOption(option)` must be called whenever the reactive `option` value changes after initial mount.
2. No "setOption before init" runtime error must occur — `chart` must be defined before `setOption` is called, or the call is safely guarded.
3. No legacy idioms (`export let`, `$:`, `afterUpdate`) must remain in `VerticalBarChart.svelte`.

### Attack surfaces to probe

1. **`$effect` vs `onMount` ordering** — does the `$effect` run before `chart` is initialized by `onMount`, causing a silent no-op on the very first render? If the initial `onMount` call to `chart.setOption(option)` is the only initialization call and the effect never fires after that on fresh data, the chart might miss first-render data display.
2. **`$derived` chain integrity** — `option` is derived from `source` and `storyBranches`, each `$derived` from `summaries`. If any step in the chain is not truly reactive (breaks the `$derived` dependency chain), the chart won't redraw on prop change.
3. **`chart?.setOption` optional-chaining guard** — in the case where the `$effect` runs while `chart` is still undefined (pre-mount), the call is silently swallowed. Is there any scenario where a data update arrives after component destroy (chart disposed) that would cause a redundant setOption call on a disposed chart instance?
4. **Click handler and resize cleanup unchanged** — the `onMount` body was preserved verbatim; verify the click handler `chart.on('click', …)` and `return () => { chart.dispose(); window.removeEventListener(…) }` cleanup are intact and haven't been accidentally affected.

#### Diff-derived attack surfaces

1. **Output stability across schema-version drift** — does any persisted artifact, CLI stdout shape, or on-disk JSON format change in a way that breaks consumers reading prior-version output?
2. **CLI flag/arg symmetry** — for every added or changed CLI flag, is the parser, help text, validator, and downstream consumer updated together?
3. **Error-class breadth in `catch` blocks** — does each new or modified `catch` distinguish recoverable from non-recoverable errors?
4. **Defensive layering at module boundaries** — at every new cross-module call, does the callee revalidate inputs it cannot trust the caller to have normalized?
5. **Cross-file atomicity windows** — does any multi-step write leave an observable partially-committed window if interrupted?
6. **Test-contract strength** — do new tests assert the stable machine-readable contract before asserting prose, and do they cover both the omitted-hook and supplied-hook paths?
7. **Doc-vs-code drift in the ticket Rationale** — does the ticket's `## Rationale`, scope contract, or referenced docs describe behavior that does not match what the diff actually does?

### Diff context

The change converts `src/lib/components/BarChart/VerticalBarChart.svelte` from Svelte 4 legacy syntax to Svelte 5 runes:

1. Added `<svelte:options runes={true} />` at top of file.
2. Removed `afterUpdate` from the Svelte import; kept `onMount`.
3. `export let summaries: SummariesResult` + `export let title = 'Branches vs Time'` → `let { summaries, title = 'Branches vs Time' }: { summaries: SummariesResult; title?: string } = $props()`
4. Four `$:` reactive statements → `const … = $derived(…)`: `available_branches`, `storyBranches`, `source`, `option` — all chained correctly (`storyBranches` from `available_branches`, `option` from `source` and `storyBranches`).
5. `afterUpdate(() => { chart.setOption(option) })` → `$effect(() => { chart?.setOption(option) })` with optional chaining guard.
6. `onMount` body is unchanged: initializes `chart` via `echarts.init`, adds resize listener, calls `chart.setOption(option)` once, sets up click handler, returns cleanup.
7. Template unchanged.

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
diff-derived surface above. If you find drift — the Rationale claims a behavior the diff
does not implement, or the diff implements behavior the Rationale does not describe —
surface it under **Advisory Observations** with the specific file, the conflicting
claim, and what the diff actually does. The primary agent decides whether to patch docs
or code.

**Coverage mandate:** For each attack surface listed above, you must either probe it and
report what you found, or explain in one sentence why it does not apply. "I didn't check"
is not acceptable. A clean result on a surface you probed is a valid and valuable outcome.
Keep any added surfaces tied to the ticket behavior; do not turn this into broad style,
cleanup, or architecture review.

**Finding discipline:** Report a finding when one of the following holds:

1. The code breaks a stated invariant.
2. The code introduces a correctness gap you can demonstrate.
3. **Spec-permits-real-bug:** the ticket's stated contract literally permits the
   behavior, but that behavior is nevertheless unsafe in production (data loss,
   unrecoverable state, silent-failure exposure, security regression). Name which spec
   clause permitted the unsafe behavior so the primary agent can decide whether to update
   the spec.

Do not report style, preference, or hypothetical future requirements as blocking findings.
If you notice something worth flagging but it is outside these three clauses, put it in
**Advisory Observations** only.

**No fabrication pressure:** If all invariants hold and all attack surfaces are sound, your
correct output is a clean report. Do not invent findings to justify the review step.

---

### Required output format

After completing your review, report in this exact structure (prose only — no file edits).
The structure is canonical and machine-parsed by downstream tooling — see
`docs/template/delivery/subagent-review-report-template.md` for the full
rules. Two rules that catch the most common drift bugs:

- Use exactly these five top-level section headings, in this order:
  `Invariant results`, `Surface results`, `Actionable findings`,
  `Advisory Observations`, `Runner termination`.
- **Do not use `---` horizontal rules anywhere in the report.** A `---`
  inside the `Advisory Observations` body breaks the all-bullets parser
  check, causes fallback to paragraph mode, and preserves `- ` prefixes
  on every observation key — creating verbatim-match churn in the
  downstream dispositions file and forcing `---` itself to be triaged as
  a fake observation. Just omit `---`.
- **`Runner termination` must be the section heading**, not `**runnerStatus:**
  \`completed\`` or any other inline key-value variant. Write it as the bold
  span `**Runner termination**` on its own line, then `runnerStatus:` and
  `terminatedReason:` as plain-text lines below. Any other format leaves the
  termination block inside the `Advisory Observations` body.
- Inside `Advisory Observations`, write **one observation per bullet or one
  observation per paragraph**. Do NOT use a bold span (`**A1 — Title**`) on a
  line by itself before the observation body — that visually mimics a
  section heading and splits one labeled observation into two parsed
  observations.

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
Things you noticed that are outside the three finding-discipline clauses, including any
doc-vs-code drift surfaced under the diff-derived "Doc-vs-code drift in the ticket
Rationale" class. One bullet or one paragraph per observation. If none: "None."

**Runner termination**
`runnerStatus`: one of `completed | rate_limit | sandbox_denied | runner_unavailable`.
`terminatedReason`: one short sentence explaining why this status was reported.

`completed` means you finished the review per this template. The other three values are
honest failure modes — the CLI refuses to record `outcome: clean` for any non-`completed`
`terminatedReason`, so do not claim `completed` if you stopped early.
