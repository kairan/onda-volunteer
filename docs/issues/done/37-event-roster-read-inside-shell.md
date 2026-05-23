# 37 — Event roster read inside the shell

**Status:** Shipped  
**GitHub:** [#37](https://github.com/kairan/onda-volunteer/issues/37) (closed)

**Type:** AFK  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **13**, **16**, **#10–19**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **9–12**); `CONTEXT.md`  
**Architecture:** fold candidate **#7** — see `docs/issues/architecture-debt.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`
- Presentation PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Move roster reading into the signed-in shell with route **`/scheduling/events/$eventId`**. Show **Event** metadata, **Ministry**-scoped roster rows, **Assignment** intervals, **Role** labels, and permission-aware read states using the HOPE table pattern.

Update **`/scheduling`** so each **Event** row navigates to this shell route (issue **#36** shipped with links still pointing at legacy **`/events/$eventId`** — fixing that navigation is in scope here).

## Acceptance criteria

### Product

- [x] Shell route **`/scheduling/events/$eventId`** renders **Event** metadata and roster rows for an authorized viewer.
- [x] **Assignments** display **Ministry**, **Volunteer**, **Role**, and explicit interval information.
- [x] Unauthorized viewers cannot read rosters outside their visibility scope.
- [x] Roster loading, empty, and route-error states render inside the app shell (ADR route-level **Retry**).
- [x] **`/scheduling`** list rows link to **`/scheduling/events/$eventId`**, not legacy **`/events/$eventId`**.
- [x] Automated tests cover authorized and unauthorized roster read paths (API e2e and/or Playwright — extend `apps/web/e2e/` per slice **60**).

### Architecture hygiene (fold #7 — web API seam)

- [x] Event detail loader uses a dedicated **`fetch*`** module (same pattern as `fetchEvents` / `fetchEventDetail`), not inline `fetch` in the route module.
- [x] Loader and route errors use **`apiErrorFromResponse`** / **`ApiRequestError`** (or shell **`RouteErrorPanel`**), not a duplicate string-only error parser.
- [x] Legacy **`/events/$eventId`** may remain for PRD story **42**, but is not the target from **`/scheduling`**.

### Out of scope

- Assign / release mutations (issue **#38**).
- Removing legacy **`/events/$eventId`** entirely (tech-debt **#58**).
- **`OrganizationContextProvider`** volunteer-id threading cleanup unless required for roster load to work.

## Testing notes

- Playwright: `e2e/scheduling-event-roster.integration.spec.ts` (shipped with slice **60** — `done/60-web-playwright-browser-e2e.md`).

## Blocked by

- Issue **#36** — Scheduling hub shipped (closed)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/37
