# Issue: **Volunteer** path — decline/**release** **Assignment** + optional **Unavailability** offer

## Parent

`docs/prd/volunteer-management-platform.md`

## Type

AFK

## What to build

Implement **Volunteer**-initiated **release**/**decline** of an **Assignment**, plus the non-forcing follow-up offer to create matching **Unavailability** for the same **Ministry** interval, end-to-end: mutation in Nest, state updates in Prisma, UI flow that makes the offer obvious but optional, and tests for the core transitions.

## Acceptance criteria

- [x] A **Volunteer** can release/decline only their own **Assignment** (authorization enforced server-side).
- [x] Successful release updates persistence so the **Assignment** no longer appears as an active commitment (`voidedAtUtc` on **Assignment**; active roster omits voided rows).
- [x] Optional offer path exists in UI and does not silently create **Unavailability** without explicit confirmation.
- [x] Automated tests cover server-side authorization and the primary state transition at minimum.

## Blocked by

`docs/issues/done/02-leader-first-assignment-public-event.md`
