# Ubiquitous language drift — Tasks

**Spec**: `.specs/archive/features/ubiquitous-language-drift/spec.md`  
**Status**: Shipped — validated 2026-06-18 ([#131](https://github.com/kairan/onda-volunteer/issues/131)–[#135](https://github.com/kairan/onda-volunteer/issues/135)).

## Execution plan

```text
#131 [P] ─┬─► #132
          ├─► #133
          ├─► #134
          └─► #135
```

Issues **#132–#135** may execute in parallel after **#131** (doc) or without it when agents read full `CONTEXT.md` Language section.

---

## GitHub issue map

| Issue | Requirement | Summary | Status |
|------:|-------------|---------|--------|
| [#131](https://github.com/kairan/onda-volunteer/issues/131) | GLOSS-01 | Glossary: **Inactive** membership | ✅ Shipped |
| [#132](https://github.com/kairan/onda-volunteer/issues/132) | AVAIL-01 | API: reject inactive on Unavailability create | ✅ Shipped (PR [#137](https://github.com/kairan/onda-volunteer/pull/137)) |
| [#133](https://github.com/kairan/onda-volunteer/issues/133) | AVAIL-02 | Volunteer edit/delete own Unavailability | ✅ Shipped (PR [#139](https://github.com/kairan/onda-volunteer/pull/139)) |
| [#134](https://github.com/kairan/onda-volunteer/issues/134) | SCHED-01 | Campus-authoritative event time display | ✅ Shipped (PR [#140](https://github.com/kairan/onda-volunteer/pull/140)) |
| [#135](https://github.com/kairan/onda-volunteer/issues/135) | I18N-01 | Web i18n language alignment | ✅ Shipped (PR [#138](https://github.com/kairan/onda-volunteer/pull/138)) |

---

## Verify (feature closeout)

- [x] All five issues closed; specs archived to `docs/issues/done/`
- [x] `docs/issues/README.md` active backlog updated
- [x] `.specs/project/ROADMAP.md` theme row added or marked shipped
- [x] Re-run spot audit: no HIGH drift from 2026-06-18 list remains open
