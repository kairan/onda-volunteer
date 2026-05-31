# Project state (TLC memory)

Cross-session decisions, blockers, lessons, and deferred ideas. Agents update this during TLC work (see `references/state-management.md` in the tlc-spec-driven skill).

## Decisions

- **2026-05-26:** Adopted **tlc-spec-driven** as the default planning/implementation playbook; brownfield context stays in `CONTEXT.md` / `docs/adr/` / `docs/issues/` (no `.specs/codebase/`).
- **2026-05-26:** Feature artifacts live under `.specs/features/<slug>/`; GitHub Issues remain the shared execution queue.
- **2026-05-26:** Moved pre-TLC skills to `.cursor/skills/_legacy/` — TLC only unless user explicitly names a legacy skill.
- **2026-05-27:** Missing-feature audit found no open GitHub issues and treated GitHub closed/completed state plus `docs/issues/README.md` as canonical over stale unchecked boxes in some archived issue specs. The only active PRD-aligned candidate identified was **Organization structure administration** (`.specs/features/organization-structure-administration/spec.md`).

## Blockers

_(none)_

## Deferred ideas

- **Organization setup/operator path:** Church creation, Church metadata edits, and first-Admin bootstrap may be needed later, but they imply authority beyond church-scoped **Admin** and need an explicit decision before implementation.

## Lessons learned

_(add after Execute / validate when something should inform the next feature)_
