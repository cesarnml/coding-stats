# Son of Anton

A delivery orchestrator for AI-assisted TypeScript development. Son of Anton keeps the developer in the loop at every meaningful decision point — it does not vibe-code; it develops with AI as a team member.

## Philosophy

Three developer control points per phase:

1. **Ideation** — `/soa plan` and `soa-grill-me` stress-test the plan before any tickets are written
2. **Slice approval** — developer reviews and approves ticket decomposition before implementation starts
3. **Final review** — developer approves merge of completed stacked PRs

Everything between those control points is owned by the orchestrator and its agent.

## What this repo provides

- **`tools/delivery/`** — the CLI orchestrator (TypeScript, runs via Bun or Node)
- **`.agents/skills/`** — the behavioral layer that wires Claude Code to the CLI
- **`docs/`** — delivery doctrine, ticket format, TDD workflow, issue sizing
- **`scripts/`** — `deliver.ts` and `closeout-stack.ts` entry points

## Quick start for a new project

### 1. Install the Claude Code skill (one-time, global)

```bash
mkdir -p ~/.claude/skills/soa
curl -fsSL https://raw.githubusercontent.com/cesarnml/son-of-anton/main/.agents/skills/soa/SKILL.md \
  -o ~/.claude/skills/soa/SKILL.md
```

This gives you `/soa install` and `/soa update` as slash commands in every repo on your machine. You only do this once.

### 2. Add to a repo

Open Claude Code in the target repo and run:

```
/soa install
```

That's it. Son-of-anton is now embedded as a git subtree at `.son-of-anton/`.

### 3. Finish setup

```bash
cp .son-of-anton/orchestrator.config.json .
cp -r .son-of-anton/scripts ./scripts
bun run sync
```

`bun run sync` runs `scripts/soa-sync.sh`, which:

