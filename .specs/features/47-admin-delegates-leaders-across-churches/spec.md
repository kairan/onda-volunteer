# Feature Spec: Admin delegates Leaders across Churches (#47)

## Problem statement

Leader delegation must scale across church contexts without introducing broad, implicit authority. Admins need explicit ministry-by-ministry delegation that honors accreditation limits.

## Requirements

- REQ-47-01: Accredited Admins can grant Leader stewardship for an explicit Ministry in an accredited Church.
- REQ-47-02: Delegation is denied for Churches outside the Admin's accreditation scope.
- REQ-47-03: Delegated authority remains ministry-scoped, even when one person leads ministries across multiple churches.
- REQ-47-04: Delegated leaders can use existing leader-scoped Scheduling and Availability actions for delegated ministries.
- REQ-47-05: Cross-church delegation UX and boundary messaging receive human sign-off.

## Non-goals

- New global network-wide leader/admin roles.
- Organization model redesign beyond delegation workflows.
- Changes to core assignment or unavailability invariants.

## Dependencies and blockers

- Blocked by #46 per issue dependency.
- Depends on stable church accreditation and ministry stewardship checks.
- Must align with PRD stories 14 and 9-12.

## Verification approach

- API tests for in-scope and out-of-scope delegation attempts.
- Integration tests proving delegated leader permissions on scheduling/availability actions.
- Negative tests for non-delegated ministry access.
- HITL sign-off checkpoint for cross-church delegation clarity.
