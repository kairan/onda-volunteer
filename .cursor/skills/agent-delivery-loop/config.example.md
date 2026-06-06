# agent-delivery-loop — config

Copy the YAML block below into a per-repo config the skill reads (e.g. keep it here as
`config.example.md` for reference, or commit a project copy). All names, paths, and routed
skills live **here**, not in the skill body, so the loop is portable across repos.

The values below are filled in for **Onda Volunteer** — they are immediately usable on this
repo and serve as the worked example for porting elsewhere.

```yaml
# --- Ready queue (where work comes from) ------------------------------------
queue:
  source: github-issues          # where the agent-ready work lives
  label: ready-for-agent         # issues carrying this label are eligible
  repo: kairan/onda-volunteer    # owner/name for gh

# --- Review handoff ----------------------------------------------------------
review:
  label: ready-for-agent-review  # applied once CI is terminal (REVIEW state)
  skill: address-pr-comments     # routed for comments/Bugbot/CI fixes + replies + summary

# --- Conflict-only resolution ------------------------------------------------
conflict:
  skill: babysit                 # user-level Cursor skill (not in repo .cursor/skills/); routed for rebase/merge-conflict only (no thread triage)

# --- Planning (PLAN + EXECUTE states) ---------------------------------------
planning:
  skill: tlc-spec-driven         # Specify / Design / Tasks / Execute, auto-sized
  overlay: .cursor/skills/tlc-spec-driven/ONDA.md   # repo-specific brownfield mapping (optional)

# --- Paths -------------------------------------------------------------------
paths:
  issues: docs/issues            # active issue docs (numeric prefix == issue number)
  issues_done: docs/issues/done  # archive target during HOUSEKEEPING
  issues_index: docs/issues/README.md  # index/table to update on archive
  specs: .specs/features         # per-feature spec.md / design.md / tasks.md

# --- Branching ---------------------------------------------------------------
branch:
  prefix: ""                     # optional prefix, e.g. "feat/"; "" = bare issue slug
                                 # one branch per issue/slice; never reuse old branches
base:
  remote: origin
  branch: main                   # always update before branching

# --- Merge gates (ALL must pass before MERGE) -------------------------------
merge:
  method: squash                 # gh pr merge method: merge | squash | rebase
  gates:
    - ci-green                   # all checks terminal and passing
    - threads-resolved           # review threads answered/resolved
    - hitl-signoff-respected     # never fake human sign-off
    - branch-up-to-date          # rebased/merged with base
```

## Notes per repo

- **Onda CI checks** to wait on (`WAIT_CI`): `CI / build`, `CI / test`,
  `Web Playwright e2e / playwright` — see `docs/runbooks/github-branch-protection.md`.
- **Onda "done" tracking** order (`HOUSEKEEPING`): move doc to `docs/issues/done/`,
  update `docs/issues/README.md` row, then planning artifacts/state per
  `.cursor/skills/tlc-spec-driven/ONDA.md`.
- To port elsewhere: change `queue.*`, `review.*`, `conflict.skill`, `planning.skill`,
  `paths.*`, `branch.*`, `base.*`, and `merge.*`. The state machine in `SKILL.md` stays the same.
