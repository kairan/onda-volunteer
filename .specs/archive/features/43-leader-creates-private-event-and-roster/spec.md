# Feature Spec: Leader creates and rosters Private Event (#43)

## Problem statement

Leaders need to run ministry-internal events without promoting them to public church-wide schedules. The platform must support private event creation and rostering while preserving existing scheduling invariants and visibility boundaries.

## Requirements

- REQ-43-01: A Leader can create a Private event only for a Ministry they lead.
- REQ-43-02: Accredited Admins can support Private events within accredited Churches.
- REQ-43-03: Assignment writes for Private events use the same Scheduling invariants as Public events.
- REQ-43-04: Private event visibility is limited to Ministry participants plus accredited Admins.
- REQ-43-05: Private event creation and roster UX receive human review prior to release.

## Non-goals

- Public event creation enhancements.
- New assignment rule variants specific to private events.
- Route retirement or shell-wide IA changes.

## Dependencies and blockers

- Requires #36 and #37 baselines (issue lists both; both shipped).
- Depends on existing assignment invariant enforcement and role/membership checks.
- Must remain consistent with PRD stories 15, 28, 13, and 27.

## Verification approach

- API tests for authorized and unauthorized private event creation.
- Integration tests for private roster assignment success/failure under existing invariants.
- Visibility tests for participant/admin-only read access.
- HITL sign-off for private-event UX and wording.
