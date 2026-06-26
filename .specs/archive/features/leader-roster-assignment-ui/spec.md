# Leader Production Roster Assignment UI — Specification

## Status

- **All requirements**: Specified — Design phase complete. Ready for Tasks/Execute.

## Source references

- Domain glossary: `CONTEXT.md` (**Leader**, **Assignment**, **Event**, **Volunteer**, **Ministry**, **Role**, **Scheduling**)
- Platform PRD: `docs/prd/volunteer-management-platform.md` (stories 13, 27, 28)
- Shipped adjacent slices: private event creation (`done/43-leader-creates-rosters-private-event.md`), assignment release + unavailability offer (`done/38-event-roster-writes-assign-release-unavailability-offer.md`), scheduling invariants (`done/54-api-scheduling-invariants-module.md`), assignment route under Scheduling (`done/57-api-assignment-route-under-scheduling.md`)
- ADR 0001 (context selectors, pessimistic mutation posture)
- Current demo form: `apps/web/src/routes/schedulingEventDetail.tsx` — `canAssign` block gated on `VITE_DEMO_*` env vars

## Problem Statement

The event detail page (`/scheduling/:eventId`) includes a demo-only assignment form that only functions when `VITE_DEMO_MINISTRY_ID`, `VITE_DEMO_VOLUNTEER_ID`, and `VITE_DEMO_ROLE_ID` are set in the environment. This form hardcodes volunteer and role IDs from env vars rather than letting Leaders pick from real ministry data.

**Leaders cannot** currently:
- Select a **Volunteer** from the ministry roster for an assignment
- Select a **Role** from the ministry catalog for an assignment
- Remove another volunteer's **Assignment** from a roster (only self-release is implemented)
- Create **Assignments** as themselves (rather than via demo bypass credentials)

The production UI must replace the demo form with real, Leader-scoped rostering controls.

## Goals

- [ ] Leader can create an **Assignment** by selecting **Volunteer** (from Active ministry members), **Role** (from ministry catalog, non-retired), and time window on any **Event** they can access.
- [ ] Leader can void/remove any **Assignment** on an **Event** for their **Ministry** (not just self-release).
- [ ] Demo env var gate (`VITE_DEMO_*`) is retired from the assignment form; no env var dependency for rostering.
- [ ] All existing scheduling invariants (unavailability check, active membership, time overlap rules) continue to apply and produce user-facing feedback.
- [ ] For **Public Events**: Leader rosters their own **Ministry**'s volunteers only.
- [ ] For **Private Events**: Leader rosters **Volunteers** for the ministry that owns the event.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Volunteer invite / create account | Planned in `volunteer-onboarding-invite` feature |
| Event reschedule / time window edits | Planned in `event-edit-reschedule` feature |
| Bulk assignment across multiple volunteers | Not in Platform PRD v1 scope |
| Optimistic mutations / concurrent edit merge | Deferred by ADR 0001 (pessimistic posture) |
| Volunteer self-service assignment creation | Volunteers may only release own assignments; scheduling write authority scoped to Leader/Admin |

---

## User Stories

### Story 1: Leader adds a Volunteer to an Event roster

**User Story**: As a **Leader** of a **Ministry**, I want to select an **Active** member of my **Ministry** and assign them a **Role** and time window on an **Event**, so that the roster reflects real volunteer commitments without requiring developer env vars.

**Acceptance Criteria**:

1. WHEN a **Leader** views an **Event** detail page THEN the roster assignment form SHALL display only for events they have access to, without requiring demo env vars.
2. WHEN a **Leader** opens the create-assignment form THEN the **Volunteer** picker SHALL list only **Active** members of the **Ministry** the **Leader** is rostering for.
3. WHEN a **Leader** selects a **Ministry** for a **Public Event** THEN the system SHALL restrict the picker to **Ministries** the **Leader** stewards in that **Church**.
4. WHEN a **Leader** opens the role picker THEN the system SHALL list only non-retired **Roles** from the selected **Ministry**'s catalog.
5. WHEN a **Leader** submits a valid assignment THEN the system SHALL persist the **Assignment** and refresh the roster table.
6. WHEN a submitted assignment conflicts with an existing **Unavailability** or **Assignment** THEN the system SHALL surface the specific scheduling error code (`UNAVAILABILITY_BLOCKS_ASSIGN`, `ASSIGNMENT_OVERLAP`, etc.) as a user-readable message.
7. WHEN a non-**Leader** user views the event detail page THEN the create-assignment form SHALL NOT be visible.

