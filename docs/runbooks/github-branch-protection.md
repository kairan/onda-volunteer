# GitHub branch protection for `main`

Enable required status checks **after** the new [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) has run at least once on `main` (or on a PR), so GitHub knows the check names.

## Required checks

| Check name | Workflow | Job |
|------------|----------|-----|
| `CI / build` | [ci.yml](../../.github/workflows/ci.yml) | `build` |
| `CI / test` | [ci.yml](../../.github/workflows/ci.yml) | `test` |
| `Web Playwright e2e / playwright` | [e2e-web.yml](../../.github/workflows/e2e-web.yml) | `playwright` |

## UI (recommended)

1. Repo **Settings → Branches → Branch protection rules → Add rule** (or edit `main`).
2. Branch name pattern: `main`.
3. Enable **Require status checks to pass before merging**.
4. Search and select the three checks above.
5. Save.

## CLI (after first green CI run)

From repo root, with `gh` authenticated and admin access:

```bash
gh api --method PUT repos/kairan/onda-volunteer/branches/main/protection \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": false,
    "contexts": [
      "CI / build",
      "CI / test",
      "Web Playwright e2e / playwright"
    ]
  },
  "enforce_admins": false,
  "required_pull_request_reviews": null,
  "restrictions": null
}
EOF
```

If GitHub rejects unknown contexts, merge a PR that runs the workflows first, then retry.

## Verify

```bash
gh api repos/kairan/onda-volunteer/branches/main/protection --jq '.required_status_checks.contexts'
```
