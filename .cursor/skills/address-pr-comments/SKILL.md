---
name: address-pr-comments
description: >-
  Triage pull request review comments with TLC feature context (spec.md,
  tasks.md Verify lines), implement fixes, push, reply on GitHub threads, and
  summarize what was addressed. Use when the user asks to address PR comments,
  respond to review feedback, answer comments on a pull request, or fix reviewer
  or Bugbot feedback.
disable-model-invocation: true
---

# Address PR comments

Get a PR merge-ready: feedback understood against TLC scope, valid items fixed, GitHub threads answered, CI green, user gets a concise summary.

Requires **`gh`** authenticated for the repo (`GH_TOKEN` / `GITHUB_TOKEN` in cloud agents per `AGENTS.md`).

## Workflow

1. **PR + TLC context** (before triaging comments)
   - `gh pr view <number> --json title,headRefName,baseRefName,url,body,closingIssuesReferences`
   - Checkout the PR branch if needed.
   - `gh pr checks <number>` — note failing jobs.
   - **Load TLC artifacts** — follow [tlc-context.md](tlc-context.md):
     - Resolve issue number(s) → `.specs/features/<issue>-<slug>/`
     - Read `spec.md` and `tasks.md` (at minimum) for each feature in scope.
     - Note open tasks and **Verify:** lines; use them as the definition of done when judging comments.
   - Keep a short mental map: `comment → file → task ID (if any) → Verify line`.

2. **Fetch comments** (actionable first)
   - Inline review: `gh api repos/{owner}/{repo}/pulls/{number}/comments`
   - Issue-level: `gh api repos/{owner}/{repo}/issues/{number}/comments`
   - Prefer GraphQL `reviewThreads` with `isResolved: false` when filtering resolved threads.
   - Read each comment `body`, `path`, `line`, `id` only — do not load full JSON dumps into reasoning.

3. **Triage** (with TLC scope)
   - **In scope:** fixes code/tests/docs required by spec, a task **Verify** line, or CI for this PR.
   - **Out of scope:** new product behavior not in `spec.md` / tasks — reply that it needs a separate issue or TLC slice; do not expand the PR unless the user agrees.
   - **HITL / manual gates:** do not mark `hitl-signoff.md` or HITL tasks done without human sign-off.
   - Fix valid bugs and CI blockers; skip or reply briefly when automation/Bugbot is wrong.
   - Never change CI workflows only to green a check.

4. **Verify**
   - Prefer commands that match a task **Verify** line (e.g. Playwright smoke for T49-02).
   - Run the smallest proof: unit test, or e2e with the same env as CI (see Onda notes below).

5. **Ship** (when the user asked to address the PR / make it merge-ready)
   - Scoped commit; push branch.
   - Re-check `gh pr checks <number>`.

6. **Reply on GitHub** (when the user asked to answer or address comments)
   - One reply per addressed inline comment:
     ```bash
     gh api -X POST repos/{owner}/{repo}/pulls/comments/{comment_id}/replies \
       -f body='Fixed in <short_sha>: <what changed>. Verified: <how>.'
     ```
   - When applicable, cite TLC task ID (e.g. “supports **T49-02** Verify”).
   - Mention commit SHA, the fix, and verification (local command and/or CI after push).

7. **Addressed summary** (always — chat + PR when fixes were shipped)
   - Build the summary **while triaging** (track each review thread: fixed / deferred / out of scope / no action).
   - Post the same summary in **two places**:
     1. **Chat** — full [Addressed summary template](#addressed-summary-template) for the user.
     2. **PR comment** — when step 6 ran or the user asked to address comments:
        ```bash
        gh pr comment <number> --body-file /tmp/pr-addressed-summary.md
        ```
        (Write the body to a temp file; use HEREDOC in shell. Do not skip unless the user said explain-only, no PR noise.)
   - Link inline thread replies from the summary (e.g. “keyboard e2e — [thread](url)”).

8. **User wrap-up** (always, after step 7)
   - Point to the PR summary comment URL if posted.
   - One line: merge-ready? (CI + open threads + remaining TLC/HITL)

## Addressed summary template

Use this structure in chat and in the PR comment (adjust sections that are empty):

```markdown
## Review feedback addressed

**PR:** #{number} · **Commit(s):** `{short_sha}` (latest) · **CI:** {pass | failing — job names}

### TLC context
- **Issues:** #{n}, …
- **Features:** `{slug}`, …
- **Tasks touched:** Txx-yy (Verify: …) — only tasks this round satisfied or advanced

### Addressed
| Feedback | Action | Commit | TLC |
|----------|--------|--------|-----|
| {short paraphrase — e.g. CI blocker: leader time-away e2e} | {what you changed} | `{sha}` | {T49-02 or —} |
| … | … | … | … |

### Not changed (with reason)
| Feedback | Reason |
|----------|--------|
| {paraphrase} | {out of scope / invalid / HITL / deferred to follow-up issue} |

### Verification
- {commands run locally}
- {CI jobs green after push, or what is still red}

### Still open on this PR
- {unresolved threads, HITL gates, TLC tasks not done by this round}
```

**Rules for the table:**
- One row per distinct review comment or thread (not per file).
- **Addressed** = code/docs pushed + thread replied (step 6).
- **Not changed** = explained in thread or in this table; no silent drops.

## Reply template

```markdown
Fixed in `{short_sha}`: {one sentence on the fix}.

TLC: {optional — e.g. supports T49-02 Verify (keyboard smoke in CI)}.

Verified: {e.g. `PLAYWRIGHT_WITH_API=true playwright test …` or "Playwright green on latest push"}.
```

For documentation-only feedback:

```markdown
Done in `{short_sha}`: {what was added}. Thanks for the suggestion.
```

For out-of-scope feedback:

```markdown
Valid point, but out of scope for this PR ({feature slug} / #{issue}). Suggest a follow-up issue or TLC slice for {brief reason}.
```

## Onda Volunteer notes

- **TLC paths:** [tlc-context.md](tlc-context.md), [ONDA.md](../tlc-spec-driven/ONDA.md).
- **Tests:** `AGENTS.md` — `pnpm test`, `pnpm test:e2e:web-legacy` (API + Postgres), smoke `pnpm --filter @onda/web-legacy test:e2e`.
- **Playwright CI:** `.github/workflows/e2e-web.yml` sets `PLAYWRIGHT_WITH_API=true`. Reproduce API-backed failures locally with that env.
- **Multi-church seed:** Demo volunteer leads ministries at **Igreja Central** only. API-backed leader/scheduling e2e must select that church (`getByRole('combobox', { name: /church|igreja/i }).selectOption('Igreja Central')`). Smoke mocks in `apps/web-legacy/e2e/apiMocks.ts` use a single church — behavior differs from API; see comment there.
- **Commits / push:** Commit and push only when the user intent is to land PR fixes (not for explain-only requests). Follow user git rules (no force-push `main`, no `--no-verify` unless asked).

## Do not

- Dump entire `gh api` responses into the conversation.
- Push or commit when the user only wanted an explanation.
- Re-paste full diffs in thread replies — keep replies short.
- Implement scope creep without user confirmation.
- Auto-check `tasks.md` or HITL sign-off unless the user asked to close the feature.

## Related

- Planning / new slices: **tlc-spec-driven** (default on this repo).
- Merge conflicts + CI without TLC thread replies: Cursor **babysit** skill (user-level).
