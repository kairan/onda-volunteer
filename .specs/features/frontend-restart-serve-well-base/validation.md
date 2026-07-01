# Frontend restart — serve-well + API — Validation

**Date**: 2026-07-01  
**Phase verified**: Specify + Design + Tasks (planning complete; Execute not started)  
**Spec**: `.specs/features/frontend-restart-serve-well-base/spec.md`  
**Diff range**: `2298a13..367df39` (PR #168) + local verify fixes (HANDOFF, frozen migration tasks/spec)  
**Verifier**: independent pass (author ≠ verifier)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T01–T17 | ⏳ Not started | Execute [#170](https://github.com/kairan/onda-volunteer/issues/170) after PR #169 merge |
| Planning artifacts | ✅ Complete | spec.md, design.md, tasks.md, context.md, ADR 0007 |

---

## Spec-Anchored Acceptance Criteria (implementation)

| Criterion | Spec-defined outcome | Evidence | Result |
| --------- | -------------------- | -------- | ------ |
| RST-FND-01..03 | `apps/web-onda` package + theme + data graft | No `apps/web-onda` yet | ⏳ Pre-Execute |
| RST-SHELL-01 | serve-well shell + working context | No implementation | ⏳ Pre-Execute |
| RST-VOL-01 | Volunteer screens live | No implementation | ⏳ Pre-Execute |
| RST-LEAD-01 | Leader screens live | No implementation | ⏳ Pre-Execute |
| RST-ADMIN-01 | Admin functional port | No implementation | ⏳ Pre-Execute |
| RST-CUT-01 | Cutover + delete legacy packages | No implementation | ⏳ Pre-Execute |
| RST-ENG-01 | CI + visual sign-off | No `@onda/web-onda` CI job yet | ⏳ Pre-Execute |

**Status**: ⏳ Implementation ACs deferred to Execute — expected for planning-only PR.

---

## Planning traceability (RST-* → tasks)

| Requirement | Tasks | Result |
| ----------- | ----- | ------ |
| RST-FND-01 | T01 | ✅ Traced |
| RST-FND-02 | T02 | ✅ Traced |
| RST-FND-03 | T03 | ✅ Traced |
| RST-SHELL-01 | T04, T05, T06, T07 | ✅ Traced |
| RST-VOL-01 | T08, T09, T10 | ✅ Traced |
| RST-LEAD-01 | T11, T12 (+ T13 supplementary) | ✅ Traced |
| RST-ADMIN-01 | T14, T15 | ✅ Traced |
| RST-CUT-01 | T17 | ✅ Traced |
| RST-ENG-01 | T16, design.md §9 (T17 gate) | ✅ Traced |

**Status**: ✅ All RST-* requirements in spec.md trace to tasks.md.

---

## Tracker & cross-doc consistency

| Check | Result | Notes |
| ----- | ------ | ----- |
| ADR 0007 + `docs/adr/README.md` index | ✅ | Active strategy documented |
| `STATE.md` pivot note | ✅ | 2026-07-01 entry |
| `ROADMAP.md` active row | ✅ | Points to `frontend-restart-serve-well-base` |
| `docs/issues/README.md` | ✅ | #148 frozen; restart feature active |
| `148-web-next-migration-slice-6-cutover.md` | ✅ | Frozen status |
| #148 `ready-for-agent` label | ✅ | Removed on GitHub |
| `frontend-migration-web-next/spec.md` frozen banner | ✅ | Updated phase line (verify fix) |
| `frontend-migration-web-next/tasks.md` #148 row | ✅ | Frozen (verify fix) |
| `.specs/HANDOFF.md` next action | ✅ | Points to T01, not #148 (verify fix) |
| `working-context-picker` absorbed note | ✅ | README + RST-SHELL-01 / T04 |
| T07 → `design.md §6` cross-ref | ✅ | Fixed in `367df39` |

---

## Spec-precision gaps (planning)

| Gap | Location | Recommendation |
| --- | -------- | -------------- |
| `/auth` listed in design.md §6 but absent from `web-next` router | design.md §6 vs `apps/web-next/src/router.tsx` | Clarify auth entry path during T07 (e.g. Supabase callback route name) |
| Legacy `/events/$eventId` redirect not in design.md §6 | design.md §6 | Add ADR 0004 redirect to T07 Done-when or §6 footnote |
| `/user-select` in web-next not in §6 | design.md §6 | Document include/exclude for cutover parity |

---

## Discrimination Sensor

**N/A** — no implementation code on this branch. Sensor runs at Execute closeout (post-T17).

---

## Gate Check

- **Gate command**: PR #168 CI (`build`, `lint`, `test`, `coverage`, `typecheck-*`, `playwright*`)
- **Local**: `pnpm lint` — pass
- **CI on `367df39`**: all jobs pass
- **Result**: ✅ Planning PR does not regress runtime

---

## Feature closeout checklist (tasks.md Verify)

| Item | Status |
| ---- | ------ |
| All RST-* traced to tasks | ✅ |
| `docs/issues/` entry for Execute | ✅ [#170](https://github.com/kairan/onda-volunteer/issues/170) + `170-web-onda-foundation-phase-0-1.md` |
| `frontend-migration-web-next` archived | ⏳ At T17 per RST-CUT-01 |
| #148 closed as superseded | ✅ Closed 2026-07-01 |

---

## Code Quality (planning artifacts)

| Principle | Status |
| --------- | ------ |
| Minimum scope (docs only) | ✅ |
| No scope creep in spec | ✅ |
| Matches Onda TLC / ADR conventions | ✅ |
| Frozen migration clearly marked | ✅ |

---

## Summary

**Overall**: ✅ **PASS** (Specify + Design + Tasks phase)

**Planning**: Requirements trace cleanly to 17 tasks; trackers aligned after verify fixes; ADR 0007 is canonical entry point.

**Open for Execute**: T01+; three route-tree precision gaps to resolve in T07; feature closeout items remain for post-cutover.

**Next steps**:
1. Merge PR #169
2. Label [#170](https://github.com/kairan/onda-volunteer/issues/170) `ready-for-agent` when T01 unblocked
3. Execute T01+ on branch from #170
