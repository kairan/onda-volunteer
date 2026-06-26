# 118 — Org structure doc closeout (pre- and post-#108)

**Type:** Documentation / tracker hygiene
**Status:** Shipped — Phase 1 in planning PR #119; Phase 2 executed 2026-06-09 after [#108](https://github.com/kairan/onda-volunteer/issues/108) shipped via #113
**TLC:** `.specs/archive/features/org-structure-doc-closeout/` (spec, tasks complete)

## Problem

The `organization-structure-administration` TLC feature shipped ([#108](https://github.com/kairan/onda-volunteer/issues/108) via #113), but several cross-cutting docs are stale and need updating in two phases.

## Phase 1 — Pre-Execute (doc-only, unblocked)

- **T-DOC-01** — `STATE.md`: add `2026-06-06 (Ministry archive #108)` Decisions entry covering three locked decisions: no unarchive in v1; shell switcher visibility (Admin/System Admin see archived with badge; others see nothing); i18n policy (agent drafts `en` + `pt-BR`, no HITL gate)
- **T-DOC-02** — `ROADMAP.md`: expand Organization theme to distinguish shipped slices (#109 P1, #107 P2 campus) from `ready-for-agent` backlog (#108); add system-admin-platform as shipped
- **T-DOC-03** — `organization-structure-administration/spec.md`: ORG-STRUCT-07 row → "Shipped — see `.specs/archive/features/system-admin-platform/` (#87–93)"

## Phase 2 — Post-Execute (unblocked — run `T-DOC-04`–`T-DOC-10`)

- **T-DOC-04** — `organization-structure-administration/tasks.md`: check T-ARCHIVE-01–05
- **T-DOC-05 / T-DOC-06** — `spec.md`: ORG-STRUCT-06 → Verified; `design.md`: status → Verified
- **T-DOC-07** — Move `docs/issues/108-org-structure-ministry-archive-backlog.md` → `docs/issues/done/108-org-structure-ministry-archive.md`
- **T-DOC-08** — `docs/issues/README.md`: remove #108 from Active, add to Recently archived
- **T-DOC-09** — ROADMAP.md: Organization theme → fully shipped
- **T-DOC-10** — STATE.md: add org-structure closeout note

## Acceptance criteria (Phase 1)

- [x] STATE.md Decisions section includes `2026-06-06 (Ministry archive #108)` with all 3 policy points (DOC-CLOSE-01)
- [x] ROADMAP.md Organization theme distinguishes shipped (#109, #107) from backlog (#108 `ready-for-agent`) and includes system-admin-platform as shipped (DOC-CLOSE-02)
- [x] `organization-structure-administration/spec.md` ORG-STRUCT-07 row reads "Shipped — see system-admin-platform (#87–93)" (DOC-CLOSE-03)

## Acceptance criteria (Phase 2, after #108 merges)

- [x] All T-ARCHIVE-* tasks marked `[x]` in `organization-structure-administration/tasks.md` (DOC-CLOSE-04)
- [x] `spec.md` ORG-STRUCT-06 status = "Verified"; status block = "Implemented — Execute verified (#108)" (DOC-CLOSE-05, DOC-CLOSE-06)
- [x] `docs/issues/done/108-org-structure-ministry-archive.md` exists with all criteria `[x]` (DOC-CLOSE-07)
- [x] `docs/issues/README.md` #108 row moved from Active to Recently archived (DOC-CLOSE-08)
- [x] ROADMAP.md Organization theme shows no remaining open backlog items (DOC-CLOSE-09)
- [x] STATE.md has org-structure closeout note referencing #107, #108, #109 (DOC-CLOSE-10)

## Specification links

- Spec: `.specs/archive/features/org-structure-doc-closeout/spec.md` (DOC-CLOSE-01–10)
- Tasks: `.specs/archive/features/org-structure-doc-closeout/tasks.md`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/118
