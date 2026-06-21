# Roadmap

High-level milestones for TLC planning. Detailed acceptance criteria and shipped work live in **[`docs/issues/`](../../docs/issues/)** (open specs at repo root of that folder; completed work under `done/`).

## Themes

1. **Scheduling & events** — private/public events, assignments, conflicts, cancellation.
2. **Availability** — unavailability, time away UX, leader-managed blocks.
3. **Organization** — ministries, roles, membership, leader/admin stewardship.
4. **Web shell & i18n** — design system, pt-BR default, leader/volunteer dashboards.

## How to use this file

- TLC **Specify** for a new feature: add or update a row under the relevant theme, then create `.specs/features/<slug>/spec.md`.
- When an issue ships, move its spec to `docs/issues/done/` and link from the feature spec if needed.

## 2026-05-27 TLC missing-feature audit

**Inputs reviewed:** Platform PRD, web shell/i18n PRD, HOPE migration PRD, ADRs 0001-0003, `CONTEXT.md`, `docs/issues/README.md`, `docs/issues/architecture-debt.md`, completed issue specs under `docs/issues/done/`, and the GitHub issue tracker.

**Tracker state:** GitHub currently has no open issues. Several archived issue specs still contain stale unchecked acceptance boxes, but the corresponding GitHub issues are closed as completed and `docs/issues/README.md` lists them as shipped or archived. Treat the tracker state and issue index as canonical unless a follow-up verification finds missing code.

### Shipped PRD coverage

| Theme | Covered by |
|-------|------------|
| **Identity** | Supabase/JWT identity mapping, auth gate, request-scoped auth context, and server-persisted UI locale (`done/legacy-07-*`, `done/legacy-30-*`, `done/55-*`, `done/legacy-16-*`). |
| **Organization** | Church/Campus context reads, ministry membership lifecycle, leader delegation, role catalog management, and church stewardship access consolidation (`done/legacy-15-*`, `done/46-*`, `done/47-*`, `done/44-*`, `done/56-*`). |
| **Availability** | Volunteer self-service Time away, bulk mirror across ministries, and leader-managed Unavailability (`done/39-*`, `done/40-*`, `done/41-*`). |
| **Scheduling** | Event list/read/write tracer bullets, public event creation, private event creation/rostering, assignment release + optional Unavailability offer, event cancellation, and Scheduling invariant hardening (`done/36-*`, `done/37-*`, `done/38-*`, `done/42-*`, `done/43-*`, `done/45-*`, `done/54-*`, `done/57-*`). |
| **Web shell & i18n** | Shell/routing/i18n foundation, HOPE migration, personal-local time closeout, WCAG/HOPE polish, Playwright e2e, and CI lint/coverage reporting (`done/legacy-08-*` through `legacy-14-*`, `done/48-*`, `done/49-*`, `done/60-*`, `done/61-*`). |


### Shipped features (as of 2026-06-09)

