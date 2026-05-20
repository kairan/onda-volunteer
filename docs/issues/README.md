# Backlog: vertical slices (tracer bullets)

Parent product definition: `docs/prd/volunteer-management-platform.md`  
Presentation foundation: `docs/prd/web-client-design-system-shell-i18n.md`  
HOPE design system migration: `docs/prd/hope-design-system-migration.md`  
Domain glossary: `CONTEXT.md`  
Architecture tech debt index: `architecture-debt.md`

Completed slices are kept under **`done/`** for history. Active slices live in this directory; each links to a **GitHub issue** for workflow (assign, close, PR linking). **Spec bodies** in markdown are the source of truth.

Apply label **`ready-for-agent`** on GitHub when that slice’s blockers are cleared.

## Active backlog (dependency order)

| Slice | Spec | GH | Type | Status | Summary |
|------:|------|----|------|--------|---------|
| 35 | `35-event-roster-read-inside-shell.md` | [#37](https://github.com/kairan/onda-volunteer/issues/37) | AFK | **Next** | **Event** roster read inside shell |
| 36 | `36-event-roster-writes-assign-release-unavailability-offer.md` | [#38](https://github.com/kairan/onda-volunteer/issues/38) | AFK | Blocked on 35 | Roster assign + release + optional **Unavailability** offer |
| 38 | `38-time-away-bulk-mirror-ministries.md` | [#40](https://github.com/kairan/onda-volunteer/issues/40) | AFK | Open | Bulk mirror **Unavailability** |
| 39 | `39-leader-manages-volunteer-unavailability.md` | [#41](https://github.com/kairan/onda-volunteer/issues/41) | AFK | Open | **Leader** **Unavailability** writes |
| 40 | `40-admin-creates-public-event.md` | [#42](https://github.com/kairan/onda-volunteer/issues/42) | HITL | Open | **Admin** **Public event** create |
| 41 | `41-leader-creates-rosters-private-event.md` | [#43](https://github.com/kairan/onda-volunteer/issues/43) | HITL | Open | **Leader** **Private event** create + roster |
| 42 | `42-role-catalog-maintain-rename-retire.md` | [#44](https://github.com/kairan/onda-volunteer/issues/44) | HITL | Open | **Role** catalog maintain/rename/**Retire** |
| 43 | `43-admin-cancels-event-voids-assignments.md` | [#45](https://github.com/kairan/onda-volunteer/issues/45) | HITL | Open | Cancel **Event** → void **Assignments** |
| 44 | `44-admin-manages-ministry-membership-lifecycle.md` | [#46](https://github.com/kairan/onda-volunteer/issues/46) | HITL | Open | **Admin** membership lifecycle |
| 45 | `45-admin-delegates-leaders-across-churches.md` | [#47](https://github.com/kairan/onda-volunteer/issues/47) | HITL | Open | **Admin** delegates **Leaders** |
| 46 | `46-personal-local-time-i18n-closeout.md` | [#48](https://github.com/kairan/onda-volunteer/issues/48) | AFK | Open | Personal-local time + i18n closeout |
| 47 | `47-hope-polish-wcag-release-gate.md` | [#49](https://github.com/kairan/onda-volunteer/issues/49) | HITL | Open | HOPE polish + WCAG release gate |

## Architecture tech debt (slices 48–52)

Not product features. Specs in this directory; tracked on GitHub with label **`tech-debt`**. See `architecture-debt.md`.

| Slice | Spec | Summary | Schedule |
|------:|------|---------|----------|
| 48 | `48-api-scheduling-invariants-module.md` | Pure **Scheduling** rules + unit tests | After **36** · [#54](https://github.com/kairan/onda-volunteer/issues/54) |
| 49 | `49-api-request-scoped-auth-context.md` | Nest request-scoped auth | After **47** · [#55](https://github.com/kairan/onda-volunteer/issues/55) |
| 50 | `50-api-church-stewardship-access-module.md` | Consolidate church access queries | With **40–43** or post-**47** · [#56](https://github.com/kairan/onda-volunteer/issues/56) |
| 51 | `51-api-assignment-route-under-scheduling.md` | Move assign POST to **Scheduling** | After **36** · [#57](https://github.com/kairan/onda-volunteer/issues/57) |
| 52 | `52-web-retire-legacy-event-routes.md` | Retire `/events/$eventId` (PRD-gated) | After **35** + **36** · [#58](https://github.com/kairan/onda-volunteer/issues/58) |

## Recently shipped (moved to `done/`)

| Slice | Spec | GH |
|------:|------|-----|
| 34 | `done/34-scheduling-hub-event-list-visibility.md` | [#36](https://github.com/kairan/onda-volunteer/issues/36) |
| 37 | `done/37-time-away-self-service-unavailability.md` | [#39](https://github.com/kairan/onda-volunteer/issues/39) |

## Completed (`done/`)

| Order | File | Summary |
|------:|------|---------|
| 1–7 | `done/01` … `done/07` | Platform tracer bullets + auth |
| 8–14 | `done/08` … `done/14` | Web shell epic (**09**–**14**) |
| 15 | `done/15-organization-context-reads.md` | Real **Church** / **Campus** reads → shell switchers |
| 16 | `done/16-identity-persisted-ui-locale.md` | Persist **Language switcher** on **Identity** |
| 17 | `done/17-dashboard-my-upcoming-assignments.md` | **Dashboard** upcoming **Assignments** |
| 18 | `done/18-time-away-list-create-unavailability.md` | **Time away** list + create (earlier slice) |
| 19 | `done/19-time-away-bulk-mirror-ministries.md` | Bulk mirror **Unavailability** (earlier slice) |
| 20 | `done/20-scheduling-event-list.md` | **Scheduling** **Event** list (earlier slice) |
| 21 | `done/21-event-roster-read-in-shell.md` | Event roster **read** in shell (earlier slice) |
| 22 | `done/22-event-roster-assign-and-release.md` | Roster assign + release (earlier slice) |
| 23–33 | `done/23` … `done/33` | Leader unavailability, admin/leader events, HOPE migration, etc. |
| 34 | `done/34-scheduling-hub-event-list-visibility.md` | **Scheduling** hub (**34**, GH **#36**) |
| 37 | `done/37-time-away-self-service-unavailability.md` | **Time away** self-service (**37**, GH **#39**) |
