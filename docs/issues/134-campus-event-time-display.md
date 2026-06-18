# 134 — Campus-authoritative event time display in scheduling shell

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `CONTEXT.md`; org-structure P2 #107

## Parent

- TLC feature: `.specs/features/ubiquitous-language-drift/spec.md` (SCHED-01)

## What to build

Use active **Campus** IANA timezone for event presentation in scheduling shell (detail page today uses `church.defaultTimezone`). Fix create-event i18n ("campus timezone" when campus active). Align System Admin scheduling read labels. UTC instants unchanged; optional API `presentationTimezone` only if needed.

## Acceptance criteria

- [ ] Event detail uses campus zone when active campus selected (multi-campus test).
- [ ] Create-event hint copy matches campus vs church fallback zone.
- [ ] System Admin scheduling does not mislabel church fallback as sole clock.
- [ ] Automated tests for presentation (web; API if contract changes).

## Blocked by

None

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/134
