# Feature Spec: Admin creates Public Event (#42)

## Problem statement

Accredited Admins need a church-scoped workflow to create Public events with correct timezone framing and clear accreditation boundaries. Today the platform lacks a complete first-class creation flow for this core operation.

## Requirements

- REQ-42-01: An accredited Admin can create a Public event for a Church where they hold accreditation.
- REQ-42-02: Event creation is denied for Churches outside the Admin's accreditation scope.
- REQ-42-03: Created Public events are always scoped to exactly one Church.
- REQ-42-04: UI displays Church/Campus timezone framing while persisting event instants in UTC.
- REQ-42-05: Form validation and accreditation messaging receive explicit human sign-off before release.

## Non-goals

- Multi-church single-event occurrences.
- Private event creation (covered by #43).
- Broad shell navigation or route retirement changes.

## Dependencies and blockers

- Blocked by #36 scheduling hub baseline (listed in issue; shipped).
- Depends on existing church accreditation and authorization checks.
- Should stay aligned with ADR 0001 shell/time framing rules and PRD event scope decisions.

## Verification approach

- API tests for in-scope and out-of-scope Admin creation attempts.
- UI/integration tests covering timezone display and church selection constraints.
- Regression tests confirming UTC storage invariants.
- HITL checkpoint recorded for copy/validation sign-off.
