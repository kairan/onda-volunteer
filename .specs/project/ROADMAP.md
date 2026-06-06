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


### Shipped features (as of 2026-06-06)

| Theme | Feature slug | Issues | Status |
|-------|--------------|--------|--------|
| **Organization** | `organization-structure-administration` (P1 — Ministry create/rename) | [#109](https://github.com/kairan/onda-volunteer/issues/109) | ✅ Shipped |
| **Organization** | `organization-structure-administration` (P2 — Campus metadata/timezone) | [#107](https://github.com/kairan/onda-volunteer/issues/107) | ✅ Shipped |
| **Organization** | `organization-structure-administration` (Church metadata — CHURCH-META-01) | [#93](https://github.com/kairan/onda-volunteer/issues/93) | ✅ Shipped |
| **Organization** | `system-admin-platform` (System Admin operator dashboard) | [#87](https://github.com/kairan/onda-volunteer/issues/87)–[#93](https://github.com/kairan/onda-volunteer/issues/93) | ✅ Shipped |
| **Organization** | `organization-structure-administration` (Ministry archive — ORG-STRUCT-06) | [#108](https://github.com/kairan/onda-volunteer/issues/108) | ✅ Shipped |

### Active backlog (ready for agent / next Execute)

| Priority | Feature slug | Theme | Issue | TLC Spec | Status |
|---------:|--------------|-------|-------|----------|--------|
| 1 | `org-structure-doc-closeout` | **Organization** (doc) | [#118](https://github.com/kairan/onda-volunteer/issues/118) | `.specs/features/org-structure-doc-closeout/` | Phase 2 unblocked — run `T-DOC-04`–`T-DOC-10` |
| 2 | `leader-roster-assignment-ui` | **Scheduling** | [#115](https://github.com/kairan/onda-volunteer/issues/115) | `.specs/features/leader-roster-assignment-ui/` | `ready-for-agent` — all assumptions locked 2026-06-06 |
| 3 | `event-edit-reschedule` | **Scheduling** | [#117](https://github.com/kairan/onda-volunteer/issues/117) | `.specs/features/event-edit-reschedule/` | `ready-for-agent` — all assumptions locked 2026-06-06 |
| 4 | `volunteer-onboarding-invite` | **Organization / Identity** | [#116](https://github.com/kairan/onda-volunteer/issues/116) | `.specs/features/volunteer-onboarding-invite/` | `ready-for-agent` — all assumptions locked 2026-06-06 |

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
