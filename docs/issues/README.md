# Backlog: vertical slices (tracer bullets)

Parent product definition: `docs/prd/volunteer-management-platform.md`  
Presentation foundation: `docs/prd/web-client-design-system-shell-i18n.md`  
HOPE design system migration: `docs/prd/hope-design-system-migration.md`  
Domain glossary: `CONTEXT.md`  
Architecture tech debt index: `architecture-debt.md`

Completed slices are kept under **`done/`** for history. Active specs live in this directory; **the numeric prefix on each filename equals the GitHub issue number** (e.g. `148-web-next-migration-slice-6-cutover.md` → [#148](https://github.com/kairan/onda-volunteer/issues/148)). Pre–GitHub-number tracer bullets are indexed in [`done/legacy-INDEX.md`](done/legacy-INDEX.md).

Apply label **`ready-for-agent`** on GitHub when that issue's blockers are cleared.

## Active backlog

**Frontend rebuild (`web-next`)** — parallel strangler migration; TLC [`.specs/features/frontend-migration-web-next/`](../.specs/features/frontend-migration-web-next/). Slices 1–5 shipped ([#143](https://github.com/kairan/onda-volunteer/issues/143)–[#147](https://github.com/kairan/onda-volunteer/issues/147)); execute queue:

| Issue | Slice | Tasks | Spec |
|------:|-------|-------|------|
| [#148](https://github.com/kairan/onda-volunteer/issues/148) | CI parity & cutover | T27–T30 (T28 ✅) | `148-web-next-migration-slice-6-cutover.md` |

Apply label **`ready-for-agent`** on #148 (blockers cleared 2026-06-24).

Design source for migration: [`.specs/features/ui-refresh-onda-brand/`](../.specs/features/ui-refresh-onda-brand/) (consumed by web-next; no standalone execute).

## Architecture tech debt

All architecture-debt waves **shipped** ([#54](https://github.com/kairan/onda-volunteer/issues/54)–[#58](https://github.com/kairan/onda-volunteer/issues/58), [#61](https://github.com/kairan/onda-volunteer/issues/61)). See [`architecture-debt.md`](architecture-debt.md) for the completed index.

## Recently archived (`done/`)

| Issue | Spec |
|------:|------|
| [#165](https://github.com/kairan/onda-volunteer/issues/165) | `done/165-role-slot-capacity-per-event.md` |
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
