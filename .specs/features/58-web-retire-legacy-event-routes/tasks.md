# Tasks: Web retire legacy Event routes (#58)

## Task list

- [ ] T58-01: Record governance gate decision (PRD story 42 amendment or ADR supersession) before implementation.
  - Verify: explicit approved artifact linked in slice notes.
- [ ] T58-02: Migrate primary navigation and scheduling links to shell canonical event detail route.
  - Verify: link audit confirms no primary flows target legacy event detail.
- [ ] T58-03: Update integration/browser tests to shell-native scheduling detail paths.
  - Verify: Vitest + Playwright navigation scenarios pass.
- [ ] T58-04: Update runbooks and contributor docs to shell route references.
  - Verify: route guidance points to shell detail path only.
- [ ] T58-05: Remove legacy event detail route (or keep hard redirect with explicit deprecation timeline).
  - Verify: runtime behavior for legacy path is deterministic and documented.
- [ ] T58-06: Execute regression pass on scheduling detail entry points.
  - Verify: no broken-route errors in core scheduling workflows.

## Parallelization notes

- T58-02 and T58-04 can run in parallel after T58-01.
- T58-03 and T58-05 can run in parallel once link migration is complete.

## Deferred/gated note

Execution is intentionally deferred until product governance gate in T58-01 is satisfied.