### Story 2: Leader removes a Volunteer from an Event roster

**User Story**: As a **Leader** of a **Ministry**, I want to void/remove any **Assignment** for my **Ministry** on an **Event**, so that I can correct roster mistakes or handle volunteer withdrawals without waiting for the volunteer to self-release.

**Acceptance Criteria**:

8. WHEN a **Leader** is viewing an event roster THEN each **Assignment** for their **Ministry** SHALL show a "Remove" action.
9. WHEN a **Leader** clicks "Remove" on an **Assignment** THEN a confirm dialog SHALL appear before the void is sent.
10. WHEN a **Leader** confirms removal of an **Assignment** THEN the system SHALL call `POST /assignments/:id/void` (leader-scoped) and refresh the roster.
11. WHEN a **Leader** tries to remove an **Assignment** for a **Ministry** they do not lead THEN the API SHALL reject with `LEADER_NOT_ASSIGNED` (or existing auth error).
12. WHEN an **Assignment** has already been voided THEN the "Remove" action SHALL NOT appear.

### Story 3: Demo form retirement

**User Story**: As an agent maintaining the web app, I want the demo assignment form (`VITE_DEMO_*` gate) removed once the production form is live, so that production builds do not expose a hardcoded test backdoor.

**Acceptance Criteria**:

13. WHEN the production assignment form ships THEN the `canAssign` block that checks `VITE_DEMO_MINISTRY_ID` / `VITE_DEMO_VOLUNTEER_ID` / `VITE_DEMO_ROLE_ID` SHALL be removed.
14. WHEN demo env vars are not set in any environment THEN no assignment-related feature SHALL be degraded.

---

## Edge Cases

- A **Leader** who stewards multiple **Ministries** on a **Public Event** should be able to roster for each of their ministries separately — the ministry picker scopes the volunteer + role pickers to the selected ministry.
- If a **Volunteer** has `PENDING` membership (not `ACTIVE`) they SHALL be excluded from the volunteer picker; the error state for selecting an inactive member is prevented by filtering before submission.
- If a **Ministry** is archived (post–#108 Execute), it SHALL be excluded from the ministry picker per `ministriesForWritePickers` (already implemented); this feature inherits that filter automatically.

---

## Requirement Traceability

| Requirement ID | Story | Status |
|----------------|-------|--------|
| ROSTER-01 | S1: Assignment form visible to Leaders, no demo env | Specified |
| ROSTER-02 | S1: Volunteer picker — Active members of leader ministry | Specified |
| ROSTER-03 | S1: Ministry picker for Public Events (leader-scoped) | Specified |
| ROSTER-04 | S1: Role picker — non-retired catalog entries | Specified |
| ROSTER-05 | S1: Submit persists assignment; roster refreshes | Specified |
| ROSTER-06 | S1: Scheduling error codes surfaced to user | Specified |
| ROSTER-07 | S1: Non-leader cannot see create form | Specified |
| ROSTER-08 | S2: Leader sees Remove on own-ministry assignments | Specified |
| ROSTER-09 | S2: Confirm dialog before void | Specified |
| ROSTER-10 | S2: POST /assignments/:id/void — leader-scoped endpoint | Specified |
| ROSTER-11 | S2: Auth rejection for wrong ministry | Specified |
| ROSTER-12 | S2: No Remove action on already-voided assignments | Specified |
| ROSTER-13 | S3: Demo VITE_DEMO_* gate removed | Specified |
| ROSTER-14 | S3: No functional regression without demo env vars | Specified |

**Design / Tasks**: `.specs/archive/features/leader-roster-assignment-ui/design.md`, `tasks.md`.

## Decisions (locked 2026-06-06, user-confirmed)

**ROSTER-A1** (confirmed): The leader-void endpoint is `POST /assignments/:id/void` — a new endpoint separate from `POST /assignments/:id/release`. Keeps `release` contract unchanged; avoids conflating "volunteer opt-out" with "leader removal". See `design.md` for full API contract.

**ROSTER-A3** (confirmed): No unavailability offer is triggered on leader-void. The unavailability prompt remains only on volunteer self-release. Rationale: Leader does not know the volunteer's intent on removal. Documented in `design.md`.

For **Public Events** with a Leader who stewards exactly one ministry, the form auto-binds to that ministry. If the Leader stewards multiple ministries, a ministry picker is shown. Matches the existing volunteer-page pattern (`stewardshipMinistries.length === 1` → auto-select).
