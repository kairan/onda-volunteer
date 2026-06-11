# Feature Spec: Coverage threshold gates (#129)

## Problem statement

CI publishes coverage artifacts in report-only mode (`continue-on-error: true`) per [#61](../../docs/issues/done/61-ci-lint-and-coverage.md) T61-06. Baselines are now recorded; thresholds can gate regressions without arbitrary high bars.

## Baseline (2026-06-11)

| Package | Lines | Statements | Branches | Functions |
|---------|------:|-----------:|---------:|----------:|
| **API** (Jest e2e) | 86.0% | 86.5% | 64.3% | 89.3% |
| **Web** (Vitest) | 62.4% | 61.6% | 50.7% | 62.8% |

## Requirements

- **COV-01:** Jest e2e config enforces API global coverage floors at baseline minus ~1–2pp buffer
- **COV-02:** Vitest config enforces web global coverage floors at baseline minus ~1–2pp buffer
- **COV-03:** Fix API `jest-e2e.json` `rootDir` so `collectCoverageFrom` matches source (prerequisite for honest API %)
- **COV-04:** Remove `continue-on-error: true` from CI `coverage` job
- **COV-05:** `pnpm test:coverage` exits non-zero when thresholds fail

## Non-goals

- Per-file coverage gates
- Branch protection HITL for `CI / coverage` (optional follow-up)

## Verification approach

- `pnpm test:coverage` green locally and in CI
- Deliberately lowering a threshold in config causes failure (sanity check during development only)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/129
