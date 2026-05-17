# 46 — Personal-local time + i18n closeout

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **2–4**); `docs/prd/web-client-design-system-shell-i18n.md` (stories **1–3**, **45**); `CONTEXT.md`

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`
- Presentation PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Close remaining presentation gaps for dual **Church**-time and personal-local time display, session persistence, and untranslated shell/dashboard copy. **Scheduling** records remain UTC while UI locale and timezone presentation stay clearly separate.

## Acceptance criteria

- [ ] **Event** and **Assignment** screens can show personal-local time without replacing canonical **Church** or **Campus** framing.
- [ ] Personal-local preference persists for the session or established local preference boundary.
- [ ] Remaining product copy on shell, dashboard, and scheduling surfaces uses i18n keys for **pt-BR** and **en**.
- [ ] Tests cover locale fallback, local-time toggle behavior, and at least one dual-time display.
- [ ] UTC persistence remains unchanged.

## Blocked by

- Slice **35** — Event roster read inside the shell (GitHub **#37**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/48
