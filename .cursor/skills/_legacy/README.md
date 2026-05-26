# Legacy skills (Onda Volunteer)

These skills predate **tlc-spec-driven** on this repo. Cursor should **not** load or follow them unless the user **explicitly** names the skill (e.g. “use the triage skill”).

| Legacy skill | Superseded by (TLC) |
|--------------|---------------------|
| `to-issues` | **Tasks** phase → create GitHub issues from `.specs/features/<slug>/tasks.md` with `gh` |
| `to-prd` | **Specify** phase → `.specs/features/<slug>/spec.md` |
| `triage` | **Specify** / **Tasks** + GitHub issue workflow in **Execute**; project conventions in `AGENTS.md` |
| `tdd` | **Execute** → red-green-refactor per `tlc-spec-driven/references/implement.md` and `AGENTS.md` tests |
| `grill-me` | **Specify** → **Discuss** (`references/discuss.md`) for gray areas |
| `grill-with-docs` | **Discuss** + update `CONTEXT.md` / `docs/adr/` during **Design** or **Execute** when decisions land |
| `improve-codebase-architecture` | **Design** for structural work; brownfield context from `CONTEXT.md` + `docs/adr/` (no `.specs/codebase/`) |

To retire a legacy skill entirely, delete its folder here after confirming nothing references it.
