# GitHub branch protection for `main`

Enable required status checks **after** the new [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) has run at least once on `main` (or on a PR), so GitHub knows the check names.

## Required checks

| Check name | Workflow | Job |
|------------|----------|-----|
| `CI / build` | [ci.yml](../../.github/workflows/ci.yml) | `build` |
| `CI / lint` | [ci.yml](../../.github/workflows/ci.yml) | `lint` |
| `CI / typecheck-api` | [ci.yml](../../.github/workflows/ci.yml) | `typecheck-api` |
| `CI / typecheck-web-legacy` | [ci.yml](../../.github/workflows/ci.yml) | `typecheck-web-legacy` |
| `CI / test` | [ci.yml](../../.github/workflows/ci.yml) | `test` |
| `CI / coverage` | [ci.yml](../../.github/workflows/ci.yml) | `coverage` |
| `Web Playwright e2e / playwright-web-legacy` | [e2e-web.yml](../../.github/workflows/e2e-web.yml) | `playwright-web-legacy` |

## UI (recommended)

Use this path when `main` **already** has branch protection (required PR reviews, push restrictions, etc.).

1. Repo **Settings → Branches → Branch protection rules → Add rule** (or edit `main`).
2. Branch name pattern: `main`.
3. Enable **Require status checks to pass before merging**.
4. Search and select the checks above (at minimum: build, lint, test, playwright; add typecheck jobs after #128; add coverage after #129).
5. Save.

## CLI (after first green CI run)

Requires `gh` authenticated with admin access.

### Warning

`PUT /branches/{branch}/protection` **replaces the entire rule**. Do not send `"required_pull_request_reviews": null` or `"restrictions": null` if you intend to keep existing review or push settings — that can clear them.

- **No existing rule on `main`:** use [Create rule](#create-rule-no-existing-protection) below.
- **Rule already exists:** use [Settings UI](#ui-recommended) or [Merge status checks](#merge-status-checks-into-existing-rule) below.

### Create rule (no existing protection)

Only when `gh api repos/kairan/onda-volunteer/branches/main/protection` returns **404**:

```bash
gh api --method PUT repos/kairan/onda-volunteer/branches/main/protection \
  --input - <<'EOF'
{
  "required_status_checks": {
    "strict": false,
    "contexts": [
      "CI / build",
      "CI / lint",
      "CI / typecheck-api",
      "CI / typecheck-web-legacy",
      "CI / test",
      "CI / coverage",
      "Web Playwright e2e / playwright-web-legacy"
    ]
  },
  "enforce_admins": false
}
EOF
```

If GitHub rejects unknown contexts, merge a PR that runs the workflows first, then retry.

### Merge status checks into existing rule

When protection already exists, read the current rule, union the CI contexts below with any existing ones, and `PUT` the merged payload (preserves review requirements and restrictions):

```bash
REPO=kairan/onda-volunteer
BRANCH=main
NEW_CHECKS='["CI / build","CI / lint","CI / typecheck-api","CI / typecheck-web-legacy","CI / test","CI / coverage","Web Playwright e2e / playwright-web-legacy"]'

gh api "repos/$REPO/branches/$BRANCH/protection" > /tmp/protection.json

jq --argjson new "$NEW_CHECKS" '
  .required_status_checks.contexts = (
    (.required_status_checks.contexts // []) + $new | unique
  )
  | {
      required_status_checks: .required_status_checks,
      enforce_admins: .enforce_admins,
      required_pull_request_reviews: .required_pull_request_reviews,
      restrictions: .restrictions,
      required_linear_history: .required_linear_history,
      allow_force_pushes: .allow_force_pushes,
      allow_deletions: .allow_deletions,
      block_creations: .block_creations,
      required_conversation_resolution: .required_conversation_resolution,
      lock_branch: .lock_branch,
      allow_fork_syncing: .allow_fork_syncing
    }
  | with_entries(select(.value != null))
' /tmp/protection.json > /tmp/protection-merged.json

gh api --method PUT "repos/$REPO/branches/$BRANCH/protection" --input /tmp/protection-merged.json
```

Requires `jq`. Omit keys that are `null` in the GET response so GitHub does not interpret them as “clear this setting.”

## Verify

```bash
gh api repos/kairan/onda-volunteer/branches/main/protection --jq '.required_status_checks.contexts'
```
