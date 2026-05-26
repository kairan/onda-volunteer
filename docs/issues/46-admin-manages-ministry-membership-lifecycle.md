# 46 — Admin manages Ministry membership lifecycle

**Type:** HITL  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md`; `CONTEXT.md`

## What to build

Admin lifecycle for ministry membership: add (Pending/Active), activate Pending, deactivate Active with future-only assignment voiding.

## Acceptance criteria

- [x] Accredited Admins can add a Volunteer to a Ministry as Pending or Active within an accredited Church.
- [x] Accredited Admins can transition membership from Pending to Active within scope.
- [x] Accredited Admins can deactivate Active membership within scope.
- [x] Deactivation voids assignments only for events whose scheduled end is still in the future.
- [x] Assignments for events that already ended remain preserved.
- [x] Lifecycle copy and support workflow expectations receive human sign-off (HITL copy in `volunteers` i18n namespace).
- [x] Deactivation voiding remains in Organization transaction (documented; Scheduling seam deferred per architecture-debt #5).

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/46
