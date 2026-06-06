# Organization Structure Administration Specification

## Status

- **P1** (ORG-STRUCT-01–04): Implemented — tracker parity [#109](https://github.com/kairan/onda-volunteer/issues/109).
- **P2** (ORG-STRUCT-05): Design + Tasks approved — Execute via [#107](https://github.com/kairan/onda-volunteer/issues/107).
- **P2** (ORG-STRUCT-06): Deferred — backlog [#108](https://github.com/kairan/onda-volunteer/issues/108).

## Source references

- Platform PRD: `docs/prd/volunteer-management-platform.md` story 21 and Organization module notes.
- Domain glossary: `CONTEXT.md` (**Church**, **Campus**, **Ministry**, **Admin**, **Leader**, **Organization**).
- Completed adjacent slices: membership lifecycle (`docs/issues/done/46-admin-manages-ministry-membership-lifecycle.md`), role catalogs (`docs/issues/done/44-role-catalog-maintain-rename-retire.md`), leader delegation (`docs/issues/done/47-admin-delegates-leaders-across-churches.md`), and church stewardship access (`docs/issues/done/56-api-church-stewardship-access-module.md`).
- ADR 0001 shell/context decisions and ADR 0003 HOPE visual direction.

## Problem Statement

Onda now has shipped flows for membership, leader delegation, role catalogs, Time away, Events, and Assignments, but those flows assume **Church**, **Campus**, and **Ministry** structure already exists. The Platform PRD says accredited **Admins** manage **Ministries**, yet there is no dedicated slice for creating or renaming organization structure safely. Without this, new teams and changing church structures still require seed data or direct database support.

## Goals

- [x] Give accredited **Admins** a supported way to create and rename **Ministries** inside their accredited **Churches**.
- [x] Keep structure mutations scoped to explicit **Church** accreditation; do not introduce global or network-wide authority.
- [x] Preserve stable IDs and historical references so existing **Assignments**, **Unavailability**, memberships, and role history remain understandable after a rename.
- [x] Campus metadata/timezone maintenance is **P2** ([#107](https://github.com/kairan/onda-volunteer/issues/107)); Ministry archive deferred ([#108](https://github.com/kairan/onda-volunteer/issues/108)).

## Out of Scope

| Feature | Reason |
|---------|--------|
| Network-wide super **Admin** | Explicitly out of scope in the Platform PRD. |
| Household / non-sign-in **Volunteers** | Explicitly deferred in `CONTEXT.md` and the Platform PRD. |
| Public **Events** spanning multiple **Churches** | Explicitly deferred in `CONTEXT.md` and the Platform PRD. |
| Per-**Church** white-label branding | Deferred by current brand/domain separation. |
| Hard-deleting structure referenced by history | Conflicts with reporting-friendly history and scheduling auditability. |
| Public marketing page redesign | Deferred by web/HOPE PRDs. |

---

## User Stories

### P1: Admin creates and renames Ministries - MVP

**User Story**: As an accredited **Admin**, I want to create and rename **Ministries** in my accredited **Church**, so that new serving teams can use membership, roles, Time away, and scheduling without developer or database intervention.

**Why P1**: This is the direct missing slice behind the Platform PRD's "manage Ministries" language and unlocks day-to-day Organization administration without expanding permission concepts.

**Acceptance Criteria**:

1. WHEN an accredited **Admin** creates a **Ministry** for an accredited **Church** THEN the system SHALL persist the **Ministry** and expose it through existing Organization context reads.
2. WHEN a non-accredited user attempts to create or rename a **Ministry** THEN the system SHALL reject the request with a stable authorization error.
3. WHEN an accredited **Admin** renames a **Ministry** THEN the system SHALL preserve the **Ministry** ID and keep existing memberships, **Roles**, **Events**, **Assignments**, and **Unavailability** linked to that **Ministry**.
4. WHEN a create or rename request uses an empty, duplicate, or invalid name within the same **Church** THEN the system SHALL return field-level validation feedback.
5. WHEN the **Ministry** list changes THEN the web shell and Organization screens SHALL refresh from server truth using existing pessimistic mutation posture.

**Independent Test**: Seed an accredited **Admin**, create a **Ministry**, rename it, and verify the Organization context plus one existing membership/role/scheduling read path still resolve the same **Ministry** ID.

---

### P2: Campus metadata and timezone maintenance

**User Story**: As an accredited **Admin**, I want to maintain **Campus** names and IANA timezones for campuses under my accredited **Church** (tenant), so that context switching and schedule presentation stay accurate per locale as sites are added or renamed — without treating **Church** HQ timezone as the clock for every campus.

**Why P2**: `CONTEXT.md` anchors ministry presentation on the **active Campus** timezone. Campus timezone changes can surprise users; this may require human review and clearer copy than Ministry naming. **Church** `defaultTimezone` (#93) remains organizational metadata, not the multi-campus scheduling model.

**Domain note (multi-campus):** A **Church** is tenant-level (e.g. **Onda Dura**, sede in Joinville). **Campus Joinville** and **Campus Porto** are where local activities run; volunteers in Portugal stay under church Onda Dura but scheduling/presentation for their work uses **Campus Porto**’s timezone, not “church HQ timezone.” P2 Execute ([#107](https://github.com/kairan/onda-volunteer/issues/107)) edits **Campus** metadata only.

**Acceptance Criteria**:

1. WHEN an accredited **Admin** renames a **Campus** THEN the system SHALL update shell context labels without changing canonical scheduling instants.
2. WHEN an accredited **Admin** changes a **Campus** timezone THEN the system SHALL preserve UTC **Event**, **Assignment**, and **Unavailability** records and use the new IANA zone only for future presentation for ministry context tied to that **Campus** (and when that **Campus** is active in the shell).
3. WHEN a **Church** has one or more **Campuses** THEN the UI SHALL keep **Church** (tenant) and **Campus** (locale) selectors separate per ADR 0001; timezone maintenance for ministry operations SHALL be on the **Campus**, not by changing **Church** default timezone as a stand-in for remote campuses.

**Independent Test**: With two campuses under one **Church**, change **Campus Porto** timezone and verify an existing **Event** keeps the same UTC value while rendered local time for that campus follows Porto’s zone; **Campus Joinville** presentation is unchanged.

---

### P2: Safe Ministry retirement or archive

**User Story**: As an accredited **Admin**, I want to retire or archive a **Ministry** that no longer serves, so that it stops being used for new work while past volunteer history remains intact.

**Why P2**: The product already uses retirement semantics for **Roles**; structure retirement needs a separate decision because it affects memberships, leaders, **Unavailability**, and future scheduling.

**Acceptance Criteria**:

1. WHEN an accredited **Admin** archives a **Ministry** THEN the system SHALL prevent new **Events**, **Assignments**, memberships, role changes, and **Unavailability** for that **Ministry** unless a future spec explicitly allows exceptions.
2. WHEN historical records reference an archived **Ministry** THEN the system SHALL continue to display the **Ministry** name for history and reporting.
3. WHEN a user views Organization context THEN archived **Ministries** SHALL not appear as active choices for new scheduling workflows.

**Independent Test**: Archive a **Ministry**, verify new scheduling/membership writes are blocked, and verify past **Assignments** still display that **Ministry**.

---

### P3: System Admin — church provisioning and user stewardship

**Status:** Product decision **2026-05-31** — promote to its own TLC feature (recommended slug: `system-admin-platform`) rather than overloading church-scoped **Admin** flows.

**User Story**: As a **System Admin**, I want a dedicated dashboard to create **Churches**, manage **Church** metadata, and add or edit any user’s **Organization** permissions, so that onboarding and support do not depend on seed scripts or database access.

**Why P3**: Replaces manual/seed provisioning. Distinct from church-scoped **Admin**: **System Admin** is platform operator authority; **Admin** remains accredited per **Church** for in-church stewardship (membership, ministries, scheduling support).

**Scope (v1 direction — refine in Specify/Design)**:

| Capability | System Admin | Church-scoped Admin (existing) |
|------------|--------------|--------------------------------|
| Create **Church** (+ initial **Campus** / structure bootstrap) | Yes | No |
| Edit **Church** metadata (name, organizational `defaultTimezone`, etc.) | Yes | Church-scoped **Admin** via #93 — fallback metadata, not multi-campus presentation anchor |
| Create/link user identity (**Volunteer** profile) | Yes | No (membership invite flows only) |
| Grant/revoke **Admin** accreditation for a **Church** | Yes | No (cannot self-elevate across churches) |
| Assign **Leader** for a **Ministry** | Yes | Yes (within accredited churches) |
| Manage **Volunteer** **Ministry** membership | Yes | Yes (within accredited churches) |
| Scheduling, Time away, roster mutations | Support/debug TBD | Per existing slices |

**Acceptance Criteria** (draft — Design phase):

1. WHEN a user without **System Admin** attempts System Admin routes or APIs THEN the system SHALL reject with a stable authorization error.
2. WHEN a **System Admin** creates a **Church** THEN the system SHALL persist the **Church** and minimum structure needed for shell context (at least one **Campus** per product rules).
3. WHEN a **System Admin** edits a user THEN the system SHALL update the linked **Volunteer** identity and applicable **Organization** grants (accreditation, leadership, membership) with audit-friendly server truth.
4. WHEN a **System Admin** changes **Church** organizational `defaultTimezone` THEN canonical UTC **Event**, **Assignment**, and **Unavailability** records SHALL remain unchanged; active **Campus** timezone SHALL remain the presentation anchor for ministry context per P2.
5. WHEN a church-scoped **Admin** uses existing in-app flows THEN behavior SHALL be unchanged except where explicitly delegated to System Admin-only APIs.

**Independent Test**: System Admin creates a new **Church**, provisions a user with **Admin** accreditation for that **Church**, signs in as that user, and completes one existing Organization read (e.g. ministry list) without seed scripts.

**Out of scope for this slice** (unless Specify expands): impersonation (“act as user”), bulk import, billing, multi-tenant branding, network-wide combined **Public events**.

**Specify answers (2026-05-31):** See [system-admin-platform](../system-admin-platform/spec.md). Church **Admin** may edit accredited **Church** name and organizational `defaultTimezone` (`CHURCH-META-01`, shipped #93) — not System Admin–exclusive. Multi-campus ministry presentation is driven by **Campus** timezone (P2 / #107), not by retuning church default timezone for each locale.

---

## Edge Cases

- WHEN two **Admins** rename the same **Ministry** concurrently THEN the system SHALL settle on server truth and show a recoverable stale-data state if needed.
- WHEN a renamed **Ministry** has existing future **Events** THEN those **Events** SHALL continue to reference the same **Ministry**.
- WHEN a **Campus** timezone changes near a daylight-saving boundary THEN displayed times SHALL use the configured IANA timezone, not fixed offsets.
- WHEN an archived **Ministry** is referenced by a volunteer's past **Assignment** THEN history SHALL remain readable and not silently drop the row.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| ORG-STRUCT-01 | P1: Create Ministry | Execute | Verified |
| ORG-STRUCT-02 | P1: Rename Ministry | Execute | Verified |
| ORG-STRUCT-03 | P1: Admin authorization boundary | Execute | Verified |
| ORG-STRUCT-04 | P1: Validation and server-truth refresh | Execute | Verified |
| ORG-STRUCT-05 | P2: Campus metadata/timezone maintenance | Execute | [#107](https://github.com/kairan/onda-volunteer/issues/107) |
| ORG-STRUCT-06 | P2: Ministry archive/retirement | Backlog | [#108](https://github.com/kairan/onda-volunteer/issues/108) |
| ORG-STRUCT-07 | P3: System Admin platform (church + users) | Specify | Pending — split to `system-admin-platform` |

**Coverage:** 7 total — P1 shipped (01–04, tracker #109); P2 campus ready (#107); archive backlog (#108); P3 in `system-admin-platform`.

**Design / Tasks:** `.specs/features/organization-structure-administration/design.md`, `tasks.md`.

## Implementation Notes

- API:
  - `POST /churches/:churchId/ministries`
  - `PATCH /ministries/:ministryId`
  - Stable error codes: `MINISTRY_NAME_REQUIRED`, `MINISTRY_NAME_CONFLICT`, existing `ADMIN_NOT_ACCREDITED`.
- Web:
  - `/ministries` now includes a **Ministry structure** section for accredited **Admins**.
  - Organization context refreshes after create/rename so shell and selectors use server truth.
- Tests:
  - API e2e spec: `apps/api/test/ministry-structure.e2e-spec.ts`.
  - Web behavior spec: `apps/web/src/routes/ministries.behavior.test.tsx`.

---

## Open Questions

1. Should the first implementation be **Ministry** create/rename only, leaving Campus metadata and Ministry archive to follow-up issues?
   - **Answered for P1:** yes. Campus metadata and Ministry archive remain future slices.
2. Does the product need a Church setup/operator role, or will first **Church** and first **Admin** continue to be provisioned outside the app?
   - **Answered 2026-05-31:** yes — **System Admin** dashboard for **Church** creation and user/role stewardship; see P3 and `.specs/project/STATE.md`.
3. Should **Ministry** names be unique per **Church**, or only strongly warned for duplicates?
   - **Answered for P1:** unique per **Church**, case-insensitive, enforced in the service layer and by a PostgreSQL unique index on `(churchId, LOWER(name))`.
4. If **Campus** timezone changes, does the UI need an explicit review dialog explaining that existing UTC schedules are unchanged but local presentation changes?
   - **Answered for P2:** yes — confirm dialog before save when timezone changes (`design.md`).

## Success Criteria

- [x] Accredited **Admins** can manage basic **Ministry** structure without direct database access.
- [x] Existing Organization, Availability, and Scheduling reads continue to work against stable structure IDs after renames.
- [x] Campus scope: P2 [#107](https://github.com/kairan/onda-volunteer/issues/107); archive deferred [#108](https://github.com/kairan/onda-volunteer/issues/108); first-admin setup in `system-admin-platform`.
