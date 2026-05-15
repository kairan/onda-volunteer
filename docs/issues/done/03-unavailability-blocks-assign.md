# Issue: Guard path — **Unavailability** blocks assign (surfaced in UI)

## Parent

`docs/prd/volunteer-management-platform.md`

## Type

AFK

## What to build

Implement the **Availability** → **Scheduling** dependency for the “cannot assign during **Unavailability**” rule, end-to-end: **Volunteer**-scoped, **Ministry**-scoped **Unavailability** rows persisted in **Availability**, **Scheduling** consults **Availability** during assign, and the web app surfaces a clear failure when blocked.

Keep this slice focused: do not also implement cross-**Ministry** overlap logic beyond what is already required indirectly (slice 4 owns that explicitly).

## Acceptance criteria

- [ ] **Unavailability** writes follow permission rules from `CONTEXT.md` at least enough for the demo path used by the slice (expand later as needed).
- [ ] Assign is rejected when the proposed **Assignment** interval overlaps **Unavailability** for the same **Volunteer** + **Ministry**, using **UTC** **half-open** comparisons consistent with `CONTEXT.md`.
- [ ] UI shows a user-comprehensible error state for the rejection (not a silent failure).
- [ ] Automated tests cover the rejection with a fixture **Unavailability** window (API-level minimum).

## Blocked by

`docs/issues/done/02-leader-first-assignment-public-event.md`
