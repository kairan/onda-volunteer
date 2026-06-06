# 115 — Leader production roster assignment UI

**Type:** Feature
**Label:** `ready-for-agent`
**Blocked by:** none
**TLC:** `.specs/features/leader-roster-assignment-ui/` (spec, design, tasks — Execute-ready)

## Problem

The event detail page (`/scheduling/:eventId`) has a demo-only assignment form gated on `VITE_DEMO_*` env vars. Leaders cannot select real volunteers or roles, and cannot void other volunteers' assignments from the roster UI.

## What to build

Replace demo form with production rostering controls:

- Volunteer picker (Active ministry members only)
- Role picker (non-retired ministry roles)
- Ministry picker for Public events when leader stewards >1 ministry
- Remove button on roster rows (confirm dialog → `voidAssignment`; roster refreshes)
- Retire all `VITE_DEMO_*` env var gates from the assignment form

### Tasks

`T-ROSTER-01 → T-ROSTER-02 → T-ROSTER-03 → T-ROSTER-04 [P] T-ROSTER-05 → T-ROSTER-06`

See `.specs/features/leader-roster-assignment-ui/tasks.md` for full task breakdown.

## Acceptance criteria

- [ ] Leader views event detail → sees assignment form with real volunteer/role dropdowns (no env vars required)
- [ ] Volunteer picker lists only Active ministry members; Pending/Inactive absent (ROSTER-02)
- [ ] Role picker lists only non-retired roles (ROSTER-04)
- [ ] Ministry picker shown for Public events with >1 accessible ministry; auto-bound for exactly 1 (ROSTER-03)
- [ ] Remove button on leader's ministry assignment rows; confirm → calls `voidAssignment`; roster refreshes (ROSTER-09, ROSTER-11)
- [ ] Non-leader sees read-only roster table only (ROSTER-13)
- [ ] `voidAssignment` stable error codes: `ASSIGNMENT_NOT_FOUND` (404), `ASSIGNMENT_ALREADY_VOIDED` (400), `LEADER_NOT_ASSIGNED` (403), `SYSTEM_ADMIN_READ_ONLY` (403) (ROSTER-11, ROSTER-12)
- [ ] `pnpm test` green (new `leader-roster-assignment.e2e-spec.ts`)
- [ ] `pnpm --filter @onda/web test` green (all new behavior cases)

## Specification links

- Spec: `.specs/features/leader-roster-assignment-ui/spec.md` (ROSTER-01–14)
- Design: `.specs/features/leader-roster-assignment-ui/design.md`
- Tasks: `.specs/features/leader-roster-assignment-ui/tasks.md`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/115
