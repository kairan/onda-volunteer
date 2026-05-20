# 57 — API: **Assignment** create route under **Scheduling** (tech debt)

**Type:** Tech debt (defer)  
**Bounded context:** **Scheduling** / **Events** HTTP **seam**  
**Index:** `docs/issues/architecture-debt.md` (candidate **#4**)

## Problem

`POST /events/:id/assignments` lives on the **Events** controller while **implementation** is `SchedulingService.createAssignment`. Resource ownership and rule ownership sit on different **seams**; `EventsModule` imports `SchedulingModule` only for this write.

## What to build

Expose **Assignment** creation from a **Scheduling**-owned HTTP route (e.g. under assignments or scheduling prefix). Deprecate or remove the events-nested POST once web clients migrate.

## Acceptance criteria

- [ ] **Leader** create **Assignment** documented and implemented on the **Scheduling** route.
- [ ] Web shell roster (issue **#38**) uses the new route.
- [ ] Legacy route removed or returns clear deprecation if still called.
- [ ] E2e assign scenarios updated; behavior unchanged.

## When to schedule

- **After** issue **#38** when API cleanup is low risk.

## Blocked by

- issue **#38** — shell roster writes (GitHub [#38](https://github.com/kairan/onda-volunteer/issues/38))

## Out of scope

- Read path for **Event** detail (stays under **Events**)
- Rules extraction (**48**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/57
