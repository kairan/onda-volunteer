# Tasks: CI lint and coverage baseline (local #61)

## Task list

- [ ] T61-01: Define lint configuration scope (root vs package overrides) and baseline strategy.
  - Verify: lint config draft agreed with baseline handling plan.
- [ ] T61-02: Implement lint scripts (`pnpm lint`) and initial rule set.
  - Verify: local lint command runs end-to-end.
- [ ] T61-03: Add CI lint job on pull requests in non-blocking/report mode.
  - Verify: lint job appears in CI and reports results.
- [ ] T61-04: Implement coverage scripts for API and web tests and collect artifacts in CI.
  - Verify: coverage artifacts/reports published on PR runs.
- [ ] T61-05: Add optional API typecheck CI job and document full-monorepo gate prerequisites.
  - Verify: API typecheck job green in CI.
- [ ] T61-06: Define promotion criteria for required lint and thresholded coverage gates.
  - Verify: criteria documented with follow-up backlog linkage.

## Parallelization notes

- T61-02 and T61-04 can run in parallel after T61-01.
- T61-03 and T61-05 can run in parallel once scripts stabilize.
