# 34 — Scheduling hub: Church-scoped Event list + read visibility

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **28–30**, **37**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **20**, **32**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`
- Presentation PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Replace the **`/scheduling`** placeholder with an authenticated **Event** index for the active **Church**. The slice should prove **Public** and **Private** visibility rules, **Church** timezone presentation, loading and empty states, and navigation into **Event** detail.

## Acceptance criteria

- [ ] **`/scheduling`** shows **Events** for the shell active **Church** only.
- [ ] **Event** read APIs require authentication and enforce **Public** versus **Private** visibility rules.
- [ ] **Event** rows show times in the active **Church** or **Campus** timezone frame.
- [ ] Each **Event** row navigates to a shell **Event** detail route.
- [ ] Automated tests cover at least one **Public** and one **Private** visibility scenario.

## Blocked by

None - can start immediately

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/36
