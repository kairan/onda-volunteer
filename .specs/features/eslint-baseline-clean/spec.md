# Feature Spec: ESLint baseline clean (#126)

## Problem statement

CI lint runs in report-only mode (`continue-on-error: true`) per [#61](docs/issues/done/61-ci-lint-and-coverage.md) promotion criteria. `pnpm lint` still reports **13 warnings** (all `@typescript-eslint/no-unused-vars`) across 11 files, blocking promotion to a required merge gate.

## Requirements

- **LINT-CLEAN-01:** `pnpm lint` exits 0 with **zero warnings** on `main`.
- **LINT-CLEAN-02:** Root `lint` script uses `--max-warnings 0` so regressions fail locally and in CI.
- **LINT-CLEAN-03:** Remove `continue-on-error: true` from the `lint` job in `.github/workflows/ci.yml`.
- **LINT-CLEAN-04:** Document `CI / lint` as a required check in `docs/runbooks/github-branch-protection.md` (HITL: enable in GitHub Settings after first green run on `main`).

## Non-goals

- Web `tsc --noEmit` CI gate (61 strict errors — separate slice).
- Coverage threshold enforcement ([#61](.specs/features/61-ci-lint-and-coverage/tasks.md) step 2).
- ESLint rule-set expansion beyond fixing existing violations.

## Dependencies

- Builds on shipped [#61](docs/issues/done/61-ci-lint-and-coverage.md) lint infra (`eslint.config.mjs`, `pnpm lint`, CI job).
- Promotion criteria from [T61-06](.specs/features/61-ci-lint-and-coverage/tasks.md): focused cleanup PR satisfies lint gate promotion.

## Verification approach

- `pnpm lint` → exit 0, no warnings.
- `pnpm test` → green (no behavior change).
- CI `lint` job green and blocking on PR.
- Branch protection runbook updated for HITL follow-up.

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/126
