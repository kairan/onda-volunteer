# Backlog: vertical slices (tracer bullets)

Parent product definition: `docs/prd/volunteer-management-platform.md`  
Presentation foundation: `docs/prd/web-client-design-system-shell-i18n.md`  
HOPE design system migration: `docs/prd/hope-design-system-migration.md`  
Domain glossary: `CONTEXT.md`  
Architecture tech debt index: `architecture-debt.md`

Completed slices are kept under **`done/`** for history. Active specs live in this directory; **the numeric prefix on each filename equals the GitHub issue number** (e.g. `148-web-next-migration-slice-6-cutover.md` → [#148](https://github.com/kairan/onda-volunteer/issues/148)). Pre–GitHub-number tracer bullets are indexed in [`done/legacy-INDEX.md`](done/legacy-INDEX.md).

Apply label **`ready-for-agent`** on GitHub when that issue's blockers are cleared.

## Active backlog

**Frontend restart (`web-onda`)** — Phase 5 cutover Execute complete on branch; Verifier + merge pending. TLC [`.specs/features/frontend-restart-serve-well-base/`](../.specs/features/frontend-restart-serve-well-base/). ADR [0007](../adr/0007-frontend-serve-well-plus-api.md).

| Issue | Feature | Tasks | Spec |
|------:|---------|-------|------|
| [#175](https://github.com/kairan/onda-volunteer/issues/175) | web-onda Phase 5 — Cutover | T17 | `done/175-web-onda-phase-5-cutover.md` (Execute done; Verifier pending) |

**Shipped:** [#180](https://github.com/kairan/onda-volunteer/issues/180) BrandBook 2027 (PR [#182](https://github.com/kairan/onda-volunteer/pull/182)) — `done/180-web-onda-official-brandbook.md` · [#174](https://github.com/kairan/onda-volunteer/issues/174) admin slice (PR [#178](https://github.com/kairan/onda-volunteer/pull/178)) — `done/174-web-onda-phase-4-admin.md` · [#173](https://github.com/kairan/onda-volunteer/issues/173) leader slice (PR [#177](https://github.com/kairan/onda-volunteer/pull/177)) — `done/173-web-onda-phase-3-leader.md` · [#172](https://github.com/kairan/onda-volunteer/issues/172) volunteer slice (PR [#176](https://github.com/kairan/onda-volunteer/pull/176)) — `done/172-web-onda-phase-2-volunteer.md` · [#170](https://github.com/kairan/onda-volunteer/issues/170) foundation (PR [#171](https://github.com/kairan/onda-volunteer/pull/171)) — `done/170-web-onda-foundation-phase-0-1.md`

**Superseded:** [#148](https://github.com/kairan/onda-volunteer/issues/148) (`frontend-migration-web-next` cutover) — closed 2026-07-01; TLC archived at cutover #175.

**Scheduling — role slot capacity** — TLC [`.specs/features/role-slot-capacity-per-event/`](../.specs/features/role-slot-capacity-per-event/). Complements UI-LEAD / Serve Well roster visual.

| Issue | Feature | Tasks | Spec |
|------:|---------|-------|------|
| [#165](https://github.com/kairan/onda-volunteer/issues/165) | Per-event role slot capacity | T01–T09 | `165-role-slot-capacity-per-event.md` |

Design source for migration: [`.specs/features/ui-refresh-onda-brand/`](../.specs/features/ui-refresh-onda-brand/) (consumed by web-next; no standalone execute).

## Architecture tech debt

All architecture-debt waves **shipped** ([#54](https://github.com/kairan/onda-volunteer/issues/54)–[#58](https://github.com/kairan/onda-volunteer/issues/58), [#61](https://github.com/kairan/onda-volunteer/issues/61)). See [`architecture-debt.md`](architecture-debt.md) for the completed index.

## Recently archived (`done/`)

| Issue | Spec |
|------:|------|
| [#175](https://github.com/kairan/onda-volunteer/issues/175) | `done/175-web-onda-phase-5-cutover.md` |
| [#180](https://github.com/kairan/onda-volunteer/issues/180) | `done/180-web-onda-official-brandbook.md` |
| [#172](https://github.com/kairan/onda-volunteer/issues/172) | `done/172-web-onda-phase-2-volunteer.md` |
| [#170](https://github.com/kairan/onda-volunteer/issues/170) | `done/170-web-onda-foundation-phase-0-1.md` |
| [#147](https://github.com/kairan/onda-volunteer/issues/147) | `done/147-web-next-migration-slice-5-system-admin.md` |
| [#146](https://github.com/kairan/onda-volunteer/issues/146) | `done/146-web-next-migration-slice-4-org-admin.md` |
| [#145](https://github.com/kairan/onda-volunteer/issues/145) | `done/145-web-next-migration-slice-3-leader.md` |
| [#144](https://github.com/kairan/onda-volunteer/issues/144) | `done/144-web-next-migration-slice-2-volunteer.md` |
| [#143](https://github.com/kairan/onda-volunteer/issues/143) | `done/143-web-next-migration-slice-1-foundation.md` |
| [#135](https://github.com/kairan/onda-volunteer/issues/135) | `done/135-web-i18n-language-alignment.md` |
| [#131](https://github.com/kairan/onda-volunteer/issues/131) | `done/131-glossary-inactive-membership.md` |
| [#129](https://github.com/kairan/onda-volunteer/issues/129) | `done/129-coverage-threshold-gates.md` |
| [#124](https://github.com/kairan/onda-volunteer/issues/124) | `done/124-invite-fulfillment-toast.md` |
| [#115](https://github.com/kairan/onda-volunteer/issues/115) | `done/115-leader-roster-assignment-ui.md` |

See `done/` for the full archive (49 numbered specs + [`legacy-INDEX.md`](done/legacy-INDEX.md)). Shipped TLC planning detail: [`.specs/archive/features/INDEX.md`](../.specs/archive/features/INDEX.md).