| Theme | Feature slug | Issues | Status |
|-------|--------------|--------|--------|
| **Organization** | `organization-structure-administration` (P1 — Ministry create/rename) | [#109](https://github.com/kairan/onda-volunteer/issues/109) | ✅ Shipped |
| **Organization** | `organization-structure-administration` (P2 — Campus metadata/timezone) | [#107](https://github.com/kairan/onda-volunteer/issues/107) | ✅ Shipped |
| **Organization** | `organization-structure-administration` (Church metadata — CHURCH-META-01) | [#93](https://github.com/kairan/onda-volunteer/issues/93) | ✅ Shipped |
| **Organization** | `system-admin-platform` (System Admin operator dashboard) | [#87](https://github.com/kairan/onda-volunteer/issues/87)–[#93](https://github.com/kairan/onda-volunteer/issues/93) | ✅ Shipped |
| **Organization** | `organization-structure-administration` (Ministry archive — ORG-STRUCT-06) | [#108](https://github.com/kairan/onda-volunteer/issues/108) | ✅ Shipped |
| **Organization** | `org-structure-doc-closeout` (doc closeout — theme fully shipped) | [#118](https://github.com/kairan/onda-volunteer/issues/118) | ✅ Shipped |

**Organization theme:** fully shipped — all `organization-structure-administration` slices (ORG-STRUCT-01–06) verified ([#107](https://github.com/kairan/onda-volunteer/issues/107), [#108](https://github.com/kairan/onda-volunteer/issues/108), [#109](https://github.com/kairan/onda-volunteer/issues/109)) and `system-admin-platform` shipped ([#87](https://github.com/kairan/onda-volunteer/issues/87)–[#93](https://github.com/kairan/onda-volunteer/issues/93)). No open org-structure backlog.

### Shipped features (2026-06-11 closeout)

| Theme | Feature slug | Issues | Status |
|-------|--------------|--------|--------|
| **Hygiene / CI** | `coverage-threshold-gates` | [#129](https://github.com/kairan/onda-volunteer/issues/129) | ✅ Shipped |
| **Hygiene / CI** | `web-typecheck-strict-clean` | [#128](https://github.com/kairan/onda-volunteer/issues/128) | ✅ Shipped |
| **Hygiene / CI** | `eslint-baseline-clean` | [#126](https://github.com/kairan/onda-volunteer/issues/126) | ✅ Shipped |
| **Scheduling** | `leader-roster-assignment-ui` | [#115](https://github.com/kairan/onda-volunteer/issues/115) | ✅ Shipped |
| **Scheduling** | `event-edit-reschedule` | [#117](https://github.com/kairan/onda-volunteer/issues/117) | ✅ Shipped |
| **Organization / Identity** | `volunteer-onboarding-invite` | [#116](https://github.com/kairan/onda-volunteer/issues/116) | ✅ Shipped |
| **Organization / Identity** | `invite-fulfillment-toast` (ONBOARD-A5) | [#124](https://github.com/kairan/onda-volunteer/issues/124) | ✅ Shipped |

### Shipped features (2026-06-18 closeout)

| Theme | Feature slug | Issues | Status |
|-------|--------------|--------|--------|
| **Domain / Availability / Scheduling / i18n** | `ubiquitous-language-drift` | [#131](https://github.com/kairan/onda-volunteer/issues/131)–[#135](https://github.com/kairan/onda-volunteer/issues/135) | ✅ Shipped |

Glossary **Inactive** membership (GLOSS-01), inactive guard on Unavailability create (AVAIL-01), volunteer edit/delete own Unavailability (AVAIL-02), campus-authoritative event time display (SCHED-01), web i18n alignment (I18N-01). TLC: `.specs/features/ubiquitous-language-drift/`.

### Shipped features (2026-06-21 closeout)

| Theme | Feature slug | Issues | Status |
|-------|--------------|--------|--------|
| **Web shell & i18n** | `frontend-migration-web-next` (Slice 1 — foundation) | [#143](https://github.com/kairan/onda-volunteer/issues/143) | ✅ Shipped |

`apps/web-next` scaffold, Onda tokens, TanStack Query data core, shell + route parity, throwaway brand preview (T01–T13.5). TLC: `.specs/features/frontend-migration-web-next/`.

### Active backlog (ready for agent / next Execute)

| Theme | Feature slug | Status | TLC |
|-------|--------------|--------|-----|
| **Web shell & i18n** | `frontend-migration-web-next` (Slices 2–6) | Slice 1 shipped — [#144](https://github.com/kairan/onda-volunteer/issues/144)–[#148](https://github.com/kairan/onda-volunteer/issues/148) open | [`.specs/features/frontend-migration-web-next/`](../features/frontend-migration-web-next/) |
| **Web shell & i18n** | `ui-refresh-onda-brand` | Design source for the migration (no standalone in-place execute) | [`.specs/features/ui-refresh-onda-brand/`](../features/ui-refresh-onda-brand/) |

**Frontend rebuild (`web-next`):** parallel strangler migration — new `apps/web-next` on the same stack (React 19 · Vite · TanStack Router · Tailwind 4) plus TanStack Query, Onda brand tokens, route-by-route parity, single cutover. ADR [0006](../../docs/adr/0006-onda-brand-visual-system.md).

`ui-refresh-onda-brand` is now the **design authority** consumed by the migration (Onda tokens, typography, Volunteer/Leader layouts) rather than a separate in-place re-skin. Lovable reference: [`design-reference/serve-well/`](../../design-reference/serve-well/). Church Admin / System Admin redesign deferred (ported functionally with neutral tokens).

### Deferred or gated work, not active backlog

| Item | Status |
|------|--------|
| Household / non-sign-in Volunteers | Explicitly out of scope in `CONTEXT.md` and the Platform PRD. |
| Public Events spanning multiple Churches | Explicitly deferred by `CONTEXT.md` and the Platform PRD. |
| Email templates, push notifications, advanced audit UI, reporting dashboards, mobile apps | Platform PRD production-hardening items; do not plan until product priority changes. |
| Dark mode toggle | Token architecture supports it, but the web and HOPE PRDs defer the UI toggle. |
| Optimistic roster mutations / concurrent editor merge UI | Deferred by ADR 0001; Scheduling mutations remain pessimistic by default. |
| Full print layout for roster pagination | Web PRD and HOPE PRD preserve minimal print hygiene only. |
| Third locales beyond `pt-BR` and `en` | Deferred by the web PRD. |
| Marketing redesign of `/` and public landing pages | Deferred by the web and HOPE PRDs. |
| Per-Church white-label branding | Deferred by the web PRD and current brand/domain separation. |
| Retiring legacy `/` demo landing | Deferred; ADR 0001 dual entry. Event detail legacy path retired via ADR 0004 / issue 58. |
