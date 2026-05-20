# 34 — Scheduling hub: Church-scoped Event list + read visibility

**Status:** Shipped  
**GitHub:** [#36](https://github.com/kairan/onda-volunteer/issues/36) (closed)

**Type:** AFK  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **28–30**, **37**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **20**, **32**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`
- Presentation PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Replace the **`/scheduling`** placeholder with an authenticated **Event** index for the active **Church**. The slice should prove **Public** and **Private** visibility rules, **Church** timezone presentation, loading and empty states, and navigation into **Event** detail.

## Acceptance criteria

- [x] **`/scheduling`** shows **Events** for the shell active **Church** only.
- [x] **Event** read APIs require authentication and enforce **Public** versus **Private** visibility rules.
- [x] **Event** rows show times in the active **Church** or **Campus** timezone frame.
- [ ] Each **Event** row navigates to a shell **Event** detail route — **deferred to slice 35** (shipped build still links to legacy **`/events/$eventId`**).
- [x] Automated tests cover at least one **Public** and one **Private** visibility scenario.

## Follow-up

- Slice **35** — shell roster read + fix scheduling → detail navigation (GitHub **#37**).
