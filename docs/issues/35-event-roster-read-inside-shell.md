# 35 — Event roster read inside the shell

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **13**, **16**, **27–29**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **20–21**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`
- Presentation PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Move roster reading into the signed-in shell with a route such as **`/scheduling/events/$eventId`**. Show **Event** metadata, **Ministry**-scoped roster rows, **Assignment** intervals, **Role** labels, and permission-aware read states using the HOPE table pattern.

## Acceptance criteria

- [ ] A shell route renders **Event** metadata and roster rows for an authorized viewer.
- [ ] **Assignments** display **Ministry**, **Volunteer**, **Role**, and explicit interval information.
- [ ] Unauthorized viewers cannot read rosters outside their visibility scope.
- [ ] Roster loading, empty, and route-error states render inside the app shell.
- [ ] Automated tests cover authorized and unauthorized roster read paths.

## Blocked by

- Slice **34** — Scheduling hub: Church-scoped Event list + read visibility (GitHub **#36**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/37
