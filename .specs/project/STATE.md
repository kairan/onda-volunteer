# Project state (TLC memory)

Cross-session decisions, blockers, lessons, and deferred ideas. Agents update this during TLC work (see `references/state-management.md` in the tlc-spec-driven skill).

## Decisions

- **2026-05-26:** Adopted **tlc-spec-driven** as the default planning/implementation playbook; brownfield context stays in `CONTEXT.md` / `docs/adr/` / `docs/issues/` (no `.specs/codebase/`).
- **2026-05-26:** Feature artifacts live under `.specs/features/<slug>/`; GitHub Issues remain the shared execution queue.
- **2026-05-26:** Moved pre-TLC skills to `.cursor/skills/_legacy/` — TLC only unless user explicitly names a legacy skill.
- **2026-05-27:** Missing-feature audit found no open GitHub issues and treated GitHub closed/completed state plus `docs/issues/README.md` as canonical over stale unchecked boxes in some archived issue specs. The only active PRD-aligned candidate identified was **Organization structure administration** (`.specs/features/organization-structure-administration/spec.md`).
- **2026-05-31:** **System Admin** operator path approved (replaces seed/script provisioning for net-new churches). A dedicated **System Admin** sign-in and dashboard SHALL support: create **Church** (and required structure bootstrap), add/edit users, and assign **Organization** permission levels (**Admin** accreditation per **Church**, **Leader** per **Ministry**, **Volunteer** membership) within product guardrails. Church-scoped **Admin** UX remains for day-to-day ministry structure inside accredited **Churches**. During **Specify**, add **System Admin** to `CONTEXT.md`, update Platform PRD out-of-scope notes, and add an ADR for auth boundary vs church-scoped **Admin**.
- **2026-05-31 (System Admin Specify):** Many System Admins; **only seed** grants System Admin (no in-app bootstrap). Church **Admin** onboarding = **System Admin sends Supabase invite email** per church. System Admin scheduling access = **read-only**. Church-scoped **Admin** **may** edit accredited **Church** name and default timezone (separate slice from operator dashboard). Feature spec: `.specs/features/system-admin-platform/spec.md`.
- **2026-05-31 (System Admin Design/Tasks):** Design + tasks approved — `SystemAdministrator` + `AdminInvite` models, `/system-admin/*` API module, invite fulfillment on JWT sign-in, reuse scheduling GET with write guard. Execute via `tasks.md` (T-SYS-01–26, optional T-CHURCH-01–03).
- **2026-05-31 (System Admin Chain 0 / #87):** ADR [0005](../../docs/adr/0005-system-admin-operator-role.md) accepted; `CONTEXT.md`, Platform PRD, Supabase/auth runbooks aligned (T-SYS-01–03). Implementation unblocks [#88](https://github.com/kairan/onda-volunteer/issues/88)+.
- **2026-05-31:** Parallel execution guide + GitHub chains [#87](https://github.com/kairan/onda-volunteer/issues/87)–[#93](https://github.com/kairan/onda-volunteer/issues/93); see `.specs/features/system-admin-platform/parallel-execution.md` and `docs/issues/README.md`.

- **2026-06-04 (Org structure Design/Tasks):** P2 **Campus** metadata/timezone is next Execute ([#107](https://github.com/kairan/onda-volunteer/issues/107)); `PATCH /campuses/:id` + `/ministries` campus settings (mirror #93 church metadata). Ministry archive deferred ([#108](https://github.com/kairan/onda-volunteer/issues/108)) — no `Ministry.archived` in schema yet. P1 tracker doc [#109](https://github.com/kairan/onda-volunteer/issues/109). TLC: `.specs/features/organization-structure-administration/`.
- **2026-06-04 (Church/Campus timezone model):** **Church** = tenant; only **Campus** has authoritative IANA timezone for ministry scheduling/presentation (e.g. Onda Dura + Campus Porto). Church `defaultTimezone` (#93) is organizational fallback, not multi-campus HQ clock. P2 #107 edits campus metadata only.

## Blockers

_(none)_

## Deferred ideas

_(none — System Admin operator path promoted to Decisions 2026-05-31.)_

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
