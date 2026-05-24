# Backlog: vertical slices (tracer bullets)

Parent product definition: `docs/prd/volunteer-management-platform.md`  
Presentation foundation: `docs/prd/web-client-design-system-shell-i18n.md`  
HOPE design system migration: `docs/prd/hope-design-system-migration.md`  
Domain glossary: `CONTEXT.md`  
Architecture tech debt index: `architecture-debt.md`

Completed slices are kept under **`done/`** for history. Active specs live in this directory; **the numeric prefix on each filename equals the GitHub issue number** (e.g. `40-time-away-bulk-mirror-ministries.md` → [#40](https://github.com/kairan/onda-volunteer/issues/40)). Historical specs under `done/legacy-*` keep the old tracer-bullet slice id in the filename only.

Apply label **`ready-for-agent`** on GitHub when that issue’s blockers are cleared.

## Active backlog (dependency order)

| Issue | Spec | Type | Status | Summary |
|------:|------|------|--------|---------|
| [#41](https://github.com/kairan/onda-volunteer/issues/41) | `41-leader-manages-volunteer-unavailability.md` | AFK | **Next** (`ready-for-agent`) | **Leader** **Unavailability** writes |
| [#42](https://github.com/kairan/onda-volunteer/issues/42) | `42-admin-creates-public-event.md` | HITL | Open | **Admin** **Public event** create |
| [#43](https://github.com/kairan/onda-volunteer/issues/43) | `43-leader-creates-rosters-private-event.md` | HITL | Open | **Leader** **Private event** create + roster |
| [#44](https://github.com/kairan/onda-volunteer/issues/44) | `44-role-catalog-maintain-rename-retire.md` | HITL | Open | **Role** catalog maintain/rename/**Retire** |
| [#45](https://github.com/kairan/onda-volunteer/issues/45) | `45-admin-cancels-event-voids-assignments.md` | HITL | Open | Cancel **Event** → void **Assignments** |
| [#46](https://github.com/kairan/onda-volunteer/issues/46) | `46-admin-manages-ministry-membership-lifecycle.md` | HITL | Open | **Admin** membership lifecycle |
| [#47](https://github.com/kairan/onda-volunteer/issues/47) | `47-admin-delegates-leaders-across-churches.md` | HITL | Open | **Admin** delegates **Leaders** |
| [#48](https://github.com/kairan/onda-volunteer/issues/48) | `48-personal-local-time-i18n-closeout.md` | AFK | Open | Personal-local time + i18n closeout |
| [#49](https://github.com/kairan/onda-volunteer/issues/49) | `49-hope-polish-wcag-release-gate.md` | HITL | Open | HOPE polish + WCAG release gate |

## Architecture tech debt ([#54](https://github.com/kairan/onda-volunteer/issues/54)–[#58](https://github.com/kairan/onda-volunteer/issues/58))

Not product features. Specs in this directory; tracked on GitHub with label **`tech-debt`**. See `architecture-debt.md`.

| Issue | Spec | Summary | Schedule |
|------:|------|---------|----------|
| [#54](https://github.com/kairan/onda-volunteer/issues/54) | `54-api-scheduling-invariants-module.md` | Pure **Scheduling** rules + unit tests | After #38 (shipped) |
| [#55](https://github.com/kairan/onda-volunteer/issues/55) | `55-api-request-scoped-auth-context.md` | Nest request-scoped auth | After #49 |
| [#56](https://github.com/kairan/onda-volunteer/issues/56) | `56-api-church-stewardship-access-module.md` | Consolidate church access queries | With #42–#45 or post-#49 |
| [#57](https://github.com/kairan/onda-volunteer/issues/57) | `57-api-assignment-route-under-scheduling.md` | Move assign POST to **Scheduling** | After #38 (shipped) |
| [#58](https://github.com/kairan/onda-volunteer/issues/58) | `58-web-retire-legacy-event-routes.md` | Retire `/events/$eventId` (PRD-gated) | After #37 + #38 (shipped) |

## Recently shipped (`done/`)

| Issue | Spec |
|------:|------|
| [#60](https://github.com/kairan/onda-volunteer/issues/60) | `done/60-web-playwright-browser-e2e.md` |
| [#38](https://github.com/kairan/onda-volunteer/issues/38) | `done/38-event-roster-writes-assign-release-unavailability-offer.md` |
| [#37](https://github.com/kairan/onda-volunteer/issues/37) | `done/37-event-roster-read-inside-shell.md` |
| [#36](https://github.com/kairan/onda-volunteer/issues/36) | `done/36-scheduling-hub-event-list-visibility.md` |
| [#39](https://github.com/kairan/onda-volunteer/issues/39) | `done/39-time-away-self-service-unavailability.md` |

## Completed history (`done/legacy-*`)

Older tracer-bullet specs (filename prefix `legacy-NN` = original slice **NN**, not necessarily the GitHub issue number). Examples:

| Legacy file | Summary |
|-------------|---------|
| `done/legacy-01` … `legacy-07` | Platform tracer bullets + auth |
| `done/legacy-08` … `legacy-14` | Web shell epic |
| `done/legacy-15-organization-context-reads.md` | **Church** / **Campus** reads → shell switchers (GitHub [#5](https://github.com/kairan/onda-volunteer/issues/5)) |
| `done/legacy-17-dashboard-my-upcoming-assignments.md` | **Dashboard** upcoming **Assignments** ([#7](https://github.com/kairan/onda-volunteer/issues/7)) |
| `done/legacy-18-time-away-list-create-unavailability.md` | **Time away** list + create ([#8](https://github.com/kairan/onda-volunteer/issues/8)) |

See `done/` for the full archive.
