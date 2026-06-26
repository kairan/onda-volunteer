# 117 — Event edit / reschedule

**Type:** Feature
**Status:** Shipped (validated 2026-06-11)
**TLC:** `.specs/archive/features/event-edit-reschedule/` (spec, design, tasks)

## Problem

Events could be created and cancelled, but not edited or rescheduled. Leaders and Admins had to cancel and re-create events when times or titles changed.

## What was built

`PATCH /events/:id` supporting title edit and reschedule:

- **Title edit** — no assignment side-effects
- **Reschedule** — shift `startsAtUtc`/`endsAtUtc`; orphaned assignments auto-voided; response includes `voidedAssignmentCount`
- Auth: Admin for Public and Private; Leader for their own Private events only
- Cancelled event rejected (`EVENT_ALREADY_CANCELLED`)

Web: inline edit section on `SchedulingEventDetailView`; voided-count warning toast; i18n (`en` + `pt-BR`).

## Acceptance criteria

- [x] Admin title edit → 200; `voidedAssignmentCount: 0` (EVENT-EDIT-01)
- [x] Leader edits own Private event title → 200 (EVENT-EDIT-07)
- [x] Leader attempts Public event edit → 403 `LEADER_CANNOT_EDIT_PUBLIC_EVENT` (EVENT-EDIT-08)
- [x] Reschedule narrows window → orphaned assignments voided; `voidedAssignmentCount` reflects count (EVENT-EDIT-A1)
- [x] Assignments inside new window → unaffected; `voidedAssignmentCount: 0` (EVENT-EDIT-03)
- [x] Cancelled event edit → 400 `EVENT_ALREADY_CANCELLED` (EVENT-EDIT-09)
- [x] Empty PATCH body → 400 `EVENT_EDIT_EMPTY` (EVENT-EDIT-10)
- [x] `startsAtUtc >= endsAtUtc` → 400 `INVALID_EVENT_WINDOW` (EVENT-EDIT-11)
- [x] Edit section visible for Admin and eligible Leader; hidden for others and cancelled events (EVENT-EDIT-13)
- [x] `voidedAssignmentCount > 0` shows warning toast with count (EVENT-EDIT-16)
- [x] `pnpm test` green (`event-edit-reschedule.e2e-spec.ts`)
- [x] `pnpm --filter @onda/web test` green (`schedulingEventDetail` behavior cases)

## Specification links

- Spec: `.specs/archive/features/event-edit-reschedule/spec.md` (EVENT-EDIT-01–16)
- Design: `.specs/archive/features/event-edit-reschedule/design.md`
- Tasks: `.specs/archive/features/event-edit-reschedule/tasks.md`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/117
