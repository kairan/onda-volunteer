# Spec-driven artifacts (TLC v3.1)

Active feature work for agents using **tlc-spec-driven** lives here. Read [`AGENTS.md`](../AGENTS.md) and [`.cursor/skills/tlc-spec-driven/ONDA.md`](../.cursor/skills/tlc-spec-driven/ONDA.md) before any TLC phase.

## Layout

| Path | Contents |
|------|----------|
| `project/PROJECT.md` | Vision and goals (domain depth in `CONTEXT.md`) |
| `project/ROADMAP.md` | Milestones; links to `docs/issues/` |
| `project/STATE.md` | Project-level decisions (`AD-NNN` / legacy bullets) |
| `features/<slug>/` | **In-flight only** — per-feature `spec.md`, optional `design.md`, `tasks.md`, `context.md`, `validation.md` |
| `archive/features/<slug>/` | Shipped TLC artifacts; see [`archive/features/INDEX.md`](archive/features/INDEX.md) |
| `archive/features/INDEX.md` | Slug → `docs/issues/done/` → GitHub issue |
| `HANDOFF.md` | Latest session handoff (regenerated on pause) |
| `lessons.json` / `LESSONS.md` | Self-improving execution lessons (machine-owned; use `.cursor/skills/tlc-spec-driven/scripts/lessons.py` from repo root) |

## Active vs archived features

- **Active:** `.specs/features/` holds in-flight work only (currently `frontend-migration-web-next`, `ui-refresh-onda-brand`).
- **Shipped:** After closeout, TLC folders move to `.specs/archive/features/` per **AD-001** in `project/STATE.md`. A redirect stub remains at `.specs/features/<slug>/README.md`.
- **Ship record:** `docs/issues/done/<#>-*.md` is canonical for acceptance criteria.

## Brownfield (this repo)

**Not used:** `.specs/codebase/` — v3.1 loads brownfield context via the Knowledge Verification Chain against existing docs:

- [`CONTEXT.md`](../CONTEXT.md) — domain
- [`docs/adr/`](../docs/adr/) — decisions
- [`docs/issues/`](../docs/issues/) — issue specs and history
- [`AGENTS.md`](../AGENTS.md) — stack, tests, CI, dev runbook

See **ONDA.md** for phase-by-phase loading and Onda path overrides.
