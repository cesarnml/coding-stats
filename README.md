# WakaStats

[![wakatime](https://wakatime.com/badge/github/cesarnml/waka-shortcut-time-stats.svg)](https://wakatime.com/badge/github/cesarnml/waka-shortcut-time-stats)

Built with SvelteKit. Live site [here](https://coding-stats.vercel.app).

## Coverage

[![codecov](https://codecov.io/gh/cesarnml/waka-shortcut-time-stats/branch/main/graph/badge.svg?token=wyQL5kG765)](https://codecov.io/gh/cesarnml/waka-shortcut-time-stats)
[![CodeFactor](https://www.codefactor.io/repository/github/cesarnml/waka-shortcut-time-stats/badge)](https://www.codefactor.io/repository/github/cesarnml/waka-shortcut-time-stats)

![wakastats coverage](https://codecov.io/gh/cesarnml/waka-shortcut-time-stats/branch/main/graphs/sunburst.svg?token=wyQL5kG765)

## How to use Son of Anton

Son of Anton is the delivery workflow for this repo. It manages phased, ticket-by-ticket delivery with explicit developer approval gates.

### Structure

```
docs/
├── 01-product/        # Phase specs — what and why
└── 02-delivery/       # Implementation plans and tickets — how
    └── phase-XX/
        ├── implementation-plan.md
        └── ticket-NN-*.md
```

### Workflow

**0. Ideate (optional)**
Use `/soa ideate [topic]` to brainstorm before you have a defined scope. Good for new features or uncertain territory — surfaces goals, constraints, and unknowns before committing to a phase direction. Output is a draft phase summary; nothing is written until you approve it.

**1. Plan a phase**
Use `/soa plan` to run a grill-me session against a rough scope. Decisions get locked before any tickets are written.

**2. Decompose into tickets**
Use `/soa decompose docs/02-delivery/phase-XX/implementation-plan.md` to produce the ticket stack. Approve the breakdown before proceeding — this is a required control point.

**3. Commit the plan to main**
All plan and ticket docs must be committed to `main` before the orchestrator creates any branches.

```bash
git add docs/ && git commit -m "plan(phase-XX): ..."
```

**4. Execute**
```
/soa execute phase-XX
```
The orchestrator works ticket-by-ticket in order. In `gated` mode (this repo's default), it stops after each PR and prints the resume prompt.

**5. Resume after reviewing a PR**
```
/soa resume phase-XX
```

**6. Close out the phase**
```
/soa closeout phase-XX
```
Squash-merges the completed stack onto main. Requires explicit invocation — never auto-merges.

### Updating son-of-anton

```bash
/soa update
```

Pulls the latest tooling from upstream and re-syncs `soa-*` skill symlinks in `.claude/skills/`.
