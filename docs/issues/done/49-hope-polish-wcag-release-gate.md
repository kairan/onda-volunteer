# 49 — HOPE polish and WCAG release gate

**Type:** HITL  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/web-client-design-system-shell-i18n.md` (stories **24**, **49**, **54**); `docs/prd/hope-design-system-migration.md` (stories **12–5**); `docs/adr/0003-hope-design-system-replaces-lamborghini.md`

## Parent

- Presentation PRD: `docs/prd/web-client-design-system-shell-i18n.md`
- HOPE PRD: `docs/prd/hope-design-system-migration.md`

## What to build

Run a focused accessibility and visual-polish pass after the core **Scheduling** and **Time away** surfaces land. Cover keyboard paths, focus visibility, reduced motion, skeleton loading polish, table readability, and a human WCAG 2.2 AA review checkpoint.

## Acceptance criteria

- [x] Core **Scheduling** and **Time away** surfaces pass keyboard-only smoke testing (`apps/web/e2e/keyboard-navigation.smoke.spec.ts`).
- [x] Focus states remain visible and meet WCAG 2.2 AA expectations on HOPE surfaces (global `:focus-visible` + Vitest baseline).
- [x] Reduced-motion behavior is respected for overlays, hover, and loading states (globals + Playwright smoke).
- [x] Loading skeletons and dense tables follow the HOPE visual contract without regressing readability (Vitest on pending + roster table).
- [ ] Human review records WCAG and visual-polish signoff before release (`.specs/archive/features/49-hope-polish-and-wcag-release-gate/hitl-signoff.md`).

## Blocked by

- Issue **#36** — Scheduling hub: Church-scoped **Event** list + read visibility (shipped)
- Issue **#37** — Event roster read inside the shell (shipped)
- Issue **#38** — Event roster writes: assign, release, optional **Unavailability** offer (shipped)
- Issue **#39** — Time away self-service: list/create **Unavailability** (shipped)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/49
