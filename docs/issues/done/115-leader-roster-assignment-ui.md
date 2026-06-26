# 115 — Leader production roster assignment UI

**Type:** Feature
**Status:** Shipped (validated 2026-06-11)
**TLC:** `.specs/archive/features/leader-roster-assignment-ui/` (spec, design, tasks)

## Problem

The event detail page (`/scheduling/:eventId`) had a demo-only assignment form gated on `VITE_DEMO_*` env vars. Leaders could not select real volunteers or roles, and could not void other volunteers' assignments from the roster UI.

## What was built

Production rostering controls on event detail:

- Volunteer picker (Active ministry members only)
- Role picker (non-retired ministry roles)
- Ministry picker for Public events when leader stewards >1 ministry
- Remove button on roster rows (confirm dialog → `voidAssignment`; roster refreshes)
- Demo `VITE_DEMO_*` gates removed from assignment form

## Acceptance criteria

- [x] Leader views event detail → sees assignment form with real volunteer/role dropdowns (no env vars required)
- [x] Volunteer picker lists only Active ministry members; Pending/Inactive absent (ROSTER-02)
- [x] Role picker lists only non-retired roles (ROSTER-04)
- [x] Ministry picker shown for Public events with >1 accessible ministry; auto-bound for exactly 1 (ROSTER-03)
- [x] Remove button on leader's ministry assignment rows; confirm → calls `voidAssignment`; roster refreshes (ROSTER-09, ROSTER-11)
- [x] Non-leader sees read-only roster table only (ROSTER-13)
- [x] `voidAssignment` stable error codes: `ASSIGNMENT_NOT_FOUND` (404), `ASSIGNMENT_ALREADY_VOIDED` (400), `LEADER_NOT_ASSIGNED` (403), `SYSTEM_ADMIN_READ_ONLY` (403) (ROSTER-11, ROSTER-12)
- [x] `pnpm test` green (`leader-roster-assignment.e2e-spec.ts`)
- [x] `pnpm --filter @onda/web test` green (behavior cases)

## Specification links

- Spec: `.specs/archive/features/leader-roster-assignment-ui/spec.md` (ROSTER-01–14)
- Design: `.specs/archive/features/leader-roster-assignment-ui/design.md`
- Tasks: `.specs/archive/features/leader-roster-assignment-ui/tasks.md`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/115
