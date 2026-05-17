# 42 — Role catalog maintain/rename/Retire with roster enforcement

**Type:** HITL  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **18**, **22**, **31**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Expose **Ministry** **Role** catalog management for **Leaders** and accredited **Admins**: add, rename, and **Retire** catalog entries. New **Assignments** must reject **Retired** **Roles** while historical **Assignments** keep their recorded **Role** for reports and service history.

## Acceptance criteria

- [ ] **Leader** or accredited **Admin** can add and rename **Roles** for an authorized **Ministry**.
- [ ] **Leader** or accredited **Admin** can **Retire** a **Role** without deleting historical **Assignment** references.
- [ ] New **Assignment** creation rejects **Retired** **Roles** with a stable domain error.
- [ ] Historical **Assignments** continue to display the **Role** as recorded for reporting history.
- [ ] Human review signs off **Retire** copy and recovery guidance.

## Blocked by

- Slice **36** — Event roster writes: assign, release, optional Unavailability offer (GitHub **#38**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/44
