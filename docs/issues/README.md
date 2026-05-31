# Backlog: vertical slices (tracer bullets)

Parent product definition: `docs/prd/volunteer-management-platform.md`  
Presentation foundation: `docs/prd/web-client-design-system-shell-i18n.md`  
HOPE design system migration: `docs/prd/hope-design-system-migration.md`  
Domain glossary: `CONTEXT.md`  
Architecture tech debt index: `architecture-debt.md`

Completed slices are kept under **`done/`** for history. Active specs live in this directory; **the numeric prefix on each filename equals the GitHub issue number** (e.g. `40-time-away-bulk-mirror-ministries.md` → [#40](https://github.com/kairan/onda-volunteer/issues/40)). Archived specs under `done/` keep the issue/spec number they shipped or closed under; historical specs under `done/legacy-*` keep the old tracer-bullet slice id in the filename only.

Apply label **`ready-for-agent`** on GitHub when that issue’s blockers are cleared.

## Active backlog (dependency order)

**System Admin platform** — execution chains and parallelism: [`.specs/features/system-admin-platform/parallel-execution.md`](../.specs/features/system-admin-platform/parallel-execution.md).

| Issue | Spec | Type | Status | Summary |
|------:|------|------|--------|---------|
| [#87](https://github.com/kairan/onda-volunteer/issues/87) | `87-system-admin-chain-0-documentation.md` | Docs | Done | ADR 0005, CONTEXT/PRD, runbooks (T-SYS-01–03) |
| [#88](https://github.com/kairan/onda-volunteer/issues/88) | `88-system-admin-chain-1-identity-shell.md` | Feature | Active | P1: System Admin identity + `/system-admin` shell (T-SYS-04–10) |
| [#89](https://github.com/kairan/onda-volunteer/issues/89) | `89-system-admin-chain-2-church-provisioning.md` | Feature | Active | P2: Create church + campus (T-SYS-11–13); blocked by #88 |
| [#90](https://github.com/kairan/onda-volunteer/issues/90) | `90-system-admin-chain-3-admin-invite.md` | Feature | Active | P3: Invite church Admin by email (T-SYS-14–18); blocked by #88, #89 |
| [#91](https://github.com/kairan/onda-volunteer/issues/91) | `91-system-admin-chain-4-stewardship.md` | Feature | Active | P4: User/role stewardship (T-SYS-19–23); blocked by #88 |
| [#92](https://github.com/kairan/onda-volunteer/issues/92) | `92-system-admin-chain-5-scheduling-readonly.md` | Feature | Active | P5: Read-only scheduling support (T-SYS-24–26); blocked by #88 |
| [#93](https://github.com/kairan/onda-volunteer/issues/93) | `93-church-admin-church-metadata.md` | Feature | Active | CHURCH-META: Admin edits church name/timezone (T-CHURCH-01–03); no blocker |

## Architecture tech debt

Not product features. Specs in this directory; tracked on GitHub with label **`tech-debt`**. See `architecture-debt.md`.

| Issue | Spec | Summary | Schedule |
|------:|------|---------|----------|
| [#54](https://github.com/kairan/onda-volunteer/issues/54) | `done/54-api-scheduling-invariants-module.md` | Pure **Scheduling** rules + unit tests | Shipped |
| [#55](https://github.com/kairan/onda-volunteer/issues/55) | `done/55-api-request-scoped-auth-context.md` | Nest request-scoped auth | Shipped |
| [#56](https://github.com/kairan/onda-volunteer/issues/56) | `done/56-api-church-stewardship-access-module.md` | Consolidate church access queries | Shipped |
| [#57](https://github.com/kairan/onda-volunteer/issues/57) | `done/57-api-assignment-route-under-scheduling.md` | Move assign POST to **Scheduling** | Shipped |
| [#58](https://github.com/kairan/onda-volunteer/issues/58) | `done/58-web-retire-legacy-event-routes.md` | Retire `/events/$eventId` (redirect → shell) | Shipped (ADR 0004) |

## Recently archived (`done/`)

| Issue | Spec |
|------:|------|
| local #61 / PR [#83](https://github.com/kairan/onda-volunteer/pull/83) | `done/61-ci-lint-and-coverage.md` |
| [#58](https://github.com/kairan/onda-volunteer/issues/58) | `done/58-web-retire-legacy-event-routes.md` |
| [#57](https://github.com/kairan/onda-volunteer/issues/57) | `done/57-api-assignment-route-under-scheduling.md` |
| [#56](https://github.com/kairan/onda-volunteer/issues/56) | `done/56-api-church-stewardship-access-module.md` |
| [#55](https://github.com/kairan/onda-volunteer/issues/55) | `done/55-api-request-scoped-auth-context.md` |
| [#54](https://github.com/kairan/onda-volunteer/issues/54) | `done/54-api-scheduling-invariants-module.md` |
| [#49](https://github.com/kairan/onda-volunteer/issues/49) | `done/49-hope-polish-wcag-release-gate.md` |
| [#48](https://github.com/kairan/onda-volunteer/issues/48) | `done/48-personal-local-time-i18n-closeout.md` |
| [#47](https://github.com/kairan/onda-volunteer/issues/47) | `done/47-admin-delegates-leaders-across-churches.md` |
| [#46](https://github.com/kairan/onda-volunteer/issues/46) | `done/46-admin-manages-ministry-membership-lifecycle.md` |
| [#45](https://github.com/kairan/onda-volunteer/issues/45) | `done/45-admin-cancels-event-voids-assignments.md` |
| [#44](https://github.com/kairan/onda-volunteer/issues/44) | `done/44-role-catalog-maintain-rename-retire.md` |
| [#43](https://github.com/kairan/onda-volunteer/issues/43) | `done/43-leader-creates-rosters-private-event.md` |
| [#42](https://github.com/kairan/onda-volunteer/issues/42) | `done/42-admin-creates-public-event.md` |
| [#41](https://github.com/kairan/onda-volunteer/issues/41) | `done/41-leader-manages-volunteer-unavailability.md` |
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
