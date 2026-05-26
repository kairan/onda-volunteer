# Tasks: Admin manages Ministry membership lifecycle (#46)

## Task list

- [ ] T46-01: Confirm lifecycle command contracts and current deactivation behavior boundaries.
  - Verify: implementation notes match done/05 behavior and current API contracts.
- [ ] T46-02: Implement/refine add membership flow for pending/active creation under accreditation scope.
  - Verify: API tests pass for authorized and unauthorized add scenarios.
- [ ] T46-03: Implement/refine pending-to-active transition flow with scope checks.
  - Verify: API tests pass for valid transitions and invalid status operations.
- [x] T46-04: Implement/refine deactivation flow preserving future-only voiding semantics.
  - Verify: integration tests assert future assignment voiding and past assignment retention.
- [ ] T46-05: Add/update admin UI lifecycle controls and state rendering.
  - Verify: integration/UI tests cover status transitions and action availability.
- [x] T46-06: If transaction internals changed, route voiding through Scheduling seam or document rationale.
  - Verify: architecture note present in PR/spec updates.
- [ ] T46-07: Complete HITL review for lifecycle wording and support expectations.
  - Verify: sign-off checklist recorded.

## Parallelization notes

- T46-02 and T46-05 can run in parallel after T46-01.
- T46-03 and T46-04 can run in parallel once base membership flow is stable.
