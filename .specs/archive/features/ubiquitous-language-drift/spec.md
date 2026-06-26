# Ubiquitous language drift — Specification

## Status

Shipped — validated 2026-06-18 ([#131](https://github.com/kairan/onda-volunteer/issues/131)–[#135](https://github.com/kairan/onda-volunteer/issues/135)).

## Problem Statement

A read-only audit of `apps/api` and `apps/web` against `CONTEXT.md` found **behavioral gaps** (invariants not enforced, campus timezone not used on some surfaces) and **terminology drift** (UI copy and API field names that contradict the glossary). The glossary quick-reference card was added to `CONTEXT.md`; gaps closed via GitHub issues **#131–#135** (specs in `docs/issues/done/`).

## Goals

- [x] Close **HIGH** invariant gaps (inactive membership on Unavailability create; campus-authoritative event display where the shell already selects a Campus).
- [x] Ship missing **Volunteer** self-service for changing own **Unavailability** (glossary: "establish or change").
- [x] Document **Inactive** membership status in `CONTEXT.md` (used in schema/UI but undefined in glossary).
- [x] Align web i18n and dev-only labels with glossary terms (`Time away`, **System Admin**, permission levels vs catalog **Role**).

## Out of Scope

| Item | Reason |
|------|--------|
| Prisma rename `MinistryRole` → `Role` | Table/model rename; cosmetic; no behavior change |
| Prisma rename `SystemAdministrator` / `MinistryLeader` | Same |
| Internal `unavailabilityBlocks` / `LEADER_NOT_ASSIGNED` error codes | Internal-only; low signal |
| Add `campusId` FK on `Event` | Presentation follows active **Campus** in shell (ADR/org-structure P2); UTC instants stay canonical |
| Household / multi-Volunteer per sign-in | Explicitly deferred in `CONTEXT.md` |

## Source references

- Glossary: `CONTEXT.md` (incl. quick reference)
- Audit: conversation 2026-06-18 (API + web subagent reports)
- Related shipped slices: #39 (time away list/create), #41 (leader Unavailability), #107 (campus timezone)

---

## Requirements

| ID | Requirement | Priority | Issue |
|----|-------------|----------|-------|
| GLOSS-01 | Define **Inactive** membership status in `CONTEXT.md` (+ quick reference); clarify Pending/Active/Inactive lifecycle | P1 | [#131](https://github.com/kairan/onda-volunteer/issues/131) |
| AVAIL-01 | `createUnavailability` rejects `INACTIVE` membership (align with bulk path) | P1 | [#132](https://github.com/kairan/onda-volunteer/issues/132) |
| AVAIL-02 | **Volunteer** may update and delete own **Unavailability**; leaders/admins retain stewardship scope | P1 | [#133](https://github.com/kairan/onda-volunteer/issues/133) |
| SCHED-01 | Event list/detail and create flows use active **Campus** IANA timezone for presentation when selected; copy says "campus timezone" not "church timezone" | P1 | [#134](https://github.com/kairan/onda-volunteer/issues/134) |
| I18N-01 | Web i18n + dev persona labels align with glossary (pt-BR Time away label, System Admin, permission levels, indisponibilidade consistency) | P2 | [#135](https://github.com/kairan/onda-volunteer/issues/135) |

---

## User Stories

### Story 1: Inactive members cannot record new Unavailability

**User Story**: As the **Availability** bounded context, I must reject **Unavailability** for **Volunteers** whose **Ministry membership** is **Inactive**, so orphan rows cannot be created after deactivation.

**Acceptance Criteria** (AVAIL-01):

1. WHEN a **Volunteer** with `INACTIVE` membership calls single-create **Unavailability** THEN the API returns `MEMBERSHIP_NOT_ACTIVE` (same as bulk path).
2. WHEN membership is **Pending** or **Active** THEN create succeeds per existing rules.
3. Automated API e2e covers inactive rejection on single-create.

### Story 2: Volunteer edits own Time away

**User Story**: As a **Volunteer**, I want to change or remove my own **Unavailability** from **Time away**, so I can correct mistakes without asking a **Leader**.

**Acceptance Criteria** (AVAIL-02):

1. WHEN the signed-in **Volunteer** owns the **Unavailability** row THEN PATCH and DELETE succeed without **Leader** accreditation.
2. WHEN a **Leader** or **Admin** acts on another **Volunteer**'s row THEN existing stewardship rules apply.
3. Web **Time away** UI exposes edit/remove for own rows.
4. Automated tests cover volunteer self-service and unauthorized cross-volunteer paths.

### Story 3: Campus clock on event surfaces

**User Story**: As a **Volunteer** at **Campus Porto**, I want event times shown in Porto's timezone when that campus is active, so presentation matches local ministry work.

**Acceptance Criteria** (SCHED-01):

1. WHEN active **Campus** is selected THEN scheduling event detail uses campus IANA zone (not `church.defaultTimezone` alone).
2. WHEN create-event hint shows a timezone THEN copy names **campus timezone** when campus zone is in use.
3. System Admin scheduling read view uses consistent presentation rules or honest labeling.
4. UTC stored instants unchanged; tests cover multi-campus presentation.

### Story 4: UI speaks the glossary

**User Story**: As a contributor, I want user-facing strings to match `CONTEXT.md`, so **Time away**, **System Admin**, and **Unavailability** terms stay consistent across locales.

**Acceptance Criteria** (I18N-01):

1. pt-BR nav/title for **Time away** avoids "free time" connotation (`Tempo livre` → neutral absence wording).
2. Dev persona and capability labels say **System Admin**, not "System operator".
3. System Admin nav avoids "roles" for permission levels.
4. pt-BR ministry structure copy uses **indisponibilidade** consistently.
5. Duplicate dead `churchSettings` block removed from both `ministries.json` locale files.
