# 58 — Web: retire legacy **Event** demo routes (tech debt)

**Type:** Tech debt  
**Status:** **Shipped** — ADR [0004](../../adr/0004-retire-legacy-event-detail-route.md); legacy `/events/$eventId` redirects to shell.  
**Bounded context:** Web shell / routing  
**Index:** `docs/issues/architecture-debt.md` (candidate **#6**)

## Problem

Two route trees coexist: shell routes (`/dashboard`, `/scheduling`, …) and legacy `legacyLayoutRoute` (`/`, `/events/$eventId`). issue **#36** shipped with scheduling list links still exiting to legacy detail. PRD story **42** intentionally preserved legacy routes for tracer-bullet stability.

## What to build

After shell roster read/write (**35**, **36**) are proven:

- Redirect or remove legacy **`/events/$eventId`** once **`/scheduling/events/$eventId`** is canonical
- Decide fate of legacy **`/`** demo landing (separate product decision; ADR 0001 notes temporary dual entry)
- Single protected layout for all signed-in product flows

## Acceptance criteria

- [x] No primary nav or **`/scheduling`** link targets legacy **`/events/$eventId`**.
- [x] Shell roster assign/release only on **`/scheduling/events/$eventId`**.
- [x] PRD story **42** amended or superseded in an ADR noting legacy retirement date (ADR 0004).
- [x] Runbook (`docs/runbooks/supabase-auth-local.md`) updated to point agents at shell routes.
- [x] Behavior tests cover scheduling → shell detail navigation and legacy redirect (`demo-event.integration.spec.ts`, `AppShell.behavior.test.tsx`).

## When to schedule

- **After** issues **#37** and **#38** shipped (and **#36** scheduling hub shipped).
- Requires explicit product sign-off (contradicts current PRD until amended).

## Prerequisites (met)

- Issue **#37** — Event roster read in shell (shipped) — [#37](https://github.com/kairan/onda-volunteer/issues/37)
- Issue **#38** — Event roster writes (shipped) — [#38](https://github.com/kairan/onda-volunteer/issues/38)

## Out of scope

- Removing **`/`** entirely without a replacement signed-in home decision

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/58
