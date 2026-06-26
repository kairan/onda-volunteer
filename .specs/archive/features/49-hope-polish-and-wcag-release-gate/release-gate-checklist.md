# Release gate checklist (#49)

Map to ADR [0001](../../../docs/adr/0001-visual-system-shell-and-i18n-baseline.md) (shell a11y, focus, reduced motion) and ADR [0003](../../../docs/adr/0003-hope-design-system-replaces-lamborghini.md) (HOPE surfaces).

## Automated (CI / local)

- [x] `apps/web/src/styles/globals.css` defines `:focus-visible` ring and `prefers-reduced-motion: reduce` overrides (`focusVisible.test.ts`).
- [x] Playwright `@a11y` keyboard smoke: skip link, primary nav, time away, leader time away, scheduling list (`keyboard-navigation.smoke.spec.ts`; local smoke uses `e2e/apiMocks.ts` when API is off).
- [x] Playwright reduced-motion smoke disables `.animate-pulse` (`keyboard-navigation.smoke.spec.ts`).
- [x] Vitest: scheduling detail pending skeleton uses HOPE borders (`schedulingEventDetail.pending.test.tsx`).
- [x] Vitest: scheduling roster table uses dense HOPE table pattern (`schedulingEventDetail.table.test.tsx`).

## Human (HITL)

- [ ] WCAG 2.2 AA spot-check on Scheduling + Time away (contrast, labels, errors) — record in `hitl-signoff.md`.
- [ ] Visual polish sign-off on dense tables and skeleton loading — record in `hitl-signoff.md`.
