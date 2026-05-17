# Backlog: vertical slices (tracer bullets)

Parent product definition: `docs/prd/volunteer-management-platform.md`  
Presentation foundation: `docs/prd/web-client-design-system-shell-i18n.md`  
HOPE design system migration: `docs/prd/hope-design-system-migration.md`  
Domain glossary: `CONTEXT.md`

Completed slices are kept under **`done/`** for history. Active slices live in this directory; each links to a **GitHub issue** for workflow (assign, close, PR linking). **Spec bodies** in markdown are the source of truth.

Apply label **`ready-for-agent`** on GitHub when that slice’s blockers are cleared.

## Active backlog (dependency order)

| Slice | Spec | GH | Type | Summary |
|------:|------|----|------|---------|
| 34 | `34-scheduling-hub-event-list-visibility.md` | [#36](https://github.com/kairan/onda-volunteer/issues/36) | AFK | **Scheduling** **Event** list + read visibility |
| 35 | `35-event-roster-read-inside-shell.md` | [#37](https://github.com/kairan/onda-volunteer/issues/37) | AFK | **Event** roster read inside shell |
| 36 | `36-event-roster-writes-assign-release-unavailability-offer.md` | [#38](https://github.com/kairan/onda-volunteer/issues/38) | AFK | Roster assign + release + optional **Unavailability** offer |
| 37 | `37-time-away-self-service-unavailability.md` | [#39](https://github.com/kairan/onda-volunteer/issues/39) | AFK | **Time away** list + create |
| 38 | `38-time-away-bulk-mirror-ministries.md` | [#40](https://github.com/kairan/onda-volunteer/issues/40) | AFK | Bulk mirror **Unavailability** |
| 39 | `39-leader-manages-volunteer-unavailability.md` | [#41](https://github.com/kairan/onda-volunteer/issues/41) | AFK | **Leader** **Unavailability** writes |
| 40 | `40-admin-creates-public-event.md` | [#42](https://github.com/kairan/onda-volunteer/issues/42) | HITL | **Admin** **Public event** create |
| 41 | `41-leader-creates-rosters-private-event.md` | [#43](https://github.com/kairan/onda-volunteer/issues/43) | HITL | **Leader** **Private event** create + roster |
| 42 | `42-role-catalog-maintain-rename-retire.md` | [#44](https://github.com/kairan/onda-volunteer/issues/44) | HITL | **Role** catalog maintain/rename/**Retire** |
| 43 | `43-admin-cancels-event-voids-assignments.md` | [#45](https://github.com/kairan/onda-volunteer/issues/45) | HITL | Cancel **Event** → void **Assignments** |
| 44 | `44-admin-manages-ministry-membership-lifecycle.md` | [#46](https://github.com/kairan/onda-volunteer/issues/46) | HITL | **Admin** membership lifecycle |
| 45 | `45-admin-delegates-leaders-across-churches.md` | [#47](https://github.com/kairan/onda-volunteer/issues/47) | HITL | **Admin** delegates **Leaders** |
| 46 | `46-personal-local-time-i18n-closeout.md` | [#48](https://github.com/kairan/onda-volunteer/issues/48) | AFK | Personal-local time + i18n closeout |
| 47 | `47-hope-polish-wcag-release-gate.md` | [#49](https://github.com/kairan/onda-volunteer/issues/49) | HITL | HOPE polish + WCAG release gate |

## Completed (`done/`)

| Order | File | Summary |
|------:|------|---------|
| 1–7 | `done/01` … `done/07` | Platform tracer bullets + auth |
| 8–14 | `done/08` … `done/14` | Web shell epic (**09**–**14**) |
| 15 | `done/15-organization-context-reads.md` | Real **Church** / **Campus** reads → shell switchers |
| 16 | `done/16-identity-persisted-ui-locale.md` | Persist **Language switcher** on **Identity** |
| 17 | `done/17-dashboard-my-upcoming-assignments.md` | **Dashboard** upcoming **Assignments** |
| 18 | `done/18-time-away-list-create-unavailability.md` | **Time away** list + create |
| 19 | `done/19-time-away-bulk-mirror-ministries.md` | Bulk mirror **Unavailability** |
| 20 | `done/20-scheduling-event-list.md` | **Scheduling** **Event** list |
| 21 | `done/21-event-roster-read-in-shell.md` | Event roster **read** in shell |
| 22 | `done/22-event-roster-assign-and-release.md` | Roster assign + release |
| 23 | `done/23-leader-manages-volunteer-unavailability.md` | **Leader** **Unavailability** writes |
| 24 | `done/24-admin-creates-public-event.md` | **Admin** **Public event** create |
| 25 | `done/25-leader-creates-private-event.md` | **Leader** **Private event** create |
| 26 | `done/26-pending-membership-ux.md` | **Pending** membership messaging |
| 27 | `done/27-role-catalog-maintain-retire.md` | **Role** catalog + **Retire** |
| 28 | `done/28-admin-cancels-event-voids-assignments.md` | Cancel **Event** → void **Assignments** |
| 29 | `done/29-personal-local-time-presentation.md` | Personal-local time toggle |
| 30 | `done/30-auth-gate-volunteer-provisioning.md` | Auth gate + **Volunteer** provisioning |
| 31–33 | `done/31` … `done/33` | HOPE design system migration |
