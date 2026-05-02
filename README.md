# Son of Anton

A delivery orchestrator for AI-assisted TypeScript development. Son of Anton keeps the developer in the loop at every meaningful decision point — it does not vibe-code; it develops with AI as a team member.

## Philosophy

Three developer control points per phase:

1. **Ideation** — `grill-me` stress-tests the plan before any tickets are written
2. **Slice approval** — developer reviews and approves ticket decomposition before implementation starts
3. **Final review** — developer approves merge of completed stacked PRs

Everything between those control points is owned by the orchestrator and its agent.

## What this repo provides

- **`tools/delivery/`** — the CLI orchestrator (TypeScript, runs via Bun or Node)
- **`.agents/skills/`** — the behavioral layer that wires Claude Code to the CLI
- **`docs/`** — delivery doctrine, ticket format, TDD workflow, issue sizing
- **`scripts/`** — `deliver.ts` and `closeout-stack.ts` entry points

## Quick start for a new project

### 1. Add as a git subtree

```bash
git subtree add --prefix .son-of-anton git@github.com:cesarnml/son-of-anton.git main --squash
```

### 2. Symlink the skills into your repo root

```bash
ln -s .son-of-anton/.agents .agents
```

### 3. Copy the config and scripts

```bash
cp .son-of-anton/orchestrator.config.json .
cp -r .son-of-anton/scripts ./scripts
```

### 4. Add the deliver script to your package.json

```json
{
  "scripts": {
    "deliver": "bun run ./scripts/deliver.ts",
    "closeout-stack": "bun run ./scripts/closeout-stack.ts"
  }
}
```

For pnpm/npm projects using Node runtime, update `orchestrator.config.json` accordingly.

### 5. Copy the AGENTS.md into your repo root

```bash
cp .son-of-anton/AGENTS.md .
```

Edit it to reflect your repo's specific commands (lint, format, verify, test).

### 6. Write a plan and start

```bash
bun run deliver --plan docs/02-delivery/phase-01/implementation-plan.md start
```

See `docs/00-overview/start-here.md` for the full onboarding flow.

## Ticket boundary modes

| Mode | Behavior |
|---|---|
| `cook` | Orchestrator advances immediately to the next ticket after each merge |
| `gated` | Orchestrator stops after each advance and prints a canonical resume prompt |
| `glide` | Falls back to `gated` |

Start with `gated` on a new project until you trust the agent's output.

## Skills reference

| Skill | Trigger |
|---|---|
| `son-of-anton-ethos` | "execute / implement / start / continue / deliver / resume" — drives the per-ticket loop |
| `grill-me` | Plan pressure-testing before any implementation |
| `ai-code-review` | Triage CodeRabbit, Qodo, Greptile, SonarQube review comments |
| `enter-worktree` | Bootstrap a fresh git worktree with deps and `.env` |
| `closeout-stack` | Squash-merge completed stacked PRs onto main |
| `write-retrospective` | Write phase/epic retrospective to `notes/public/` |

## Requirements

- TypeScript project (Bun or Node runtime)
- GitHub repo (uses `gh` CLI for PR operations)
- Claude Code with skills support

## Updating son-of-anton in a consuming repo

```bash
git subtree pull --prefix .son-of-anton git@github.com:cesarnml/son-of-anton.git main --squash
```
