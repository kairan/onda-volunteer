# LESSONS — auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation — do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 — When grafting web-next i18n, port resolveInitialLocale + localePersistence tests in the same task as resources.ts.
- signal: `ac_gap` · recurrence: 1 feature(s) · harmful: 0
- features: frontend-restart-serve-well-base
- evidence: validation.md RST-FND-03 i18n
- last seen: 2026-07-01T15:57:04Z

### L-002 — Shell working-context picker needs a behavior test asserting ministry · Líder/Voluntário label text in pt-BR.
- signal: `ac_gap` · recurrence: 1 feature(s) · harmful: 0
- features: frontend-restart-serve-well-base
- evidence: validation.md RST-SHELL-01 picker labels
- last seen: 2026-07-01T15:57:04Z

### L-003 — API-backed Playwright smoke must pin org church/campus localStorage to the seed church that owns demo assignments, or assertions on assignment counts will flake against the default church.
- signal: `gate_fail` · recurrence: 1 feature(s) · harmful: 0
- features: frontend-restart-serve-well-base
- evidence: validation.md Phase 2 e2e
- last seen: 2026-07-02T23:27:06Z

### L-004 — When wiring a shared brand mark into multiple shells, assert the accessible logo in each shell behavior suite — implementation alone is not coverage
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `apps/web-onda/shell` · harmful: 0
- features: official-brandbook-web-onda
- evidence: BB-LOGO-01 AC4 (apps/web-onda/shell)
- last seen: 2026-07-16T20:28:22Z

### L-005 — Display typography utilities that require uppercase must encode text-transform in the utility and lock it in the theme contract
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `apps/web-onda/theme` · harmful: 0
- features: official-brandbook-web-onda
- evidence: BB-TYPE-01 AC2 (apps/web-onda/theme)
- last seen: 2026-07-16T20:28:22Z

### L-006 — Negative flourish rules (no glass on cards/tables) need class assertions on those components, not only on auth chrome
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `apps/web-onda` · harmful: 0
- features: official-brandbook-web-onda
- evidence: BB-FLR-01 AC4 (apps/web-onda)
- last seen: 2026-07-16T20:28:22Z

### L-007 — WCAG AA acceptance criteria require locked token values or measured contrast evidence — spot-check claims are not verification
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `apps/web-onda/theme` · harmful: 0
- features: official-brandbook-web-onda
- evidence: BB-TOK-01 AC5 / BB-DARK-01 AC2 (apps/web-onda/theme)
- last seen: 2026-07-16T20:28:22Z

### L-008 — Do not piggyback new UI asserts onto unrelated dialog/flow tests; give empty-state flourishes their own findByTestId case
- signal: `gate_fail` · recurrence: 1 feature(s) · scope: `apps/web-onda/tests` · harmful: 0
- features: official-brandbook-web-onda
- evidence: timeAway.behavior.test.tsx:134 (apps/web-onda/tests)
- last seen: 2026-07-16T20:28:22Z

## Quarantined (failed when applied — ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
