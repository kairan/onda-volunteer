# Issue: Write path — **Leader** creates first **Assignment** on a **Public event**

## Parent

`docs/prd/volunteer-management-platform.md`

## Type

AFK

## What to build

Deliver the **gateway** vertical slice for write-side **Scheduling**: an authorized **Leader** can create the first **Assignment** on a **Public event** for a **Volunteer** who has **Active** **Ministry membership** in the assignment’s **Ministry**, using a catalog **Role** that is not **Retired**, with an **Assignment** interval fully contained in the **Event** **UTC** window.

End-to-end behavior must include: Prisma persistence, Nest mutation endpoint that delegates validation to the **Scheduling** deep module, TanStack Router + Query (or equivalent) triggering the mutation from the UI and refreshing the **Event** read model, and automated tests that cover the happy path through the API (and keep UI testing proportionate).

## Acceptance criteria

- [ ] Creating an **Assignment** succeeds only when membership is **Active** for the targeted **Ministry** and the **Role** is eligible for new **Assignments**.
- [ ] **Assignment** intervals are validated against the parent **Event** window using **UTC** instants.
- [ ] Authorization distinguishes an authorized **Leader** for the **Ministry** from unrelated users (temporary dev headers are acceptable only if explicitly documented as non-production).
- [ ] Web UI demonstrates the created **Assignment** on the **Event** detail view after success.
- [ ] Automated tests cover the happy assign path at the API boundary (minimum), with clear domain error mapping for at least one representative failure (optional in this slice if it risks scope creep—prefer keeping failures for slices 3–4 unless trivial).

## Blocked by

`docs/issues/done/legacy-01-read-path-event-detail.md`
