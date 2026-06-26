# 134 — Campus-authoritative event time display in scheduling shell

**Type:** AFK  
**Status:** Shipped (validated 2026-06-18, PR [#140](https://github.com/kairan/onda-volunteer/pull/140))  
**TLC:** `.specs/archive/features/ubiquitous-language-drift/` (SCHED-01)

## Parent

- TLC feature: `.specs/archive/features/ubiquitous-language-drift/spec.md` (SCHED-01)

## What was built

Active **Campus** IANA timezone used for event presentation in scheduling shell (detail page no longer uses `church.defaultTimezone` alone when campus is selected). Create-event i18n names campus timezone when campus active. System Admin scheduling read labels aligned. UTC instants unchanged.

## Acceptance criteria

- [x] Event detail uses campus zone when active campus selected (multi-campus test).
- [x] Create-event hint copy matches campus vs church fallback zone.
- [x] System Admin scheduling does not mislabel church fallback as sole clock.
- [x] Automated tests for presentation (web; API if contract changes).

## Specification links

- Spec: `.specs/archive/features/ubiquitous-language-drift/spec.md`
- Tasks: `.specs/archive/features/ubiquitous-language-drift/tasks.md`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/134
