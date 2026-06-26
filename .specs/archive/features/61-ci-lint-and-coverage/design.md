# Design: CI lint and coverage baseline (local #61)

## Scope

Add maintainability signal gates (lint + coverage reporting) to CI with a baseline-first rollout that avoids breaking throughput while existing debt is quantified.

## Key design decisions

- Introduce lint as a report-and-fix baseline first, then promote to required gate.
- Introduce coverage reporting without immediate threshold enforcement.
- Keep existing build/test jobs unchanged; add new jobs orthogonally.
- Stage typecheck gating with API-first approach until web strict debt is resolved.
- Keep configuration at monorepo root where possible, with package-specific overrides as needed.

## Pipeline shape

- `lint` job: runs `pnpm lint`; initially non-blocking until baseline cleanup decision.
- `coverage` job: runs test coverage for API and web and publishes artifacts/report.
- Optional `typecheck-api` job: `pnpm --filter @onda/api typecheck`.
- Future gate promotion criteria documented in slice follow-up notes.

## Risks and mitigations

- Risk: large initial lint violation volume.
  - Mitigation: baseline strategy (targeted fixes, staged rules, or temporary scoped suppressions).
- Risk: slower CI runtime with extra jobs.
  - Mitigation: parallel job execution and report-only posture.
- Risk: premature hard thresholds causing noisy failures.
  - Mitigation: collect baseline metrics before threshold gating decision.
