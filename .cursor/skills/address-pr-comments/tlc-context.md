# TLC context for PR review

Load this during **step 1 (Context)** in [SKILL.md](SKILL.md). Read [ONDA.md](../tlc-spec-driven/ONDA.md) for brownfield paths and “done” tracking — do not duplicate it here.

Personal copy (all repos): `~/.cursor/skills/address-pr-comments/`.

## Resolve feature folder(s)

1. **Issue numbers** from the PR (collect all that apply):
   - `gh pr view <n> --json body,title,closingIssuesReferences`
   - Regex on body/title/commits: `#(\d+)`
   - `closingIssuesReferences` when present
   - Branch name sometimes embeds issue slug (e.g. `49-hope-…`)

2. **Map number → feature directory** (usually one folder per issue):
   ```text
   .specs/features/<issue>-<slug>/
   ```
   Example: `#58` → `.specs/features/58-web-retire-legacy-event-routes/`

   If multiple issues appear in one PR (common on Onda), load **each** matching folder.

3. **Fallback** when no `#nn` match:
   - Search PR diff + title for feature slug keywords.
   - List `.specs/features/*/tasks.md` only as last resort — prefer explicit issue IDs.

## Files to read (minimal)

Per resolved feature, read in order:

| File | Use when triaging comments |
|------|----------------------------|
| `spec.md` | Acceptance criteria, requirement IDs, in/out of scope |
| `tasks.md` | Task IDs (`T58-01`), **Verify:** lines — definition of done per slice |
| `design.md` | Only if comment touches architecture or ADR-linked behavior |
| `context.md` | Only if ambiguous product intent |

Also skim when linked in spec/tasks or PR body:

- `docs/issues/done/<#>-*.md` — shipped acceptance checklist
- `docs/adr/*.md` — when comment conflicts with a recorded decision

Do **not** load full TLC upstream references or generate `.specs/codebase/*`.

## Scope rules for review comments

When judging a comment:

| Question | Source |
|----------|--------|
| In scope for this PR? | `spec.md` + tasks tied to issues in the PR |
| Already required by a task? | Matching **Verify:** under `tasks.md` |
| New scope creep? | Not in spec/tasks — flag to user; do not implement unless asked |
| HITL / manual gate? | e.g. `hitl-signoff.md`, open `T49-06` — fix automation only; do not fake sign-off |

Prefer **satisfying an existing Verify line** over ad-hoc fixes. If a comment maps to task `T49-02`, say so in the thread reply and user summary.

## After fixes (optional, on user request)

Closing a feature is separate from addressing PR comments. Only when the user asks to mark work done:

- Update `tasks.md` checkboxes per [ONDA.md](../tlc-spec-driven/ONDA.md) “Tracking done”
- Do not check HITL tasks without human sign-off artifacts

## Example (PR #86)

Issues **#49** + **#58** → read:

- `.specs/features/49-hope-polish-and-wcag-release-gate/{spec,tasks}.md`
- `.specs/features/58-web-retire-legacy-event-routes/{spec,tasks}.md`

Playwright church-selection fix supports **T49-02 Verify** (keyboard smoke in CI), not **T49-06** (HITL).
