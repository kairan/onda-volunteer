# Project state (TLC memory)

Cross-session decisions, blockers, lessons, and deferred ideas. Agents update this during TLC work (see [memory.md](../../.cursor/skills/tlc-spec-driven/references/memory.md) and [ONDA.md](../../.cursor/skills/tlc-spec-driven/ONDA.md) for Onda path overrides).

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

- **2026-06-06 (Ministry archive #108 — product decisions locked):** Three decisions locked for Execute: (1) **Unarchive is not in v1** — archive-only, no unarchive endpoint or UI; (2) **Shell ministry switcher visibility** — archived ministries visible (with badge) for church-scoped Admin and System Admin only; hidden for Leaders, Volunteers, and other roles; (3) **Archive confirm dialog i18n** — agent drafts `en` + `pt-BR` strings in Execute (same pattern as role retire #44); no HITL gate. TLC: `.specs/features/organization-structure-administration/` (tasks.md Phase 4: T-ARCHIVE-01–05).

- **2026-06-06 (Planning round — 4 new feature specs created):** TLC Specify + Design completed for three product features and one doc-closeout housekeeping feature. Execute order: (1) finish #118 Phase 1 (`T-DOC-03`) + Phase 2 doc closeout now unblocked (#108 shipped via #113); (2) `leader-roster-assignment-ui` ([#115](https://github.com/kairan/onda-volunteer/issues/115)); (3) `event-edit-reschedule` ([#117](https://github.com/kairan/onda-volunteer/issues/117)); (4) `volunteer-onboarding-invite` ([#116](https://github.com/kairan/onda-volunteer/issues/116)). See `.specs/features/` for all artifacts and ROADMAP.md for priority order.

- **2026-06-09 (Org structure closeout — `organization-structure-administration` TLC complete):** All ORG-STRUCT-01–06 requirements verified and shipped: P1 ministry create/rename ([#109](https://github.com/kairan/onda-volunteer/issues/109)), P2 campus metadata/timezone ([#107](https://github.com/kairan/onda-volunteer/issues/107)), P2 ministry archive ([#108](https://github.com/kairan/onda-volunteer/issues/108), PR #113); ORG-STRUCT-07 shipped as `system-admin-platform` (#87–93). ONDA.md completion-tracking checklist complete for this feature: `tasks.md` checked, `docs/issues/done/108-*` archived, README index updated, ROADMAP Organization theme marked fully shipped. Doc closeout tracked via [#118](https://github.com/kairan/onda-volunteer/issues/118) (`.specs/features/org-structure-doc-closeout/`).

- **2026-06-06 (Assumption lockdown — all three feature specs execute-ready):** User confirmed all open assumptions across the three in-flight features. Locked decisions:
  - **ROSTER-A1**: `POST /assignments/:id/void` is a new endpoint (not extending `/release`). Separates leader stewardship void from volunteer self-release.
  - **ROSTER-A3**: No unavailability offer on leader-void. Offer remains only on volunteer self-release.
  - **EVENT-EDIT-A1**: Auto-void orphaned assignments outside new event window (transaction: void + update event). Not reject-if-orphans.
  - **EVENT-EDIT-A2**: Single `PATCH /events/:id` for both title and reschedule. At-least-one-field required (`EVENT_EDIT_EMPTY`).
  - **EVENT-EDIT-A3**: Inline edit form on event detail page. No modal, no separate route.
  - **ONBOARD-A1**: Invite mechanism reuses system-admin-platform Supabase Admin SDK invite path (`apps/api/src/identity/`). Fulfillment hook extended for `VolunteerInvite`.
  - **ONBOARD-A2**: Leaders can read volunteer display names and emails within their accredited Church scope. Church-scoped search sufficient for v1.
  - **ONBOARD-A3**: 7-day invite TTL. Leaders may resend before expiry — resend resets `sentAtUtc`/`expiresAtUtc` on the existing PENDING record (no `INVITE_ALREADY_SENT` error on resend).
  - **ONBOARD-A4**: `VolunteerInvite` model in Organization bounded context (`apps/api/src/organization/`), not Identity.
  - **ONBOARD-A5**: All pending invites fulfilled simultaneously on first sign-in. No selection screen. Each creates `MinistryMembership` with `status: PENDING`.

- **2026-06-11 (#115–#117 TLC closeout):** Validated and archived all three ready-for-agent slices: leader roster UI ([#115](https://github.com/kairan/onda-volunteer/issues/115)), volunteer onboarding invite ([#116](https://github.com/kairan/onda-volunteer/issues/116)), event edit/reschedule ([#117](https://github.com/kairan/onda-volunteer/issues/117)). `tasks.md` synced, issue specs moved to `docs/issues/done/`. Platform PRD v1 tracer bullets largely complete; missing-feature audit ranks **invite fulfillment toast** (ONBOARD-A5 web gap) as next slice.
- **2026-06-11 (#124 invite fulfillment toast):** Shipped ONBOARD-A5 — `GET /identity/me` returns `newlyFulfilledInvites`; `AppShell` shows per-ministry success toast on bootstrap. TLC: `.specs/features/invite-fulfillment-toast/`.
- **2026-06-11 (#126 ESLint baseline clean):** Fixed 13 unused-var warnings; promoted `pnpm lint --max-warnings 0` to required CI gate (removed `continue-on-error`). Branch protection runbook updated for HITL `CI / lint` enablement. TLC: `.specs/features/eslint-baseline-clean/`.
- **2026-06-11 (#128 web typecheck strict clean):** Cleared 59 web `tsc` errors; added `pnpm typecheck:web` + CI `typecheck-web` job. TLC: `.specs/features/web-typecheck-strict-clean/`.
- **2026-06-11 (#129 coverage threshold gates):** Fixed API jest-e2e coverage collection; enforced Jest/Vitest global floors; CI `coverage` job blocking. #61 T61-06 promotion criteria complete. TLC: `.specs/features/coverage-threshold-gates/`.

- **2026-06-18 (Ubiquitous language drift audit — Specify/Tasks):** Code vs `CONTEXT.md` audit found 2 HIGH behavioral gaps and several i18n/terminology drifts. Quick-reference card added to `CONTEXT.md`. Five tracer bullets filed as GitHub **#131–#135** with TLC `.specs/features/ubiquitous-language-drift/` (GLOSS-01, AVAIL-01/02, SCHED-01, I18N-01). All labeled `ready-for-agent`.
- **2026-06-18 (`ubiquitous-language-drift` TLC closeout):** All five slices shipped and validated — **#131** glossary **Inactive** membership; **#132** inactive guard on single-create **Unavailability** (PR #137); **#133** volunteer edit/delete own **Unavailability** (PR #139); **#134** campus-authoritative event time display (PR #140); **#135** web i18n alignment (PR #138). `tasks.md` synced, issue specs archived to `docs/issues/done/`, README + ROADMAP updated. No HIGH drift items remain open from the 2026-06-18 audit.

- **2026-06-20 (UI refresh Specify):** HOPE visual layer rejected for multi-church product direction. Adopt **provisional Igreja Onda** brand (Space Grotesk, `#2034D6` palette) — **not** generic indigo/Inter. Lovable prototype [serve-well.lovable.app](https://serve-well.lovable.app/) is reference only. **In scope:** Volunteer + Ministry Leader screens + shell tokens. **Out of scope:** Church Admin / System Admin redesign, Accept/Decline assignment inbox, event venues, global search. TLC: `.specs/features/ui-refresh-onda-brand/`; ADR [0006](../../docs/adr/0006-onda-brand-visual-system.md); `design-reference/serve-well/`.

- **2026-06-21 (Lovable clone checked in + visual lock):** Full Lovable export copied to `design-reference/serve-well/` (read-only reference, not a workspace package). Locked page bg **`#FAFAFA`**, shadcn **`Sidebar` shell**, **`--shadow-card`**, and dashboard layouts from reference components. #143 Execute shall **cherry-pick presentational code** into `apps/web-next` — not replace migration with the Lovable package. Updated: `ui-refresh-onda-brand` design/context/spec, `frontend-migration-web-next` tasks T02/T03/T12/T13.5, ADR 0006.

- **2026-06-21 (`frontend-migration-web-next` Slice 1 / #143 TLC closeout):** Foundation chain shipped — `apps/web-next` package, Onda tokens + shadcn primitives, TanStack Query data core (auth, apiClient, queryKeys, OrganizationProvider), shell + route parity with `apps/web`, throwaway mock-data brand preview (MIG-FND-04). PRs [#151](https://github.com/kairan/onda-volunteer/pull/151), [#150](https://github.com/kairan/onda-volunteer/pull/150), [#152](https://github.com/kairan/onda-volunteer/pull/152), [#153](https://github.com/kairan/onda-volunteer/pull/153). ONDA.md completion-tracking done for Slice 1: `tasks.md` T01–T13.5 checked, `docs/issues/done/143-*` archived, README + ROADMAP updated. HITL visual sign-off rows in `hitl-signoff.md` remain open for human brand review. Next Execute: [#144](https://github.com/kairan/onda-volunteer/issues/144)–[#148](https://github.com/kairan/onda-volunteer/issues/148).

- **2026-06-21 (`frontend-migration-web-next` Slice 2–5 tracker sync):** After #143 closeout, synced open issues #144–#147: volunteer nav IA split (`/dashboard` home vs `/scheduling` My Assignments) reflected in T16/T16.5, active specs in `docs/issues/144-*` … `147-*`, `ready-for-agent` on unblocked slices. #148 remained blocked until 144–147 ship.

- **2026-06-24 (`frontend-migration-web-next` Slices 2–5 TLC closeout):** Validated and archived #144–#147 — volunteer ([#144](https://github.com/kairan/onda-volunteer/issues/144) PR [#156](https://github.com/kairan/onda-volunteer/pull/156)), leader ([#145](https://github.com/kairan/onda-volunteer/issues/145) [#158](https://github.com/kairan/onda-volunteer/pull/158)), org-admin ([#146](https://github.com/kairan/onda-volunteer/issues/146) [#159](https://github.com/kairan/onda-volunteer/pull/159)), system admin ([#147](https://github.com/kairan/onda-volunteer/issues/147) [#160](https://github.com/kairan/onda-volunteer/pull/160)). `tasks.md` T14–T26 checked; T28 marked shipped ([#157](https://github.com/kairan/onda-volunteer/pull/157)); T27 partial (typecheck + test CI; web-next coverage floors open). Issue specs → `docs/issues/done/144-*` … `147-*`; active spec `docs/issues/148-web-next-migration-slice-6-cutover.md`. `pnpm --filter @onda/web-next test` — 105 Vitest tests green. **Next Execute:** [#148](https://github.com/kairan/onda-volunteer/issues/148) (T27 remainder + T29–T30 cutover).

- **2026-06-20 (Frontend migration Specify + Design):** Decided to **rebuild the frontend from scratch** instead of re-skinning in place. New parallel app `apps/web-next`, **same stack** (React 19 · Vite · TanStack Router · Tailwind 4), **rewrite data layer on TanStack Query v5**, **strangler** migration route-by-route with a **single production cutover** (`apps/web` stays green until then). `ui-refresh-onda-brand` becomes the **design source** (not a standalone execute). System Admin + org-admin **ported functionally** with neutral tokens (redesign deferred). Domain/data layer (`apiAuthHeaders`, `auth/`, `organization/`, `events/`, `i18n/`, `feedback/`) ported behavior-preserving; HOPE visual layer (`components/ui/*`, `shell/*`, `routes/*.tsx`, `styles/globals.css`, HOPE `theme/tokens.ts`) discarded. Loader vs Query: Query owns server state, router loaders only prefetch via `ensureQueryData`. TLC: `.specs/features/frontend-migration-web-next/`.

## Blockers

_(none)_

## Deferred ideas

_(none — ONBOARD-A5 toast promoted to active slice #124.)_

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
