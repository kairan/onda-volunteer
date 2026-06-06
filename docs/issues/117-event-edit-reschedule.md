# 117 — Event edit / reschedule

**Type:** Feature
**Label:** `ready-for-agent`
**Blocked by:** none
**TLC:** `.specs/features/event-edit-reschedule/` (spec, design, tasks — Execute-ready)

## Problem

Events can be created and cancelled, but cannot be edited or rescheduled. Leaders and Admins must cancel and re-create events when times or titles change — losing the existing roster and requiring full re-rostering from scratch.

## What to build

Add `PATCH /events/:id` supporting title edit and reschedule:

- **Title edit** — no assignment side-effects
- **Reschedule** — shift `startsAtUtc`/`endsAtUtc`; orphaned assignments auto-voided (EVENT-EDIT-A1, locked 2026-06-06); response includes `voidedAssignmentCount`
- Auth: Admin for Public and Private; Leader for their own Private events only
- Cancelled event rejected (`EVENT_ALREADY_CANCELLED`)

Web: inline edit section on `SchedulingEventDetailView`; voided-count warning toast; i18n (`en` + `pt-BR`).

### Tasks

`T-EDIT-01 → T-EDIT-02 → T-EDIT-03 [P] T-EDIT-04 → T-EDIT-05`

See `.specs/features/event-edit-reschedule/tasks.md` for full task breakdown.

## Acceptance criteria

- [ ] Admin title edit → 200; `voidedAssignmentCount: 0` (EVENT-EDIT-01)
- [ ] Leader edits own Private event title → 200 (EVENT-EDIT-07)
- [ ] Leader attempts Public event edit → 403 `LEADER_CANNOT_EDIT_PUBLIC_EVENT` (EVENT-EDIT-08)
- [ ] Reschedule narrows window → orphaned assignments voided; `voidedAssignmentCount` reflects count (EVENT-EDIT-A1)
- [ ] Assignments inside new window → unaffected; `voidedAssignmentCount: 0` (EVENT-EDIT-03)
- [ ] Cancelled event edit → 400 `EVENT_ALREADY_CANCELLED` (EVENT-EDIT-09)
- [ ] Empty PATCH body → 400 `EVENT_EDIT_EMPTY` (EVENT-EDIT-10)
- [ ] `startsAtUtc >= endsAtUtc` → 400 `INVALID_EVENT_WINDOW` (EVENT-EDIT-11)
- [ ] Edit section visible for Admin and eligible Leader; hidden for others and cancelled events (EVENT-EDIT-13)
- [ ] `voidedAssignmentCount > 0` shows warning toast with count (EVENT-EDIT-16)
- [ ] `pnpm test` green (new `event-edit-reschedule.e2e-spec.ts`)
- [ ] `pnpm --filter @onda/web test` green (new `schedulingEventDetail` behavior cases)

## Specification links

- Spec: `.specs/features/event-edit-reschedule/spec.md` (EVENT-EDIT-01–16)
- Design: `.specs/features/event-edit-reschedule/design.md`
- Tasks: `.specs/features/event-edit-reschedule/tasks.md`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/117
