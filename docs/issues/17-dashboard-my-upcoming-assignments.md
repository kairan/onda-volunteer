# 17 — Dashboard: my upcoming Assignments

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **2**, **3**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **24**, **45**); ADR **0001**

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Deliver the signed-in **Volunteer** home on **`/dashboard`**: read API for upcoming non-voided **Assignments** scoped to the active **Church** context, rendered in the shell with **Intl** times using that **Church**’s default timezone framing. Use skeleton loading for the list and the agreed empty-state pattern when there are none.

## Acceptance criteria

- [ ] Read endpoint returns only the caller’s **Assignments**; voided rows omitted.
- [ ] Times render in the active **Church** default timezone (canonical instants remain **UTC** in API).
- [ ] **`/dashboard`** replaces placeholder copy with the live list inside the shell.
- [ ] Automated tests cover API filtering and at least one UI behavior test for empty vs populated states.

## Blocked by

- Slice **15** — Organization context reads (GitHub **#5**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/7
