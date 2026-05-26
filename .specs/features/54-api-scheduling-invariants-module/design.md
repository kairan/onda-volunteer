# Design: API Scheduling invariants module (#54)

## Scope

Extract core assignment invariants into a pure rules module while preserving existing orchestration and external behavior.

## Key design decisions

- Define pure functions for half-open UTC overlap and assignment eligibility decisions.
- Keep Nest/Prisma service as adapter layer; it gathers data and delegates decisions.
- Keep domain error code mapping stable by translating rule outcomes via current adapters.
- Add focused tests around bulk unavailability validation branches.
- Avoid introducing new HTTP surfaces in this refactor.

## Proposed module seam

- `intervalsOverlapHalfOpen(aStart, aEnd, bStart, bEnd): boolean`
- `canAssignVolunteer(input): AssignmentDecision`
- Optional shared parsing/normalization utility for UTC instant validation

## Risks and mitigations

- Risk: subtle behavioral drift during extraction.
  - Mitigation: lock behavior with existing e2e plus golden decision-table unit tests.
- Risk: adapter keeps partial business logic and weakens seam.
  - Mitigation: enforce adapter-only orchestration rule in review checklist.
- Risk: inconsistent error mapping from new decisions.
  - Mitigation: contract tests for machine-readable error codes.
