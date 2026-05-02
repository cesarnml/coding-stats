#!/usr/bin/env bash
# Creates soa-prefixed symlinks in .claude/skills/ for each son-of-anton agent skill.
# Run from the repo root (the directory containing .son-of-anton/).
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
SKILLS_SRC="$REPO_ROOT/.son-of-anton/.agents/skills"
SKILLS_DEST="$REPO_ROOT/.claude/skills"

mkdir -p "$SKILLS_DEST"

for skill_dir in "$SKILLS_SRC"/*/; do
  name="$(basename "$skill_dir")"
  link="$SKILLS_DEST/soa-$name"
  target="../../.son-of-anton/.agents/skills/$name"
  ln -sf "$target" "$link"
  echo "  linked: .claude/skills/soa-$name"
done

echo "sync-skills: done"
