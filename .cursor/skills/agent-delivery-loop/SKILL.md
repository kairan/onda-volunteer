---
name: agent-delivery-loop
description: >-
  Orchestrate the end-to-end delivery loop for agent-ready issues: pull the
  ready queue, plan/design/execute with the planning skill, branch from main,
  open a PR, wait for CI, request review, address feedback, merge, and do
  post-merge housekeeping. Routes to child skills instead of reimplementing
  them. Use when the user says "run the delivery loop", "ready-for-agent
  pipeline", "ship ready issues", "work the agent queue", or "take this issue
  through to merge".
disable-model-invocation: true
---

# Agent delivery loop

Orchestrate one issue (or one slice) from the **ready queue** to **merged + housekept**.
This skill is a **state machine with gates** — do not skip gates, do not mix scopes.
It **routes** to child skills; it does not duplicate their bodies.

Per-repo names (labels, paths, planning skill, branch base/prefix, merge gates) live in
**[config.example.md](config.example.md)**. Read it first and load this repo's values.
Never hardcode label strings, paths, or a specific planning skill in reasoning — read them from config.

Requires **`gh`** authenticated for the repo (see `AGENTS.md` for token setup).

## State machine

Run one issue/slice at a time. Each state has an exit **gate** that must pass before advancing.

```
PREP → BRANCH → PLAN → EXECUTE → PR → WAIT_CI → REVIEW → ADDRESS → MERGE_GATE → MERGE → HOUSEKEEPING
```

### 1. PREP — update main + verify the queue
- `git fetch <base.remote> && git checkout <base.branch> && git pull <base.remote> <base.branch>`.
- Read the GH ready queue: issues with `queue.label` (`gh issue list --label "<queue.label>"`).
- **Sync check** against `paths.issues`: flag orphans (label but no local doc), stale labels (local doc in `done/` but label still set), and queue/index drift. Report mismatches to the user before proceeding.
- **Gate:** working tree clean, on updated base branch, target issue confirmed in the queue.

### 2. BRANCH — new branch from base, one scope
- `git checkout -b <branch.prefix><issue-or-slug>` from the **updated base**.
- **Never** reuse an old feature branch. **Never** mix issues/scopes in one PR.
- **Gate:** new branch created from base HEAD; one issue/slice owns this branch.

### 3. PLAN — pick the phase by artifacts that exist
- Route to `planning.skill` (this repo: see config). Pick the phase by what already exists under `paths.specs`:
  - no spec → **Specify**; spec but no design and change is structural → **Design**; design but no tasks and >5 steps → **Tasks**; artifacts sufficient → **Execute**.
- Do not re-run completed phases. Let the planning skill auto-size.
- **Gate:** the artifacts needed to execute this slice exist and are committed.

### 4. EXECUTE — build on the branch
- Route to `planning.skill` Execute. Atomic, scoped commits aligned to tasks.
- **Gate:** acceptance/Verify lines for the slice are met locally; tests/build per repo conventions pass.

### 5. PR — open against base
- Push branch; `gh pr create --base <base.branch>` with a Summary + Test plan. Reference the issue (e.g. `Closes #N`) only if config/repo convention expects it.
- **Gate:** PR open and linked to the issue.

### 6. WAIT_CI — let ALL checks finish
- `gh pr checks <n> --watch` until **every** check completes (not just the first).
- Do **not** add the review label or merge while checks are pending.
- **Gate:** all CI checks have a terminal status (pass/fail) recorded.

### 7. REVIEW — request review when checks finish
- When CI is terminal, add `review.label` (`gh issue edit`/`gh pr edit --add-label`). Swap off `queue.label` only per repo convention.
- **Gate:** `review.label` applied; PR is in the review queue.

### 8. ADDRESS — route feedback + CI fixes
- For review comments / Bugbot / failing CI within this PR's scope: route to **`review.skill`** (`address-pr-comments`). Do not reimplement triage, replies, or the summary here.
- For **conflict-only** resolution (rebase/merge base, no thread triage needed): route to **`conflict.skill`** (`babysit`).
- **Gate:** all in-scope threads answered/fixed; CI green again after pushes.

### 9. MERGE_GATE — verify before merge
- Confirm **all** of `merge.gates`: CI green, review threads resolved, HITL sign-off respected (never fake it), branch up to date with base.
- **Gate:** every merge gate satisfied; HITL items honored.

### 10. MERGE — merge per repo policy
- Merge using `merge.method` (`gh pr merge`). Respect branch protection; never bypass required checks or force-merge.
- **Gate:** PR merged; base branch updated.

### 11. HOUSEKEEPING — post-merge cleanup
- Move the issue doc from `paths.issues` to `paths.issues_done` (e.g. `done/`); update the issue index/README row.
- Remove `queue.label` and `review.label`; close the issue (`gh issue close`).
- Update planning artifacts/state per the planning skill's "done" tracking.
- **Gate:** issue closed, doc archived, labels removed, index updated.

## Routing (do not reimplement)

| Need | Route to | Config key |
|------|----------|-----------|
| Specify / Design / Tasks / Execute | planning skill | `planning.skill` |
| PR review comments, Bugbot, CI fixes + replies + summary | review skill | `review.skill` |
| Merge-conflict / rebase only (no thread triage) | conflict skill | `conflict.skill` |

## Do not

- **Do not mix scopes** — one issue/slice per branch and PR.
- **Do not edit CI workflows** just to turn a check green.
- **Do not merge before CI** is terminal and green, or before review threads resolve.
- **Do not skip the main/base update** before branching, and never reuse a stale branch.
- **Do not fake HITL sign-off** or auto-check human gates.
- **Do not duplicate** child-skill logic — route to them.

## Onda mapping

This repo's concrete values ship in [config.example.md](config.example.md):
`ready-for-agent` queue → `tlc-spec-driven` planning → branch from `main` →
PR + `gh pr checks` → `ready-for-agent-review` → `address-pr-comments` (or `babysit` for conflicts) →
merge → move doc to `docs/issues/done/`, drop labels, close issue.
See `AGENTS.md`, `.cursor/skills/tlc-spec-driven/ONDA.md`, and
`docs/runbooks/github-branch-protection.md` for the underlying conventions.
