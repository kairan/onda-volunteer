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

## TLC completion tracking (canonical order)

Use this stack so “done” is unambiguous; do not treat `.specs/features/` alone as shipped status.

1. **`tasks.md`** — Mark `[x]` on each task when Execute finishes; requirement IDs in `spec.md` should stay aligned.
2. **`docs/issues/done/<#>-*.md`** — Check acceptance criteria when the GitHub issue closes; this is the human/agent execution record.
3. **`docs/issues/README.md`** — Index row (Shipped / Blocked / Active); update when issue state changes.
4. **`.specs/project/ROADMAP.md`** — Theme-level summary only; link to `docs/issues/` for detail.
5. **`.specs/project/STATE.md`** (this file) — Decisions, blockers, and lessons; note when TLC artifacts were left stale vs code.

**HITL gates** (e.g. #49 `hitl-signoff.md`): automated checks can ship in CI; human rows stay open until a reviewer signs.

**Stale TLC rule:** If `tasks.md` disagrees with green tests + `docs/issues/README.md`, trust the tracker index and code, then sync `tasks.md`.

## Lessons learned

- **2026-05-31:** Retired legacy `/events/$eventId` UI in favor of shell redirect (ADR 0004, #58). TLC `tasks.md` checkboxes were often stale for already-shipped slices — sync on close.
