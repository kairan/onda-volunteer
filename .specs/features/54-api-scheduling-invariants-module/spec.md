# Feature Spec: API Scheduling invariants module (#54)

## Problem statement

Scheduling assignment invariants are currently concentrated in orchestration code tightly coupled to Prisma, reducing local test leverage and making edge-case rule updates risky.

## Requirements

- REQ-54-01: Introduce a Scheduling rules module exposing canonical half-open UTC overlap evaluation.
- REQ-54-02: Introduce a unit-testable `canAssignVolunteer`-style decision API covering membership, unavailability, assignment conflicts, retired role, and event window bounds.
- REQ-54-03: Existing Nest/Prisma service remains as orchestration adapter and delegates rule decisions to the module.
- REQ-54-04: Existing assignment/release/unavailability e2e behaviors remain unchanged.
- REQ-54-05: Bulk unavailability validation paths gain focused test coverage for multi-ministry validation failures.
- REQ-54-06: No new HTTP routes are introduced in this refactor.

## Non-goals

- Request auth context redesign (#55).
- Assignment route ownership move (#57).
- User-facing behavior changes.

## Dependencies and blockers

- Recommended scheduling after #38 (already shipped; now unblocked).
- Depends on CONTEXT.md overlap and scheduling invariant definitions.
- Should stay aligned with architecture debt candidate #2 intent.

## Verification approach

- New unit tests for overlap and assignment decision helpers without PostgreSQL.
- Existing API e2e suite stays green for assignment/release/conflict behavior.
- Focused tests for bulk unavailability validation branches.
- Regression review confirming no HTTP contract delta.
