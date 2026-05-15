# Backlog: vertical slices (tracer bullets)

Parent product definition: `docs/prd/volunteer-management-platform.md`  
Presentation foundation: `docs/prd/web-client-design-system-shell-i18n.md`  
Domain glossary: `CONTEXT.md`

Completed slices are kept under **`done/`** for history. Active slices live in this directory; each links to a **GitHub issue** for workflow (assign, close, PR linking). **Spec bodies** in markdown are the source of truth.

Apply label **`ready-for-agent`** on GitHub when that slice’s blockers are cleared.

## Active backlog (dependency order)

| Slice | Spec | GH | Type | Summary |
|------:|------|----|------|---------|
| 15 | `15-organization-context-reads.md` | [#5](https://github.com/kairan/onda-volunteer/issues/5) | AFK | Real **Church** / **Campus** reads → shell switchers |
| 30 | `30-auth-gate-volunteer-provisioning.md` | [#22](https://github.com/kairan/onda-volunteer/issues/22) | HITL | Auth gate + **Volunteer** provisioning (full sign-in cycle) |
| 16 | `16-identity-persisted-ui-locale.md` | [#6](https://github.com/kairan/onda-volunteer/issues/6) | AFK | Persist **Language switcher** on **Identity** |
| 17 | `17-dashboard-my-upcoming-assignments.md` | [#7](https://github.com/kairan/onda-volunteer/issues/7) | AFK | **Dashboard** upcoming **Assignments** |
| 18 | `18-time-away-list-create-unavailability.md` | [#8](https://github.com/kairan/onda-volunteer/issues/8) | AFK | **Time away** list + create |
| 19 | `19-time-away-bulk-mirror-ministries.md` | [#11](https://github.com/kairan/onda-volunteer/issues/11) | AFK | Bulk mirror **Unavailability** |
| 20 | `20-scheduling-event-list.md` | [#9](https://github.com/kairan/onda-volunteer/issues/9) | AFK | **Scheduling** **Event** list |
| 21 | `21-event-roster-read-in-shell.md` | [#12](https://github.com/kairan/onda-volunteer/issues/12) | AFK | Event roster **read** in shell |
| 22 | `22-event-roster-assign-and-release.md` | [#16](https://github.com/kairan/onda-volunteer/issues/16) | AFK | Roster assign + release |
| 23 | `23-leader-manages-volunteer-unavailability.md` | [#13](https://github.com/kairan/onda-volunteer/issues/13) | AFK | **Leader** **Unavailability** writes |
| 24 | `24-admin-creates-public-event.md` | [#14](https://github.com/kairan/onda-volunteer/issues/14) | HITL | **Admin** **Public event** create |
| 25 | `25-leader-creates-private-event.md` | [#15](https://github.com/kairan/onda-volunteer/issues/15) | AFK | **Leader** **Private event** create |
| 26 | `26-pending-membership-ux.md` | [#17](https://github.com/kairan/onda-volunteer/issues/17) | AFK | **Pending** membership messaging |
| 27 | `27-role-catalog-maintain-retire.md` | [#10](https://github.com/kairan/onda-volunteer/issues/10) | HITL | **Role** catalog + **Retire** |
| 28 | `28-admin-cancels-event-voids-assignments.md` | [#18](https://github.com/kairan/onda-volunteer/issues/18) | HITL | Cancel **Event** → void **Assignments** |
| 29 | `29-personal-local-time-presentation.md` | [#19](https://github.com/kairan/onda-volunteer/issues/19) | AFK | Personal-local time toggle |

## Completed (`done/`)

| Order | File | Summary |
|------:|------|---------|
| 1–7 | `done/01` … `done/07` | Platform tracer bullets + auth |
| 8–14 | `done/08` … `done/14` | Web shell epic (**09**–**14**) |
