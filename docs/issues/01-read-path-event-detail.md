# Issue: Read path — **Event** detail with **Church** timezone framing

## Parent

`docs/prd/volunteer-management-platform.md`

## Type

AFK

## What to build

Deliver the first **tracer bullet** that proves the stack end-to-end for a **read** path: persisted **Organization** and **Scheduling** read data (**Church**, **Ministry** as needed, **Public event** or neutral **Event**), canonical **UTC** instants for the **Event** window, a Nest read API that returns a stable JSON shape for the web app, and a TanStack Router route with a `loader` that fetches that payload and renders the **Event** details using the **Church** default timezone framing rules (viewer-local conversion is optional at this stage if it would expand scope).

This slice intentionally avoids write-side **Scheduling** rules so it stays small, but it must still be **demoable** in the running web app against a real database target (local Postgres acceptable).

## Acceptance criteria

- [ ] Prisma models and migrations exist for the minimum persistent graph needed to render one **Event** in its **Church** context (including **UTC** window fields consistent with `CONTEXT.md`).
- [ ] Nest exposes a read endpoint the web app can call to retrieve that **Event** payload (including enough nested data to render the roster header/window faithfully).
- [ ] TanStack Router route loads the **Event** via the `loader` and renders successfully (typed response handling aligned with the generated persistence types or an equivalent strictly-typed DTO mirror).
- [ ] Automated tests exist that protect the read contract (at minimum: API-level contract test; add a lightweight UI smoke test only if it does not balloon scope).
- [ ] Local run instructions exist for bringing up API + web against a database (without requiring production secrets).

## Blocked by

None — can start immediately.
