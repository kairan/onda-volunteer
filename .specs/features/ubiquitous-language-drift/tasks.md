# Ubiquitous language drift — Tasks

**Spec**: `.specs/features/ubiquitous-language-drift/spec.md`  
**Status**: Planned — GitHub **#131–#135** (2026-06-18).

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

| Issue | Requirement | Summary | Label when unblocked |
|------:|-------------|---------|----------------------|
| [#131](https://github.com/kairan/onda-volunteer/issues/131) | GLOSS-01 | Glossary: **Inactive** membership | `ready-for-agent` |
| [#132](https://github.com/kairan/onda-volunteer/issues/132) | AVAIL-01 | API: reject inactive on Unavailability create | `ready-for-agent` |
| [#133](https://github.com/kairan/onda-volunteer/issues/133) | AVAIL-02 | Volunteer edit/delete own Unavailability | `ready-for-agent` |
| [#134](https://github.com/kairan/onda-volunteer/issues/134) | SCHED-01 | Campus-authoritative event time display | `ready-for-agent` |
| [#135](https://github.com/kairan/onda-volunteer/issues/135) | I18N-01 | Web i18n language alignment | `ready-for-agent` |

---

## Verify (feature closeout)

- [ ] All five issues closed; specs archived to `docs/issues/done/`
- [ ] `docs/issues/README.md` active backlog updated
- [ ] `.specs/project/ROADMAP.md` theme row added or marked shipped
- [ ] Re-run spot audit: no HIGH drift from 2026-06-18 list remains open
