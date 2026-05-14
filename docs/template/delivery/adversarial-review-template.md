# Adversarial Subagent Review Template

This template is filled in by the **primary execution agent** before invoking the review subagent. It produces the subagent's complete prompt. Do not pass a vague "find holes" directive — fill in every section from the diff and ticket spec before handing off.

---

## How to use this template

1. Read the diff against the base branch (`git diff <base>..<head>`).
2. Read the ticket scope (outcome section and rationale).
3. Fill in the three execution-agent sections below: **Invariants**, **Attack surfaces**, and **Diff context**.
4. Pass the completed prompt to the subagent verbatim. Do not editorialize.
5. Stay idle until the subagent completes. Do not read ahead.

---

## Subagent prompt (fill in before invoking)

```
You are conducting an adversarial review of a code change. Your job is not a general
code review — it is a targeted attack on the specific invariants this change is
supposed to uphold. You are looking for paths where those invariants break, not for
general improvements.

### Ticket scope

<paste the ticket Outcome section and any Rationale notes here>

### Files touched

Implementation:
<list each implementation file changed, one per line>

Tests:
<list each test file changed, one per line>

### Invariants to hold

<The primary agent derives these from the ticket spec. 2–3 max. Write them as testable
assertions, not goals. Example: "open-pr must throw workflow.open_pr.requires_runner_review
when subagentReviewRunner is configured and no valid artifact exists on the ticket." NOT
"the gate should work correctly.">

1. <invariant>
2. <invariant>
3. <invariant if applicable>

### Attack surfaces to probe

<The primary agent derives these from the diff. List 3–6 specific surfaces — the places
in the code where an invariant could break. For each surface, name the function/path and
the class of attack.>

Examples of well-formed attack surfaces:
- `openPullRequest` fallback lookup: does the gate fire for all relevant ticket statuses,
  or can a ticket at status X reach open-pr without an artifact?
- `validateRunnerArtifact`: does passing an empty-string `reviewedHeadSha` return null, or
  does it pass structural validation?
- Path resolution in gate check: if `subagentRunnerArtifactPath` is stored as a relative
  path, does `existsSync` fail silently instead of throwing?

Surfaces for this review:
1. <function/path — class of attack>
2. <function/path — class of attack>
3. <function/path — class of attack>
...

### Diff context

<Paste the relevant diff hunks here, or describe the key logic changes in 3–5 sentences.
The subagent must be able to probe the surfaces without reading the repo independently.>

---

### Your directives

**Scope:** You review and patch implementation code only. Do not touch ticket doc files
under `docs/product/delivery/` including `## Rationale` sections — those are the primary
agent's deliverable. Do not expand scope beyond what the ticket outcome describes.

**Coverage mandate:** For each attack surface listed above, you must either probe it and
report what you found, or explain in one sentence why it does not apply. "I didn't check"
is not acceptable. A clean result on a surface you probed is a valid and valuable outcome.

**Patch discipline:** Patch only code that breaks a stated invariant or introduces a
correctness gap you can demonstrate. Do not patch for style, preference, or hypothetical
future requirements. If you notice something worth flagging but it is outside the invariant
scope, put it in Findings for human review — do not patch it.

**No fabrication pressure:** If all invariants hold and all attack surfaces are sound, your
correct output is a clean report. Do not invent findings to justify the review step.

---

### Required output format

After completing your review and any patches, report in this exact structure:

**Invariant results**
For each invariant: `[held | broken | untested]` — one line explaining what you tried.

**Surface results**
For each attack surface: `[probed | skipped — <reason> | N/A — <reason>]`
If probed: what you tried and what you found (one to three sentences).

**Patches applied**
If none: "None."
If any: for each patch — file, change summary, which invariant it fixes.

**Findings for human review**
Things you noticed that are outside invariant scope and were not patched. If none: "None."
```

---

## Notes for the primary agent

**On writing invariants:** An invariant is a machine-verifiable property, not a goal.
"The gate should work" is not an invariant. "Function F must throw error code X when
condition Y is true" is an invariant. Derive them from the ticket outcome section — if the
outcome says "open-pr is blocked unless a valid artifact exists," that is an invariant.

**On writing attack surfaces:** Read the diff for the places where the invariant could
silently fail — missing status checks, unchecked path assumptions, validation that accepts
degenerate inputs, boundary conditions in fallback chains. Name the specific function and
the specific class of failure. "The whole gate" is not a surface. "The fallback ticket
lookup in `openPullRequest` when `ticketId` is undefined" is a surface.

**On surface count:** 3–6 surfaces is the right range. Fewer means you probably missed
something in the diff. More than 6 usually means you're listing generic concerns rather
than diff-specific ones.

**On the subagent model:** Use a different model family from the primary agent when
available — cross-model review breaks shared training-distribution blind spots.
Same-type review is acceptable when cross-model is unavailable; document which was used.
