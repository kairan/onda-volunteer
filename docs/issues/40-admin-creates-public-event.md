# 40 — Admin creates Public Event

**Type:** HITL  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **19–20**, **29–30**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **17**, **25**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Ship the first **Admin** **Event** creation flow for an accredited **Church**. The slice should create **Public events**, keep the occurrence single-**Church**, frame times in the active **Church** or **Campus** timezone, and require human review of accreditation messaging and form UX.

## Acceptance criteria

- [ ] Accredited **Admin** can create a **Public event** for an accredited **Church**.
- [ ] **Admin** cannot create **Public events** for **Churches** where they are not accredited.
- [ ] **Event** creation preserves UTC persistence while presenting the active **Church** or **Campus** timezone in the UI.
- [ ] **Public events** remain scoped to exactly one **Church**.
- [ ] A human reviewer signs off accreditation messaging, form copy, and destructive-adjacent validation behavior.

## Blocked by

- Slice **34** — Scheduling hub: Church-scoped Event list + read visibility (GitHub **#36**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/42
