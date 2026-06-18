# 132 — API: reject Unavailability create for inactive membership

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `CONTEXT.md` (**Unavailability**, **Ministry membership**)

## Parent

- TLC feature: `.specs/features/ubiquitous-language-drift/spec.md` (AVAIL-01)

## What to build

Align `SchedulingService.createUnavailability` with bulk mirror membership guards: reject `INACTIVE` membership with `MEMBERSHIP_NOT_ACTIVE`. Reuse `scheduling-rules.ts` where possible. Add API e2e test.

## Acceptance criteria

- [ ] POST single **Unavailability** returns `MEMBERSHIP_NOT_ACTIVE` for `INACTIVE` membership.
- [ ] **Pending** and **Active** still allowed.
- [ ] Bulk and single-create share consistent guard logic.
- [ ] API e2e regression test.

## Blocked by

None

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/132
