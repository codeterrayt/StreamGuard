**Automate Branch Sync with CI (GitHub Actions)**

Here are production-ready GitHub Actions workflows to keep branches synchronized automatically.

### 1. Keep a target branch always up-to-date with `main` (Most Common)

This workflow runs every time something is pushed to `main` and merges (or rebases) the changes into another branch (e.g. `staging`, `develop`, `production`).

Create the file: `.github/workflows/sync-branch.yml`

```yaml
name: Sync Branch

on:
  push:
    branches:
      - main                    # Source branch
  workflow_dispatch:            # Allow manual trigger

permissions:
  contents: write

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Configure Git
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Sync <target-branch> with main
        run: |
          TARGET_BRANCH="<target-branch>"   # ← change this (e.g. staging)

          git fetch origin
          git checkout $TARGET_BRANCH || git checkout -b $TARGET_BRANCH origin/main
          git merge origin/main --no-edit
          git push origin $TARGET_BRANCH
```

Replace `<target-branch>` with the real name (`staging`, `develop`, etc.).

---

### 2. Safer version using Pull Request (Recommended for protected branches)

Instead of pushing directly, it opens a PR that can be reviewed or auto-merged:

```yaml
name: Sync Branch via PR

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Create or update sync PR
        uses: pascalgn/update-branch-action@v1   # or use a simple script
        # Alternative simple approach below
```

Or a pure script version that creates a PR:

```yaml
      - name: Create Sync PR
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          TARGET="<target-branch>"
          git fetch origin
          git checkout -B sync/$TARGET origin/main
          git push -u origin sync/$TARGET --force-with-lease

          gh pr create \
            --base $TARGET \
            --head sync/$TARGET \
            --title "chore: sync $TARGET with main" \
            --body "Automated branch synchronization" \
            || gh pr edit --title "chore: sync $TARGET with main"
```

---

### 3. Auto-rebase open Pull Requests (keep PRs up-to-date)

```yaml
name: Rebase PRs

on:
  push:
    branches: [main]
  schedule:
    - cron: "0 8 * * *"   # every day at 08:00 UTC
  workflow_dispatch:

jobs:
  rebase:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Rebase all open PRs
        uses: cirrus-actions/rebase@1.8
        with:
          autosquash: true
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

### Recommended Setup for Apex Capital / Cloudflare

| Goal                              | Workflow to use                  | Notes |
|-----------------------------------|----------------------------------|-------|
| Keep `staging` = `main`           | Workflow 1 or 2                  | Best for Cloudflare preview/staging |
| Keep `production` in sync         | Workflow 2 (via PR)              | Safer, dual-control friendly |
| Keep open feature PRs up-to-date  | Workflow 3                       | Reduces merge conflicts |
| Protected branches                | Always use PR-based sync         | Required when branch protection is on |

### Required Repository Settings

1. **Settings → Actions → General**
   - Workflow permissions → **Read and write permissions**
   - Allow GitHub Actions to create and approve pull requests

2. For protected branches, prefer the **PR-based** workflow so dual-control / reviews still apply.

---

Would you like me to:

1. Generate the exact workflow file ready to commit for your repository,
2. Add dual-control / approval gates for the production sync, or
3. Create a version that also triggers Cloudflare deployments after sync?

Just tell me the source branch, target branch(es), and any protection requirements.
