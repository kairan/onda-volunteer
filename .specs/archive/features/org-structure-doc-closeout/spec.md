# Org Structure Doc Closeout — Specification

## Status

- **Pre-Execute doc sync** (DOC-CLOSE-01–03): Done (planning PR #119).
- **Post-Execute doc sync** (DOC-CLOSE-04–10): **Done** — `T-DOC-04`–`T-DOC-10` executed 2026-06-09 after [#108](https://github.com/kairan/onda-volunteer/issues/108) shipped via #113. Feature complete; closes [#118](https://github.com/kairan/onda-volunteer/issues/118).

## Source references

- Feature spec: `.specs/archive/features/organization-structure-administration/spec.md`
- Feature design: `.specs/archive/features/organization-structure-administration/design.md`
- Feature tasks: `.specs/archive/features/organization-structure-administration/tasks.md`
- Archived issue spec: `docs/issues/done/108-org-structure-ministry-archive.md`
- Tracker index: `docs/issues/README.md`
- Domain glossary: `CONTEXT.md`
- Project state: `.specs/project/STATE.md`
- Roadmap: `.specs/project/ROADMAP.md`

## Problem Statement

The organization-structure-administration TLC feature shipped ([#108](https://github.com/kairan/onda-volunteer/issues/108) via #113). Some cross-cutting doc surfaces were stale before closeout; Phase 1 pre-Execute sync completed in #119; Phase 2 post-Execute tasks (`T-DOC-04`–`T-DOC-10`) executed 2026-06-09 — doc closeout complete ([#118](https://github.com/kairan/onda-volunteer/issues/118)).

### What is stale now (pre-Execute)

| Document | Stale item | Correct state |
|----------|-----------|---------------|
| `.specs/project/STATE.md` | 2026-06-06 product decisions for #108 (no unarchive in v1; shell switcher visibility rules; i18n policy) are documented in `design.md` and the issue spec but **not reflected** in the Decisions section of STATE.md | Add entry: `2026-06-06 (Ministry archive #108)` with three locked decisions |
| `.specs/project/ROADMAP.md` | Organization theme row shows only `organization-structure-administration` candidate; does not surface that P1 (#109) and P2 campus (#107) shipped, nor that ministry archive (#108) is `ready-for-agent` | Update row to show shipped + backlog items |
| `organization-structure-administration/spec.md` | ORG-STRUCT-07 traceability row says "Pending — split to `system-admin-platform`"; `system-admin-platform` shipped completely (#87–93) | Update to "Shipped — see `.specs/archive/features/system-admin-platform/`" |

### What needs to happen post-Execute (#108 merge)

Follow ONDA.md closing order:
1. `organization-structure-administration/tasks.md` — check T-ARCHIVE-01 through T-ARCHIVE-05
2. `organization-structure-administration/spec.md` — ORG-STRUCT-06 traceability → "Verified"; status block → "Implemented"
3. `docs/issues/108-*.md` — move to `docs/issues/done/108-org-structure-ministry-archive.md`
4. `docs/issues/README.md` — move #108 from Active to Recently archived
5. `.specs/project/ROADMAP.md` — mark Organization theme fully shipped
6. `.specs/project/STATE.md` — add org-structure completion note

## Goals

- [x] Pre-Execute: resolve three known stale items in STATE.md, ROADMAP.md, and spec.md before #108 Execute begins.
- [x] Post-Execute: complete the ONDA.md closing checklist for the full `organization-structure-administration` feature when #108 merges.

## Acceptance Criteria

### Phase 1 — Pre-Execute (run now)

1. WHEN pre-Execute tasks run THEN `.specs/project/STATE.md` SHALL include a `2026-06-06 (Ministry archive #108)` Decisions entry covering: no unarchive in v1 (archive-only); shell switcher archived visibility (Admin/System Admin only with badge; hidden for others); i18n policy (agent drafts `en` + `pt-BR` in Execute, no HITL gate).
2. WHEN pre-Execute tasks run THEN `.specs/project/ROADMAP.md` Organization theme row SHALL distinguish shipped slices (P1 #109, P2 campus #107) from backlog (#108 `ready-for-agent`) and include system-admin-platform as shipped.
3. WHEN pre-Execute tasks run THEN `organization-structure-administration/spec.md` ORG-STRUCT-07 traceability row SHALL note "Shipped — see `system-admin-platform`" and link to `#87–93`.

### Phase 2 — Post-Execute (after #108 PR merges)

4. WHEN #108 PR merges THEN `organization-structure-administration/tasks.md` T-ARCHIVE-01 through T-ARCHIVE-05 SHALL be marked `[x]`.
5. WHEN #108 PR merges THEN `organization-structure-administration/spec.md` ORG-STRUCT-06 traceability status SHALL read "Verified".
6. WHEN #108 PR merges THEN `organization-structure-administration/spec.md` status block SHALL show "Implemented — Execute verified ([#108])".
7. WHEN #108 PR merges THEN `docs/issues/108-org-structure-ministry-archive-backlog.md` SHALL be renamed/moved to `docs/issues/done/108-org-structure-ministry-archive.md` with acceptance criteria checked.
8. WHEN #108 PR merges THEN `docs/issues/README.md` SHALL remove #108 from Active backlog and add it to Recently archived.
9. WHEN #108 PR merges THEN `.specs/project/ROADMAP.md` Organization theme SHALL be listed as fully shipped.
10. WHEN #108 PR merges THEN `.specs/project/STATE.md` SHALL record an org-structure closeout note referencing the ONDA.md completion tracking checklist as complete for this feature.

## Out of Scope

- Code changes for #108 (Execute is tracked in `organization-structure-administration/tasks.md`)
- New org-structure requirements beyond ORG-STRUCT-01–06
- System Admin follow-up work (tracked in `system-admin-platform/tasks.md`)

## Requirement Traceability

| Requirement ID | Description | Phase | Status |
|----------------|-------------|-------|--------|
| DOC-CLOSE-01 | STATE.md 2026-06-06 ministry archive decisions | Pre-Execute | Done |
| DOC-CLOSE-02 | ROADMAP.md org-structure shipped vs backlog | Pre-Execute | Done |
| DOC-CLOSE-03 | org-structure spec.md ORG-STRUCT-07 shipped note | Pre-Execute | Done |
| DOC-CLOSE-04 | tasks.md T-ARCHIVE-* checkboxes | Post-Execute | Done |
| DOC-CLOSE-05 | spec.md ORG-STRUCT-06 → Verified | Post-Execute | Done |
| DOC-CLOSE-06 | spec.md status block ORG-STRUCT-06 → Implemented | Post-Execute | Done |
| DOC-CLOSE-07 | docs/issues/ archive move for #108 | Post-Execute | Done (PR #119) |
| DOC-CLOSE-08 | docs/issues/README.md index update | Post-Execute | Done (PR #119) |
| DOC-CLOSE-09 | ROADMAP.md org-structure theme fully complete | Post-Execute | Done |
| DOC-CLOSE-10 | STATE.md org-structure closeout note | Post-Execute | Done |
