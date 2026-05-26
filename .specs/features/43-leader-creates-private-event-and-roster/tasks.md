# Tasks: Leader creates and rosters Private Event (#43)

## Task list

- [ ] T43-01: Define private-event command/read contract reusing existing event aggregate shape.
  - Verify: contract notes aligned with current event APIs.
- [ ] T43-02: Implement private-event create authorization for leader ministry scope and accredited admin support.
  - Verify: API tests pass for authorized and unauthorized creation attempts.
- [ ] T43-03: Wire private-event roster writes through existing scheduling invariant path.
  - Verify: assignment integration tests pass with unchanged invariant behavior.
- [ ] T43-04: Implement private-event visibility filters for read paths.
  - Verify: tests confirm only ministry participants + accredited admins can view.
- [ ] T43-05: Add/update shell flow and copy for private-event creation/roster views.
  - Verify: UI/integration tests cover private-event user journey.
- [ ] T43-06: Complete HITL UX and wording sign-off.
  - Verify: review checklist approved.

## Parallelization notes

- T43-02 and T43-05 can run in parallel after T43-01.
- T43-03 and T43-04 can run in parallel once contract is stable.
