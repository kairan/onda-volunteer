# Tasks: API Scheduling invariants module (#54)

## Task list

- [ ] T54-01: Catalog current invariant checks and expected error outcomes from existing scheduling paths.
  - Verify: invariant matrix documented against current behavior.
- [ ] T54-02: Implement pure half-open interval overlap utility with unit decision tables.
  - Verify: overlap unit tests pass for edge boundaries and back-to-back windows.
- [ ] T54-03: Implement pure assignment eligibility decision function(s) for core invariants.
  - Verify: unit tests pass for membership, unavailability, conflict, retired-role, and event-window cases.
- [ ] T54-04: Refactor scheduling service to delegate rule decisions via adapter seam.
  - Verify: compile/type checks pass and no API contract changes introduced.
- [ ] T54-05: Add focused tests for bulk unavailability multi-ministry validation failure paths.
  - Verify: targeted tests pass and cover documented branches.
- [ ] T54-06: Run full relevant API e2e regression for assignment/release/conflict paths.
  - Verify: existing e2e suite remains green with unchanged behavior.

## Parallelization notes

- T54-02 and T54-03 can run in parallel after T54-01.
- T54-05 can start after T54-03 while T54-04 is in progress.
