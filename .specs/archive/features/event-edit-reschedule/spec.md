# Event Edit / Reschedule — Specification

## Status

- **All requirements**: Specified. Design phase complete. All assumptions confirmed (2026-06-06). Ready for Execute.

## Source references

- Domain glossary: `CONTEXT.md` (**Event**, **Assignment**, **Leader**, **Admin**, **Scheduling**, **Public event**, **Private event**)
- Platform PRD: `docs/prd/volunteer-management-platform.md` (stories 15, 28)
- Shipped adjacent: event creation (`done/42-admin-creates-public-event.md`, `done/43-leader-creates-rosters-private-event.md`), event cancellation (`done/45-admin-cancels-event-voids-assignments.md`), scheduling invariants (`done/54-api-scheduling-invariants-module.md`)
- ADR 0001 (pessimistic mutation posture, UTC canonical record)
- Current events API: `apps/api/src/events/events.controller.ts` — `PATCH /events/:id` does NOT exist (only POST + GET + cancel)

## Problem Statement

Events can be created and cancelled, but cannot be edited or rescheduled. In practice, church ministries frequently adjust service times, rename events, or shift an occurrence by an hour. Without an edit path, Leaders and Admins must cancel the event and re-create it — losing the existing roster, voiding all assignments, and requiring re-rostering from scratch.

This feature adds:
- **Title edit**: change the event title (no scheduling implications).
- **Reschedule**: shift the event's time window (`startsAtUtc` / `endsAtUtc`), with an explicit policy for existing assignments that fall outside the new window.

## Goals

- [ ] **Admin** can edit the title and/or reschedule any **Event** in an accredited **Church**.
- [ ] **Leader** can edit the title and/or reschedule a **Private Event** owned by a **Ministry** they lead.
- [ ] Title-only edits have no effect on **Assignments** or scheduling.
- [ ] Reschedule that orphans existing **Assignments** (their window falls outside the new event window) follows the documented orphan policy (see below).
- [ ] Editing or rescheduling a **cancelled** event is rejected.
- [ ] Existing UTC invariants: assignment windows expressed as UTC instants on the server; only presentation is timezone-affected.

## Assignment-Orphan Policy

**Decision (EVENT-EDIT-A1, locked 2026-06-06, user-confirmed)**: When a reschedule causes existing **Assignments** to fall outside the new event window, those **Assignments** are **voided automatically** (same pattern as ministry archive and membership deactivation: set `voidedAtUtc = now`, no prompt to the Leader).

**Rationale**: Consistent with other void-on-structural-change patterns; simpler than two-phase confirmation; Leader can re-assign after reschedule.

**Alternative considered and rejected** — Reject reschedule if orphans exist: forces Leaders to manually release assignments before rescheduling; more friction for intentional time shifts.

An **Assignment** is orphaned by a reschedule when:
- `assignment.startsAtUtc < new event.startsAtUtc`, OR
- `assignment.endsAtUtc > new event.endsAtUtc`

Assignments that fit within the new window are unaffected.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Recurring event series | Not in Platform PRD v1 |
| Moving an event to a different Ministry / Church | Would change auth scope; treat as cancel + re-create |
| Converting a Private event to Public or vice versa | Major domain change; out of scope for edit |
| Volunteer notification on reschedule | Production-hardening; defer (notifications deferred in Platform PRD) |
| Bulk reschedule / series edit | Not in v1 |

---

## User Stories

### Story 1: Edit event title

