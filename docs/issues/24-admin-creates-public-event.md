# 24 — Admin creates Public Event for accredited Church

**Type:** **HITL** (first real **Event** creation flow — review form UX and accreditation messaging before merge)  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **19**, **20**); ADR **0001**

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

**Admin**-only mutation to create a **Public event** for an accredited **Church**: **UTC** window, title, and church scope enforced in **Scheduling** / **Organization**. Shell scheduling UI provides a create form; success navigates to the new event in the shell list/detail flow.

## Acceptance criteria

### Automated / AFK-verifiable

- [ ] Non-accredited **Admin** (or **Volunteer**) cannot create **Public events** for that **Church**.
- [ ] Created **Event** appears on **`/scheduling`** for the correct **Church** after refetch.
- [ ] Automated tests cover accreditation denial and one happy create.

### HITL — required before merge

- [ ] Reviewer confirms create form copy, timezone framing, and error states feel correct for bilingual **pt-BR** / **en**.
- [ ] Reviewer signs off that accreditation errors are understandable without reading API codes.

## Blocked by

- Slice **20** — Scheduling Event list (GitHub **#9**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/14
