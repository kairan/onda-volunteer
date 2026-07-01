# Project state (TLC memory)

Cross-session decisions, blockers, lessons, and deferred ideas. Agents update this during TLC work (see [memory.md](../../.cursor/skills/tlc-spec-driven/references/memory.md) and [ONDA.md](../../.cursor/skills/tlc-spec-driven/ONDA.md) for Onda path overrides).

## Decisions

- **AD-001 (2026-06-26):** After a feature ships, move `.specs/features/<slug>/` → `.specs/archive/features/<slug>/` in the same PR that archives `docs/issues/done/<#>-*.md`. Leave a redirect stub at `.specs/features/<slug>/README.md`. Active `.specs/features/` holds **in-flight work only**. Index: [`.specs/archive/features/INDEX.md`](../archive/features/INDEX.md).

- **2026-06-20 (UI refresh Specify):** HOPE visual layer rejected for multi-church product direction. Adopt **provisional Igreja Onda** brand (Space Grotesk, `#2034D6` palette). Lovable prototype is reference only. **In scope:** Volunteer + Ministry Leader screens + shell tokens. TLC: `.specs/features/ui-refresh-onda-brand/`; ADR [0006](../../docs/adr/0006-onda-brand-visual-system.md); `design-reference/serve-well/`.

- **2026-06-20 (Frontend migration Specify + Design):** Rebuild frontend from scratch — parallel app `apps/web-next`, same stack, TanStack Query v5, strangler migration, single cutover. `ui-refresh-onda-brand` is the **design source**. TLC: `.specs/features/frontend-migration-web-next/`.

- **2026-06-21 (Lovable clone + visual lock):** Full Lovable export in `design-reference/serve-well/`. Locked page bg `#FAFAFA`, shadcn Sidebar shell, dashboard layouts from reference. #143 Execute cherry-picks presentational code into `apps/web-next`.

- **2026-06-21 (#143 Slice 1 closeout):** Foundation shipped — `apps/web-next`, Onda tokens, TanStack Query data core, shell + route parity. Next: #144–#148.

- **2026-06-24 (#144–#147 Slices 2–5 closeout):** Volunteer, leader, org-admin, system-admin slices shipped in `apps/web-next`. 105 Vitest tests green. ~~**Next Execute:** [#148](https://github.com/kairan/onda-volunteer/issues/148) (cutover).~~ **Superseded 2026-07-01** — see pivot below.

- **2026-07-01 (Frontend pivot — serve-well + API):** `web-next` **visual layer rejected**. **Freeze #148 cutover.** New direction: **`apps/web-onda`** = serve-well presentation + `web-next` data layer. TLC: `.specs/features/frontend-restart-serve-well-base/`; ADR [0007](../../docs/adr/0007-frontend-serve-well-plus-api.md); ADR index [docs/adr/README.md](../../docs/adr/README.md) (0002–0003 archived, 0001 trimmed). Delete `apps/web` + `apps/web-next` at cutover (T17).

- **2026-06-18 (Ubiquitous language drift closeout):** #131–#135 shipped. No HIGH drift items remain from the 2026-06-18 audit. TLC archived: `.specs/archive/features/ubiquitous-language-drift/`.

- **2026-06-11 (#115–#124 closeout):** Leader roster UI, volunteer onboarding, event edit/reschedule, invite fulfillment toast, ESLint/typecheck/coverage gates shipped.

- **2026-06-09 (Org structure closeout):** ORG-STRUCT-01–06 verified; organization theme fully shipped. TLC archived: `.specs/archive/features/organization-structure-administration/`.

## Blockers

_(none)_

## Deferred ideas

_(none)_

## TLC completion tracking (canonical order)

Use this stack so "done" is unambiguous; do not treat `.specs/features/` alone as shipped status.

1. **`tasks.md`** — Mark `[x]` on each task when Execute finishes; requirement IDs in `spec.md` should stay aligned.
2. **`docs/issues/done/<#>-*.md`** — Check acceptance criteria when the GitHub issue closes; this is the human/agent execution record.
3. **`docs/issues/README.md`** — Index row (Shipped / Blocked / Active); update when issue state changes.
4. **`.specs/project/ROADMAP.md`** — Theme-level summary only; link to `docs/issues/` for detail.
5. **`.specs/project/STATE.md`** (this file) — Decisions, blockers, and lessons.
6. **`.specs/archive/features/<slug>/`** — Move shipped TLC folders here per **AD-001**; leave redirect stub at old `.specs/features/<slug>/README.md`.

**HITL gates** (e.g. #49 `hitl-signoff.md`): automated checks can ship in CI; human rows stay open until a reviewer signs.

**Stale TLC rule:** If `tasks.md` disagrees with green tests + `docs/issues/README.md`, trust the tracker index and code, then sync `tasks.md`.

## Lessons learned

- **2026-05-31:** Retired legacy `/events/$eventId` UI in favor of shell redirect (ADR 0004, #58). TLC `tasks.md` checkboxes were often stale for already-shipped slices — sync on close.
- **2026-06-26:** Shipped TLC folders duplicated `docs/issues/done/` and misled agents with stale task checkboxes — archive on close (AD-001).

## Archived decisions (pre-2026-06)

Historical bullets retained for ADR/issue cross-references. Paths below reflect locations **at decision time**; shipped TLC artifacts now live under `.specs/archive/features/` per AD-001.

- **2026-05-26:** Adopted **tlc-spec-driven** as default playbook; brownfield context in `CONTEXT.md` / `docs/adr/` / `docs/issues/` (no `.specs/codebase/`).
- **2026-05-26:** Feature artifacts under `.specs/features/<slug>/`; GitHub Issues remain execution queue.
- **2026-05-26:** Pre-TLC skills moved to `.cursor/skills/_legacy/`.
- ~~**2026-05-27:** Missing-feature audit found no open GitHub issues.~~ **Superseded** — [#148](https://github.com/kairan/onda-volunteer/issues/148) active since 2026-06-24.
- **2026-05-31:** **System Admin** operator path approved — ADR [0005](../../docs/adr/0005-system-admin-operator-role.md); chains #87–#93 shipped.
- **2026-06-04:** Church/Campus timezone model — only **Campus** has authoritative IANA timezone for scheduling.
- **2026-06-06 (Ministry archive #108):** Unarchive not in v1; archived ministries visible to Admin/System Admin only in switcher.
- **2026-06-06 (Assumption lockdown):** ROSTER-A1/A3, EVENT-EDIT-A1–A3, ONBOARD-A1–A5 locked for #115–#117 Execute.