- creates the `tools` symlink and wires up `.agents` (or leaves your existing `.agents` in place)
- wires Claude Code skill adapters under `.claude/skills/`
- injects Son-of-Anton's agent rules into `AGENTS.md` and `CLAUDE.md` (see [Injection behavior](#injection-behavior) below)
- runs any pending structural migrations automatically (see [Migration runner contract](#migration-runner-contract) below)

Add to `package.json`:

```json
{
  "scripts": {
    "deliver": "bun run ./scripts/deliver.ts",
    "closeout-stack": "bun run ./scripts/closeout-stack.ts",
    "sync": "bash scripts/soa-sync.sh",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint .",
    "lint:quiet": "eslint . --quiet",
    "spellcheck": "cspell --no-progress \"**/*\"",
    "spellcheck:quiet": "cspell --no-progress --no-summary \"**/*\"",
    "verify": "bun run format:check && bun run lint && bun run spellcheck",
    "verify:quiet": "prettier --check . --log-level warn && bun run lint:quiet && bun run spellcheck:quiet",
    "ci": "bun run verify && bun test",
    "ci:quiet": "bun run verify:quiet && bun test"
  }
}
```

Edit `AGENTS.md` to reflect your repo's lint, format, verify, and test commands.

### 4. Write a plan and start

```
/soa execute phase-01
```

See `docs/template/overview/start-here.md` for the full onboarding flow.

<details>
<summary>Manual install (no Claude Code)</summary>

```bash
git subtree add --prefix .son-of-anton https://github.com/cesarnml/son-of-anton.git main --squash
```

Then complete step 3 above manually.

</details>

## Ticket boundary modes

| Mode    | Behavior                                                                   |
| ------- | -------------------------------------------------------------------------- |
| `cook`  | Orchestrator advances immediately to the next ticket after each merge      |
| `gated` | Orchestrator stops after each advance and prints a canonical resume prompt |
| `glide` | Falls back to `gated`                                                      |

Start with `gated` on a new project until you trust the agent's output.

## Agent compatibility

Son of Anton is agent-agnostic. In this source repo, skills live in `.agents/skills/`. In consumer repos, `soa-sync.sh` links `.agents` only when that path is free; if the repo already owns `.agents`, Son-of-Anton skills remain under `.son-of-anton/.agents/skills/` and the Claude Code adapter points there directly.

**Claude Code adapter:** `scripts/soa-sync.sh` creates `/soa` plus `soa-`-prefixed helper symlinks from `.claude/skills/` into `.agents/skills/`, which is how Claude Code discovers repo skills. The helper prefix prevents collisions with pre-existing user skills such as `grill-me` or `pr-review`.

```
.agents/skills/grill-me          ← implementation path; SKILL name is soa-grill-me
.claude/skills/soa-grill-me      ← discoverable Claude Code helper
```

Run `bun run sync` once after install (or after `update`) to wire the Claude Code adapter. `/soa update` runs this automatically.

## Skills reference

| Skill                     | Trigger                                                                                                                                   |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `soa`                     | Main slash-command entrypoint: `/soa plan`, `/soa ideate`, `/soa decompose`, `/soa execute`, `/soa resume`, `/soa install`, `/soa update` |
| `soa-son-of-anton-ethos`  | "execute / implement / start / continue / deliver / resume" — drives the per-ticket loop                                                  |
| `soa-grill-me`            | Plan pressure-testing before any implementation                                                                                           |
| `soa-pr-review`           | Triage CodeRabbit, Qodo, Greptile, SonarQube review comments                                                                              |
| `soa-enter-worktree`      | Bootstrap a fresh git worktree with deps and `.env`; runtime-agnostic, not Bun-only                                                       |
| `soa-closeout-stack`      | Squash-merge completed stacked PRs onto main                                                                                              |
| `soa-write-retrospective` | Write phase/epic retrospective to `docs/product/retrospectives/`                                                                          |

## Requirements

- TypeScript project (Bun or Node runtime)
- GitHub repo (uses `gh` CLI for PR operations)
- Claude Code with skills support

## Updating son-of-anton in a consuming repo

```
/soa update
```

<details>
<summary>Manual</summary>

```bash
git subtree pull --prefix .son-of-anton https://github.com/cesarnml/son-of-anton.git main --squash
```

</details>

## Why `.son-of-anton/` is not gitignored

Son-of-Anton is installed as a **git subtree**, not a submodule. `git subtree add` commits the entire upstream tree directly into your repository's history — there is no `.gitmodules` file and no external reference. The files are real tracked files in your repo.

Adding `.son-of-anton/` to `.gitignore` would cause `git subtree pull` to break: git would refuse to overwrite files that it thinks you have locally modified but git cannot stage because they are ignored. Keep `.son-of-anton/` tracked and unignored.

If your linter or formatter runs over `.son-of-anton/`, add it to the tool's own ignore file instead (see [Manual lint-ignore step](#manual-lint-ignore-step) below).

## Injection behavior

`bun run sync` (i.e. `scripts/soa-sync.sh`) injects Son-of-Anton's skill-trigger rules into `AGENTS.md` and `CLAUDE.md` in your repo root. The rules teach your AI agent which skills to invoke automatically (plan, execute, triage, etc.).

**Marker convention:** The injected block is wrapped in HTML comment markers:

```
<!-- soa:start -->
...Son-of-Anton rules...
<!-- soa:end -->
```

Content outside those markers is never modified. If the markers are not present, the block is appended. If they are present, the block between them is replaced with the current content from `AGENTS.soa.md` / `CLAUDE.soa.md`. This makes injection **idempotent**: running `bun run sync` twice leaves `AGENTS.md` and `CLAUDE.md` byte-for-byte identical after the first run.

## Migration runner contract

`soa-sync.sh` maintains a version counter in `.soa-sync-version` at your repo root. When you pull a new version of Son-of-Anton and run `bun run sync`, the script compares the stored version against `SOA_TARGET_VERSION` and runs any missing numbered migration functions in order.

**When to bump the version:** Any time Son-of-Anton ships a structural change that requires moving tracked files (e.g. a directory rename), a migration is added. Consumer repos pick it up automatically on the next `bun run sync`.

**Adding a migration (source-repo contributors):**

1. Increment `SOA_TARGET_VERSION` in `scripts/soa-sync.sh`
2. Add a `run_migration_N()` function that moves files idempotently using `git mv` (guard with `[ -d ... ]` so re-runs are safe)

The runner never re-runs a migration that has already been applied; `.soa-sync-version` is the guard.

## Manual lint-ignore step

`soa-sync.sh` prints a reminder after install, but the actual ignore entries must be added manually because the correct location depends on your toolchain.

**Prettier** — add to `.prettierignore`:

```
.son-of-anton/
```

**ESLint** — add to `.eslintignore` (ESLint v8) or your flat config (ESLint v9+):

```
# .eslintignore
.son-of-anton/
```

```js
// eslint.config.mjs (flat config)
{
  ignores: ['.son-of-anton/'];
}
```

**Biome** — add to `biome.json`:

```json
{
  "files": {
    "ignore": [".son-of-anton/"]
  }
}
```
