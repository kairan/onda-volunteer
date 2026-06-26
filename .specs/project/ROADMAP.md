# Roadmap

High-level milestones for TLC planning. Detailed acceptance criteria and shipped work live in **[`docs/issues/`](../../docs/issues/)** (open specs at repo root of that folder; completed work under `done/`).

## Themes

1. **Scheduling & events** — private/public events, assignments, conflicts, cancellation.
2. **Availability** — unavailability, time away UX, leader-managed blocks.
3. **Organization** — ministries, roles, membership, leader/admin stewardship.
4. **Web shell & i18n** — Onda brand, pt-BR default, leader/volunteer dashboards (`apps/web-next`).

## How to use this file

- TLC **Specify** for a new feature: add or update a row under the relevant theme, then create `.specs/features/<slug>/spec.md`.
- When an issue ships, move its spec to `docs/issues/done/`, update this file and [`docs/issues/README.md`](../../docs/issues/README.md), then archive TLC artifacts per **AD-001** (see [`.specs/project/STATE.md`](STATE.md)).

## Active backlog

| Theme | Feature | Status | TLC / spec |
|-------|---------|--------|------------|
| **Web shell & i18n** | `frontend-migration-web-next` Slice 6 — CI & cutover | **#148 ready for agent** (T28 ✅; T27 partial) | [`.specs/features/frontend-migration-web-next/`](../features/frontend-migration-web-next/) · `docs/issues/148-web-next-migration-slice-6-cutover.md` |
| **Web shell & i18n** | `ui-refresh-onda-brand` | Design source for migration (no standalone execute) | [`.specs/features/ui-refresh-onda-brand/`](../features/ui-refresh-onda-brand/) |

**Frontend rebuild (`web-next`):** parallel strangler migration — `apps/web-next` on React 19 · Vite · TanStack Router · Tailwind 4 plus TanStack Query, Onda brand tokens, route-by-route parity, single cutover. ADR [0006](../../docs/adr/0006-onda-brand-visual-system.md). Lovable reference: [`design-reference/serve-well/`](../../design-reference/serve-well/).

## Shipped summary

All product tracer bullets through web-next Slices 1–5 are shipped. Full index: [`docs/issues/README.md`](../../docs/issues/README.md) and [`docs/issues/done/`](../../docs/issues/done/). TLC planning history: [`.specs/archive/features/INDEX.md`](../archive/features/INDEX.md).

| Theme | Representative issues | Status |
|-------|----------------------|--------|
| **Organization** | #87–#93, #107–#109, #115–#118 | ✅ Shipped |
| **Scheduling & Availability** | #36–#47, #115, #117 | ✅ Shipped |
| **Domain / i18n hygiene** | #131–#135 | ✅ Shipped |
| **CI / quality gates** | #60, #61, #126, #128, #129 | ✅ Shipped |
| **Architecture tech debt** | #54–#58 | ✅ Shipped |
| **Web-next migration** | #143–#147 | ✅ Shipped |

## Deferred or gated work

| Item | Status |
|------|--------|
| Household / non-sign-in Volunteers | Out of scope — `CONTEXT.md`, Platform PRD |
| Public Events spanning multiple Churches | Deferred — `CONTEXT.md`, Platform PRD |
| Email templates, push notifications, advanced audit UI, reporting, mobile apps | Platform PRD production-hardening; not planned |
| Dark mode toggle | Token architecture supports it; UI deferred |
| Optimistic roster mutations / concurrent editor merge UI | Deferred by ADR 0001 |
| Full print layout for roster pagination | Minimal print hygiene only |
| Third locales beyond `pt-BR` and `en` | Deferred by web PRD |
| Marketing redesign of `/` and public landing pages | Deferred |
| Per-Church white-label branding | Deferred |
| Retiring legacy `/` demo landing | Deferred; ADR 0001 dual entry. Event detail legacy path retired via ADR 0004 / #58 |
| HOPE / #49 HITL sign-off | Automated gate shipped; human rows in `.specs/features/49-hope-polish-and-wcag-release-gate/hitl-signoff.md` |
