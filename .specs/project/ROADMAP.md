# Roadmap

High-level milestones for TLC planning. Detailed acceptance criteria and shipped work live in **[`docs/issues/`](../../docs/issues/)** (open specs at repo root of that folder; completed work under `done/`).

## Themes

1. **Scheduling & events** — private/public events, assignments, conflicts, cancellation.
2. **Availability** — unavailability, time away UX, leader-managed blocks.
3. **Organization** — ministries, roles, membership, leader/admin stewardship.
4. **Web shell & i18n** — Onda brand, pt-BR default, leader/volunteer dashboards (`apps/web-onda` — serve-well presentation + API).

## How to use this file

- TLC **Specify** for a new feature: add or update a row under the relevant theme, then create `.specs/features/<slug>/spec.md`.
- When an issue ships, move its spec to `docs/issues/done/`, update this file and [`docs/issues/README.md`](../../docs/issues/README.md), then archive TLC artifacts per **AD-001** (see [`.specs/project/STATE.md`](STATE.md)).

## Active backlog

| Theme | Feature | Status | TLC / spec |
|-------|---------|--------|------------|
| **Scheduling & events** | `role-slot-capacity-per-event` | Open (#165) | [`.specs/features/role-slot-capacity-per-event/`](../features/role-slot-capacity-per-event/) |
| **Web shell & i18n** | `ui-refresh-onda-brand` | Design source (provisional); superseded by #180 for official tokens | [`.specs/features/ui-refresh-onda-brand/`](../features/ui-refresh-onda-brand/) |

**Frontend restart (shipped 2026-07-28):** **`apps/web-onda`** is the sole church-role frontend after **#175** cutover (PR [#184](https://github.com/kairan/onda-volunteer/pull/184)). TLC archived: [`.specs/archive/features/frontend-restart-serve-well-base/`](../archive/features/frontend-restart-serve-well-base/). ADR [0007](../../docs/adr/0007-frontend-serve-well-plus-api.md).

## Shipped summary

All product tracer bullets through web-next Slices 1–5 are shipped. Full index: [`docs/issues/README.md`](../../docs/issues/README.md) and [`docs/issues/done/`](../../docs/issues/done/). TLC planning history: [`.specs/archive/features/INDEX.md`](../archive/features/INDEX.md).

| Theme | Representative issues | Status |
|-------|----------------------|--------|
| **Web-onda cutover** | #175 | ✅ Shipped (PR #184) |
| **Web-onda BrandBook** | #180 | ✅ Shipped (PR #182) |
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
| `frontend-migration-web-next` Slice 6 ([#148](https://github.com/kairan/onda-volunteer/issues/148)) | **Frozen** 2026-07-01 — superseded by `frontend-restart-serve-well-base` (ADR 0007); do not execute cutover |
