# Feature Spec: Web retire legacy Event routes (#58)

## Problem statement

The web app still carries legacy event route paths alongside shell-native scheduling routes, creating duplicated navigation patterns and migration ambiguity.

## Requirements

- REQ-58-01: Primary navigation and scheduling links no longer target legacy `/events/$eventId`.
- REQ-58-02: Shell detail path `/scheduling/events/$eventId` is the canonical event-detail destination.
- REQ-58-03: PRD story 42 is amended/superseded (or ADR update recorded) before route retirement is executed.
- REQ-58-04: Local runbooks and contributor guidance are updated to shell-native routes.
- REQ-58-05: Behavior tests cover scheduling-to-shell-detail navigation after retirement.

## Non-goals

- Removing `/` root route without an approved signed-in home replacement decision.
- Broad shell IA redesign unrelated to legacy route retirement.
- New event-detail feature behavior.

## Dependencies and blockers

- PRD-gated and intentionally deferred until explicit product sign-off.
- Upstream dependencies #37 and #38 are listed as shipped.
- Must remain aligned with ADR 0001 and architecture-debt note that this contradicts current PRD until amended.

## Verification approach

- Vitest and Playwright navigation coverage on shell canonical path.
- Route-link audits to confirm no primary flows target legacy event detail.
- Documentation checks for PRD/ADR/runbook updates before execution.
- Release checklist item verifying retirement gate approval captured.
