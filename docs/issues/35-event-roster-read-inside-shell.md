# 35 — Event roster read inside the shell

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **13**, **16**, **27–29**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **20–21**); `CONTEXT.md`  
**Architecture:** fold candidate **#7** — see `docs/issues/architecture-debt.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`
- Presentation PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Move roster reading into the signed-in shell with route **`/scheduling/events/$eventId`**. Show **Event** metadata, **Ministry**-scoped roster rows, **Assignment** intervals, **Role** labels, and permission-aware read states using the HOPE table pattern.

Update **`/scheduling`** so each **Event** row navigates to this shell route (slice **34** shipped with links still pointing at legacy **`/events/$eventId`** — fixing that navigation is in scope here).

## Acceptance criteria

### Product

- [ ] Shell route **`/scheduling/events/$eventId`** renders **Event** metadata and roster rows for an authorized viewer.
- [ ] **Assignments** display **Ministry**, **Volunteer**, **Role**, and explicit interval information.
- [ ] Unauthorized viewers cannot read rosters outside their visibility scope.
- [ ] Roster loading, empty, and route-error states render inside the app shell (ADR route-level **Retry**).
- [ ] **`/scheduling`** list rows link to **`/scheduling/events/$eventId`**, not legacy **`/events/$eventId`**.
- [ ] Automated tests cover authorized and unauthorized roster read paths (API e2e and/or Playwright — extend `apps/web/e2e/` per slice **53**).

### Architecture hygiene (fold #7 — web API seam)

- [ ] Event detail loader uses a dedicated **`fetch*`** module (same pattern as `fetchEvents` / `fetchEventDetail`), not inline `fetch` in the route module.
- [ ] Loader and route errors use **`apiErrorFromResponse`** / **`ApiRequestError`** (or shell **`RouteErrorPanel`**), not a duplicate string-only error parser.
- [ ] Legacy **`/events/$eventId`** may remain for PRD story **42**, but is not the target from **`/scheduling`**.

### Out of scope

- Assign / release mutations (slice **36**).
- Removing legacy **`/events/$eventId`** entirely (tech-debt **52**).
- **`OrganizationContextProvider`** volunteer-id threading cleanup unless required for roster load to work.

## Testing notes

- Playwright foundation: slice **53** (`53-web-playwright-browser-e2e.md`). Add `e2e/scheduling-event-roster.integration.spec.ts` (or similar) when this slice ships shell roster read.

## Blocked by

- Slice **34** — Shipped (GitHub [#36](https://github.com/kairan/onda-volunteer/issues/36) closed)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/37
