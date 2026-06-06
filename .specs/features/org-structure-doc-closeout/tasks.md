# Org Structure Doc Closeout — Tasks

**Spec**: `.specs/features/org-structure-doc-closeout/spec.md`  
**Status**: Phase 1 (Pre-Execute) — Done. Phase 2 — Unblocked ([#108](https://github.com/kairan/onda-volunteer/issues/108) shipped via #113); `T-DOC-07`/`T-DOC-08` done in planning PR #119.

---

## Execution Plan

### Phase 1: Pre-Execute doc sync (run now, doc-only)

```text
T-DOC-01 [P] T-DOC-02 [P] T-DOC-03
```

All three are independent doc edits; run in parallel or sequence.

### Phase 2: Post-Execute doc sync (run after #108 merges)

```text
T-DOC-04 → T-DOC-05 → T-DOC-06 [P] T-DOC-07 → T-DOC-08 → T-DOC-09 → T-DOC-10
```

---

## Validation tables

### Diagram ↔ Depends on

| Task | Stated depends | Matches phase diagram |
|------|----------------|-----------------------|
| T-DOC-01 | None | ✅ |
| T-DOC-02 | None | ✅ |
| T-DOC-03 | None | ✅ |
| T-DOC-04 | #108 merge | ✅ |
| T-DOC-05 | T-DOC-04 | ✅ |
| T-DOC-06 | T-DOC-04 | ✅ |
| T-DOC-07 | T-DOC-04 | ✅ |
| T-DOC-08 | T-DOC-07 | ✅ |
| T-DOC-09 | T-DOC-05, T-DOC-08 | ✅ |
| T-DOC-10 | T-DOC-09 | ✅ |

### Test co-location

All tasks are documentation-only. Gate is doc review / grep for expected content; no test suite.

---

## Phase 1 — Pre-Execute tasks

### T-DOC-01: STATE.md — add 2026-06-06 ministry archive decisions

**What**: Add a `2026-06-06 (Ministry archive #108)` entry to the Decisions section of STATE.md covering the three locked product decisions: (1) no unarchive in v1; (2) shell switcher visibility (Admin/System Admin see archived with badge; others see nothing); (3) i18n policy (agent drafts `en` + `pt-BR` in Execute, no HITL gate).  
**Where**: `.specs/project/STATE.md` → Decisions section  
**Depends on**: None  
**Requirement**: DOC-CLOSE-01

**Done when**:

- [ ] Decisions section has entry dated 2026-06-06 referencing #108 ministry archive
- [ ] Three locked decisions (unarchive, shell switcher, i18n) are recorded

**Gate**: doc review — grep STATE.md for "Ministry archive" and "HITL"

**Verify**: `STATE.md` Decisions section contains "2026-06-06 (Ministry archive #108)" with all three policy points listed.

---

### T-DOC-02: ROADMAP.md — org-structure shipped vs backlog

**What**: Expand the ROADMAP.md Organization theme candidate row to distinguish shipped slices (#109 P1, #107 P2 campus) from the `ready-for-agent` backlog slice (#108 ministry archive); add system-admin-platform row as shipped.  
**Where**: `.specs/project/ROADMAP.md` → Candidate missing feature table (or new Shipped section)  
**Depends on**: None  
**Requirement**: DOC-CLOSE-02

**Done when**:

- [ ] ROADMAP.md Organization theme row shows P1 and P2 as shipped with issue links
- [ ] Ministry archive (#108) shown as `ready-for-agent` backlog
- [ ] System Admin (#87–93) shown as shipped

**Gate**: doc review

**Verify**: ROADMAP.md clearly separates shipped org-structure slices from open backlog.

---

### T-DOC-03: org-structure spec.md — ORG-STRUCT-07 shipped note

**What**: Update the ORG-STRUCT-07 traceability row in `organization-structure-administration/spec.md` from "Pending — split to `system-admin-platform`" to "Shipped — see `.specs/features/system-admin-platform/` (#87–93)".  
**Where**: `.specs/features/organization-structure-administration/spec.md` → Requirement Traceability table  
**Depends on**: None  
**Requirement**: DOC-CLOSE-03

**Done when**:

- [ ] ORG-STRUCT-07 row status reads "Shipped" with link to system-admin-platform and issue range

**Gate**: doc review

**Verify**: ORG-STRUCT-07 row links to system-admin-platform and lists #87–93.

---

## Phase 2 — Post-Execute tasks (run after #108 PR merges)

### T-DOC-04: tasks.md — check T-ARCHIVE-* boxes

**What**: Mark T-ARCHIVE-01 through T-ARCHIVE-05 as `[x]` in `organization-structure-administration/tasks.md`, confirming Execute is complete.  
**Where**: `.specs/features/organization-structure-administration/tasks.md`  
**Depends on**: #108 PR merge  
**Requirement**: DOC-CLOSE-04

**Done when**:

- [ ] All five T-ARCHIVE-* tasks show `[x]`

**Gate**: doc review — all checkboxes complete

**Verify**: `grep -c '\[x\]' tasks.md` covers T-ARCHIVE-01 through T-ARCHIVE-05.

---

### T-DOC-05: org-structure spec.md — ORG-STRUCT-06 Verified

**What**: Update ORG-STRUCT-06 traceability row status to "Verified" and update the status block to "Implemented — Execute verified ([#108])".  
**Where**: `.specs/features/organization-structure-administration/spec.md`  
**Depends on**: T-DOC-04  
**Requirement**: DOC-CLOSE-05, DOC-CLOSE-06

**Done when**:

- [ ] Traceability row ORG-STRUCT-06 status = "Verified"
- [ ] Status block P2 ORG-STRUCT-06 line updated

**Gate**: doc review

---

### T-DOC-06: org-structure design.md — status line update

**What**: Update `organization-structure-administration/design.md` status line for ORG-STRUCT-06 from "designed (Execute [#108])" to "Verified — #108".  
**Where**: `.specs/features/organization-structure-administration/design.md` → Status line  
**Depends on**: T-DOC-04  
**Requirement**: DOC-CLOSE-05 (partial)  
**Parallel**: `[P]` with T-DOC-05

**Done when**:

- [ ] Design.md status line reflects verified Execute for ORG-STRUCT-06

**Gate**: doc review

---

### T-DOC-07: docs/issues/ — archive #108 backlog doc

**What**: Move `docs/issues/108-org-structure-ministry-archive-backlog.md` to `docs/issues/done/108-org-structure-ministry-archive.md`; check all acceptance criteria boxes in the moved file.  
**Where**: `docs/issues/`  
**Depends on**: #108 PR merge  
**Requirement**: DOC-CLOSE-07

**Done when**:

- [ ] File lives at `docs/issues/done/108-org-structure-ministry-archive.md`
- [ ] All acceptance criteria in the moved file are checked `[x]`

**Gate**: `ls docs/issues/done/ | grep 108`

**Verify**: `docs/issues/done/108-org-structure-ministry-archive.md` exists and all criteria show `[x]`.

---

### T-DOC-08: docs/issues/README.md — move #108 to archived

**What**: Remove the #108 row from the Active backlog table and add it to the Recently archived table.  
**Where**: `docs/issues/README.md`  
**Depends on**: T-DOC-07  
**Requirement**: DOC-CLOSE-08

**Done when**:

- [ ] Active backlog table has no #108 row
- [ ] Recently archived table has `| [#108](…) | done/108-org-structure-ministry-archive.md |`

**Gate**: doc review

---

### T-DOC-09: ROADMAP.md — org-structure theme fully shipped

**What**: Update the ROADMAP.md Organization theme to mark all slices shipped (P1 #109, P2 campus #107, P2 archive #108); no remaining backlog items.  
**Where**: `.specs/project/ROADMAP.md`  
**Depends on**: T-DOC-05, T-DOC-08  
**Requirement**: DOC-CLOSE-09

**Done when**:

- [ ] ROADMAP.md Organization theme lists no open backlog items

**Gate**: doc review

---

### T-DOC-10: STATE.md — org-structure closeout note

**What**: Add a Decisions entry recording that the org-structure-administration TLC feature is fully shipped (all ORG-STRUCT-01–06 verified; #107, #108, #109 closed; ONDA.md completion checklist complete).  
**Where**: `.specs/project/STATE.md` → Decisions section  
**Depends on**: T-DOC-09  
**Requirement**: DOC-CLOSE-10

**Done when**:

- [ ] Decisions section has an org-structure closeout entry with date and links to #107, #108, #109

**Gate**: doc review

**Verify**: STATE.md mentions "org-structure-administration TLC complete" or equivalent.
