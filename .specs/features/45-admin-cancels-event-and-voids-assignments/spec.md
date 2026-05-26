# Feature Spec: Admin cancels Event and voids Assignments (#45)

## Problem statement

Without structured cancellation, events may be functionally abandoned while assignments still appear active. Admins need an explicit cancellation operation that voids assignments and preserves explainable historical records.

## Requirements

- REQ-45-01: An accredited Admin can cancel an Event within an accredited Church.
- REQ-45-02: Cancelling an Event voids all Assignments for that event occurrence.
- REQ-45-03: Cancelled events do not appear as actively staffed for that occurrence.
- REQ-45-04: Historical records preserve cancellation status instead of silently deleting the event.
- REQ-45-05: Confirmation copy and destructive flow behavior receive human sign-off.

## Non-goals

- Event deletion as a replacement for cancellation.
- Membership lifecycle voiding policy changes (handled elsewhere).
- Broad reporting redesign beyond cancellation visibility.

## Dependencies and blockers

- Depends on #38 roster write baseline and #42 public event creation (as listed in issue).
- Must align with PRD story 23 and ADR 0001 destructive-confirmation posture.
- Requires existing accreditation enforcement to remain authoritative.

## Verification approach

- API tests for authorized/in-scope and unauthorized/out-of-scope cancellation.
- Integration tests verifying assignment voiding side effects.
- Read-model tests for cancelled-state representation in roster/history views.
- HITL sign-off for confirmation UX and edge-case behavior.