**User Story**: As an accredited **Admin** or **Leader** (for their **Ministry**'s **Private Event**), I want to change the title of an **Event**, so that the schedule reflects updated names without cancelling and re-creating the event.

**Acceptance Criteria**:

1. WHEN an accredited **Admin** sends a title-only PATCH for any non-cancelled **Event** in their **Church** THEN the system SHALL update the title and return the updated event.
2. WHEN a **Leader** sends a title-only PATCH for a non-cancelled **Private Event** owned by their **Ministry** THEN the system SHALL update the title.
3. WHEN a **Leader** attempts to edit a **Public Event**'s title THEN the system SHALL reject with `LEADER_CANNOT_EDIT_PUBLIC_EVENT` (only **Admin** may edit public event titles).
4. WHEN a title is empty or exceeds the character limit THEN the system SHALL reject with `EVENT_TITLE_REQUIRED` or `EVENT_TITLE_TOO_LONG`.
5. WHEN a title edit succeeds THEN all existing **Assignments** on that event SHALL be unaffected.

### Story 2: Reschedule event time window

**User Story**: As an accredited **Admin** or **Leader** (for their **Private Event**), I want to change the start and/or end time of an **Event**, so that schedule changes can be reflected without losing the existing roster.

**Acceptance Criteria**:

6. WHEN an **Admin** or **Leader** sends a reschedule PATCH with a valid new time window THEN the system SHALL update `startsAtUtc` and `endsAtUtc` on the **Event**.
7. WHEN a reschedule would make `startsAtUtc >= endsAtUtc` THEN the system SHALL reject with `INVALID_EVENT_WINDOW`.
8. WHEN a reschedule causes existing **Assignments** to fall outside the new window (orphaned assignments — see Orphan Policy above) THEN the system SHALL automatically void those assignments (set `voidedAtUtc = now`).
9. WHEN a reschedule results in zero orphaned assignments THEN no assignment is voided.
10. WHEN the reschedule response is returned THEN it SHALL include a `voidedAssignmentCount` field so the caller can inform the Leader how many assignments were voided.
11. WHEN a **Leader** attempts to reschedule a **Public Event** THEN the system SHALL reject with `LEADER_CANNOT_EDIT_PUBLIC_EVENT`.

### Story 3: Edit cancelled event rejected

**Acceptance Criteria**:

12. WHEN any user attempts to edit or reschedule a **cancelled** **Event** THEN the system SHALL reject with `EVENT_ALREADY_CANCELLED`.

### Story 4: Reschedule UX on event detail page

**User Story**: As an **Admin** or **Leader**, I want to reschedule an event directly from the event detail page, so that I can adjust the time in one place without navigating to a separate flow.

**Acceptance Criteria**:

13. WHEN an accredited **Admin** or eligible **Leader** views a non-cancelled event detail page THEN an "Edit" button or section SHALL appear.
14. WHEN the user submits a title-only change THEN the page SHALL show the updated title without a full reload.
15. WHEN the user submits a reschedule and assignments are voided THEN the page SHALL show a success message including the count of voided assignments so the Leader knows to re-roster.
16. WHEN a reschedule is rejected THEN the form SHALL surface the specific error code as a user-readable message.

---

## Edge Cases

- A reschedule where `startsAtUtc` or `endsAtUtc` stays the same as the current value is valid (title-only change passes through without triggering the orphan check).
- An event with no assignments can always be rescheduled without side effects (`voidedAssignmentCount: 0`).
- If a **Public Event** has assignments from multiple **Ministries** and a reschedule voids some, all affected assignments across all ministries are voided (not just the requesting leader's ministry — Admin-only action anyway per Story 2 AC 11).
- If a Ministry is archived after the event is created but before a reschedule, assignments for that archived ministry are still voided if they orphan (same void logic applies regardless of ministry status).

---

## Requirement Traceability

| Requirement ID | Story | Status |
|----------------|-------|--------|
| EVENT-EDIT-01 | S1: Admin edits title — any non-cancelled event | Specified |
| EVENT-EDIT-02 | S1: Leader edits title — own ministry Private Event | Specified |
| EVENT-EDIT-03 | S1: Leader cannot edit Public Event title | Specified |
| EVENT-EDIT-04 | S1: Title validation (empty, too long) | Specified |
| EVENT-EDIT-05 | S1: Assignments unaffected by title edit | Specified |
| EVENT-EDIT-06 | S2: Admin/Leader reschedule — valid window accepted | Specified |
| EVENT-EDIT-07 | S2: Invalid window (start ≥ end) rejected | Specified |
| EVENT-EDIT-08 | S2: Orphaned assignments auto-voided (EVENT-EDIT-A1, locked) | Specified |
| EVENT-EDIT-09 | S2: No void when all assignments fit new window | Specified |
| EVENT-EDIT-10 | S2: Response includes `voidedAssignmentCount` | Specified |
| EVENT-EDIT-11 | S2: Leader cannot reschedule Public Event | Specified |
| EVENT-EDIT-12 | S3: Cancelled event edit/reschedule rejected | Specified |
| EVENT-EDIT-13 | S4: Edit UI visible to Admin and eligible Leader | Specified |
| EVENT-EDIT-14 | S4: Title update reflected on page without reload | Specified |
| EVENT-EDIT-15 | S4: Reschedule shows voided assignment count | Specified |
| EVENT-EDIT-16 | S4: Reschedule error surfaced to user | Specified |

**Design / Tasks**: `.specs/archive/features/event-edit-reschedule/design.md`, `tasks.md`.

---

## Decisions (locked 2026-06-06, user-confirmed)

**EVENT-EDIT-A1** (confirmed): Assignment-orphan policy is **auto-void**. Orphaned assignments are voided in the same transaction as the reschedule; `voidedAssignmentCount` is returned in the response. See Assignment-Orphan Policy section above.

**EVENT-EDIT-A2** (confirmed): A single `PATCH /events/:id` endpoint handles both title-edit and reschedule. Body may include `title`, `startsAtUtc`, `endsAtUtc`; at least one field required (`EVENT_EDIT_EMPTY` if none provided). Consistent with campus metadata PATCH pattern.

**EVENT-EDIT-A3** (confirmed): The edit/reschedule UX is an inline form on the event detail page — no modal or separate route. Follows the same pattern as the existing inline cancel flow.
