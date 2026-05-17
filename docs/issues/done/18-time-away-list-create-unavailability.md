# 18 — Time away: list and create Unavailability (one Ministry)

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **5**, **55**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **9**, **19**, **25**, **26**); `CONTEXT.md` (**Time away**, **Unavailability**); ADR **0001**

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Replace the **`/time-away`** placeholder with a real **Availability** self-service flow: list and create **Unavailability** for a selected **Ministry** where the **Volunteer** has **Ministry membership** (including **Pending**). Nest delegates writes to **Availability** rules; UI uses pessimistic save, field-level errors, and success toast per ADR. Nav label stays **Time away**; page copy may use **Unavailability** where precision matters.

## Acceptance criteria

- [ ] **Volunteer** can list their **Unavailability** rows and create a new interval for a chosen **Ministry**.
- [ ] Writes require membership to that **Ministry**; permission failures map to stable API errors.
- [ ] **`/time-away`** renders inside the shell with i18n keys only (no hard-coded literals).
- [ ] Automated tests cover at least one happy path and one permission/membership failure at the API boundary.

## Blocked by

- Slice **15** — Organization context reads (GitHub **#5**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/8
