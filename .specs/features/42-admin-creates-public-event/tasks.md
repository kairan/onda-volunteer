# Tasks: Admin creates Public Event (#42)

## Task list

- [ ] T42-01: Confirm command contract and reuse points with existing event creation paths.
  - Verify: design/API notes reviewed against current events module.
- [ ] T42-02: Implement/adjust server-side accreditation and single-church guards for Public event create.
  - Verify: API tests pass for in-scope and out-of-scope admin attempts.
- [ ] T42-03: Wire web form flow for Public event create with church/campus timezone framing.
  - Verify: integration test covers timezone display and successful submit.
- [ ] T42-04: Preserve stable error mapping for accreditation and validation failures.
  - Verify: existing error-code contract tests updated and green.
- [ ] T42-05: Add regression checks for UTC persistence invariants.
  - Verify: API readback assertions confirm persisted UTC behavior.
- [ ] T42-06: Complete HITL review for accreditation and validation copy.
  - Verify: review checklist artifact recorded before release.

## Parallelization notes

- T42-02 and T42-03 can proceed in parallel after T42-01.
- T42-04 and T42-05 can run in parallel after initial implementation.
