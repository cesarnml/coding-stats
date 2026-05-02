# Son-of-Anton Skill

Manages the `.son-of-anton` subtree in any repo.

## Commands

- `/son-of-anton:install` — add son-of-anton to the current repo for the first time
- `/son-of-anton:update` — pull latest changes from the son-of-anton main branch

## Behavior

### install

Run:
```bash
git subtree add --prefix .son-of-anton https://github.com/cesarnml/son-of-anton.git main --squash
```

If `.son-of-anton` already exists, tell the user to use `/son-of-anton:update` instead.

### update

Run:
```bash
git subtree pull --prefix .son-of-anton https://github.com/cesarnml/son-of-anton.git main --squash
```

Report the result. If there's nothing new, say so. If there are conflicts, surface them clearly.
