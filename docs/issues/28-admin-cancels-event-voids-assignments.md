# 28 — Admin cancels Event → void Assignments

**Type:** **HITL** (voiding behavior — manual review of assignment outcomes)  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (story **23**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

**Admin** cancels an **Event** (or marks it non-running per agreed model); all **Assignments** for that occurrence are **voided** so no **Volunteer** remains rostered. Destructive confirm dialog with specific verb labels (ADR). List and detail views reflect voided state.

## Acceptance criteria

### Automated / AFK-verifiable

- [ ] Cancel mutation voids all active **Assignments** for that **Event**.
- [ ] Roster read omits voided rows from active commitments.
- [ ] Automated tests cover voiding count and authorization.

### HITL — required before merge

- [ ] Reviewer signs off voiding on a realistic church-week scenario (in-progress **Event** edge case documented in checklist).

## Blocked by

- Slice **24** — Admin creates Public Event (GitHub **#14**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/18
