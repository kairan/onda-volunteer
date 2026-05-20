# 52 — Web: retire legacy **Event** demo routes (tech debt)

**Type:** Tech debt (defer — PRD-gated)  
**Bounded context:** Web shell / routing  
**Index:** `docs/issues/architecture-debt.md` (candidate **#6**)

## Problem

Two route trees coexist: shell routes (`/dashboard`, `/scheduling`, …) and legacy `legacyLayoutRoute` (`/`, `/events/$eventId`). Slice **34** shipped with scheduling list links still exiting to legacy detail. PRD story **42** intentionally preserved legacy routes for tracer-bullet stability.

## What to build

After shell roster read/write (**35**, **36**) are proven:

- Redirect or remove legacy **`/events/$eventId`** once **`/scheduling/events/$eventId`** is canonical
- Decide fate of legacy **`/`** demo landing (separate product decision; ADR 0001 notes temporary dual entry)
- Single protected layout for all signed-in product flows

## Acceptance criteria

- [ ] No primary nav or **`/scheduling`** link targets legacy **`/events/$eventId`**.
- [ ] Shell roster assign/release only on **`/scheduling/events/$eventId`**.
- [ ] PRD story **42** amended or superseded in an ADR noting legacy retirement date.
- [ ] Runbook (`docs/runbooks/supabase-auth-local.md`) updated to point agents at shell routes.
- [ ] Behavior tests cover scheduling → shell detail navigation.

## When to schedule

- **After** slices **35** and **36** closed.
- Requires explicit product sign-off (contradicts current PRD until amended).

## Blocked by

- Slice **35** — GitHub [#37](https://github.com/kairan/onda-volunteer/issues/37)
- Slice **36** — GitHub [#38](https://github.com/kairan/onda-volunteer/issues/38)

## Out of scope

- Removing **`/`** entirely without a replacement signed-in home decision

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/58
