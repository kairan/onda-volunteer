# Archived TLC artifacts

Shipped feature planning lives here after closeout. **Do not start new work from archive paths.**

## Authority chain

| Need | Canonical source |
|------|------------------|
| What shipped (acceptance criteria, GitHub links) | [`docs/issues/done/`](../docs/issues/done/) |
| Backlog index | [`docs/issues/README.md`](../docs/issues/README.md) |
| Active TLC work | [`.specs/features/`](../features/) (in-flight only) |
| Rich planning history (spec/design/tasks) | This directory — see [`features/INDEX.md`](features/INDEX.md) |
| Project decisions | [`.specs/project/STATE.md`](../project/STATE.md) |

## Policy (AD-001)

When a feature ships, move `.specs/features/<slug>/` → `.specs/archive/features/<slug>/` in the same PR that archives `docs/issues/done/<#>-*.md`. Leave a one-file redirect stub at the old `.specs/features/<slug>/README.md` so inbound links keep working.

## Layout

```text
.specs/archive/
├── README.md           # this file
└── features/
    ├── INDEX.md        # slug → done spec → GitHub issue
    └── <slug>/         # archived spec.md, design.md, tasks.md, …
```
