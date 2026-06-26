# Tasks: ESLint baseline clean (#126)

**Spec:** `.specs/features/eslint-baseline-clean/spec.md`  
**Status:** Shipped — validated 2026-06-11

## Task list

- [x] T-LINT-01: Fix API unused-var warnings (1 src + 7 e2e files).
  - Verify: `pnpm lint` shows no API warnings.
- [x] T-LINT-02: Fix web unused-var warnings (4 files).
  - Verify: `pnpm lint` shows no web warnings.
- [x] T-LINT-03: Add `--max-warnings 0` to `pnpm lint`; remove `continue-on-error` from CI lint job.
  - Verify: `pnpm lint` exits non-zero if a warning is introduced.
- [x] T-LINT-04: Update branch protection runbook; TLC closeout docs.
  - Verify: `docs/runbooks/github-branch-protection.md` lists `CI / lint`.

## Gate

- `pnpm lint` — pass
- `pnpm test` — pass (158 API e2e + 134 web unit)
