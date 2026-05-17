# 47 — HOPE polish and WCAG release gate

**Type:** HITL  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/web-client-design-system-shell-i18n.md` (stories **24**, **49**, **54**); `docs/prd/hope-design-system-migration.md` (stories **12–15**); `docs/adr/0003-hope-design-system-replaces-lamborghini.md`

## Parent

- Presentation PRD: `docs/prd/web-client-design-system-shell-i18n.md`
- HOPE PRD: `docs/prd/hope-design-system-migration.md`

## What to build

Run a focused accessibility and visual-polish pass after the core **Scheduling** and **Time away** surfaces land. Cover keyboard paths, focus visibility, reduced motion, skeleton loading polish, table readability, and a human WCAG 2.2 AA review checkpoint.

## Acceptance criteria

- [ ] Core **Scheduling** and **Time away** surfaces pass keyboard-only smoke testing.
- [ ] Focus states remain visible and meet WCAG 2.2 AA expectations on HOPE surfaces.
- [ ] Reduced-motion behavior is respected for overlays, hover, and loading states.
- [ ] Loading skeletons and dense tables follow the HOPE visual contract without regressing readability.
- [ ] Human review records WCAG and visual-polish signoff before release.

## Blocked by

- Slice **34** — Scheduling hub: Church-scoped Event list + read visibility (GitHub **#36**)
- Slice **35** — Event roster read inside the shell (GitHub **#37**)
- Slice **36** — Event roster writes: assign, release, optional Unavailability offer (GitHub **#38**)
- Slice **37** — Time away self-service: list/create Unavailability (GitHub **#39**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/49
