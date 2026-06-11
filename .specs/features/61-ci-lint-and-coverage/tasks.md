# Tasks: CI lint and coverage baseline (local #61)

## Task list

- [x] T61-01: Define lint configuration scope (root vs package overrides) and baseline strategy.
  - Verify: lint config draft agreed with baseline handling plan.
- [x] T61-02: Implement lint scripts (`pnpm lint`) and initial rule set.
  - Verify: local lint command runs end-to-end.
- [x] T61-03: Add CI lint job on pull requests in non-blocking/report mode.
  - Verify: lint job appears in CI and reports results.
- [x] T61-04: Implement coverage scripts for API and web tests and collect artifacts in CI.
  - Verify: coverage artifacts/reports published on PR runs.
- [x] T61-05: Add optional API typecheck CI job and document full-monorepo gate prerequisites.
  - Verify: API typecheck job green in CI.
- [x] T61-06: Define promotion criteria for required lint and thresholded coverage gates.
  - Verify: criteria documented with follow-up backlog linkage.

## Promotion criteria (T61-06)

Promote to **required** CI checks when:

1. **Lint:** ✅ Shipped — #126 (`pnpm lint --max-warnings 0`, required CI gate).
2. **Coverage:** ✅ Shipped — #129 (threshold floors in Jest/Vitest; CI `coverage` job blocking).
3. **Web typecheck:** ✅ Shipped — #128 (`pnpm typecheck:web`, CI `typecheck-web` job).

All T61-06 promotion criteria met as of 2026-06-11.

## Parallelization notes

- T61-02 and T61-04 can run in parallel after T61-01.
- T61-03 and T61-05 can run in parallel once scripts stabilize.
