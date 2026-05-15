# 21 — Event roster read in shell

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (story **29**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **20**, **24**, **32**); ADR **0001**

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Add **`/scheduling/events/$eventId`** (or equivalent) inside the app shell: loader fetches **Event** detail + **Assignments** using the existing read contract, roster table with ADR monochrome hover/selection patterns, route-level error + **Retry** inside the shell. Read-only in this slice—no assign/release UI yet. Legacy **`/events/$eventId`** demo may remain until a follow-up explicitly removes it.

## Acceptance criteria

- [ ] Event detail loads through authenticated API with typed loader handling.
- [ ] Roster renders **Assignments** with church timezone framing and voided rows omitted from active roster.
- [ ] Table interaction patterns match ADR (hover wash, selected left rail).
- [ ] Automated tests cover loader success and at least one recoverable error path with **Retry**.

## Blocked by

- Slice **20** — Scheduling Event list (GitHub **#9**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/12
