# Organization Structure Administration Specification

## Status

Draft from the 2026-05-27 TLC missing-feature audit. No GitHub issue has been assigned yet.

## Source references

- Platform PRD: `docs/prd/volunteer-management-platform.md` story 21 and Organization module notes.
- Domain glossary: `CONTEXT.md` (**Church**, **Campus**, **Ministry**, **Admin**, **Leader**, **Organization**).
- Completed adjacent slices: membership lifecycle (`docs/issues/done/46-admin-manages-ministry-membership-lifecycle.md`), role catalogs (`docs/issues/done/44-role-catalog-maintain-rename-retire.md`), leader delegation (`docs/issues/done/47-admin-delegates-leaders-across-churches.md`), and church stewardship access (`docs/issues/done/56-api-church-stewardship-access-module.md`).
- ADR 0001 shell/context decisions and ADR 0003 HOPE visual direction.

## Problem Statement

Onda now has shipped flows for membership, leader delegation, role catalogs, Time away, Events, and Assignments, but those flows assume **Church**, **Campus**, and **Ministry** structure already exists. The Platform PRD says accredited **Admins** manage **Ministries**, yet there is no dedicated slice for creating or renaming organization structure safely. Without this, new teams and changing church structures still require seed data or direct database support.

## Goals

- [ ] Give accredited **Admins** a supported way to create and rename **Ministries** inside their accredited **Churches**.
- [ ] Keep structure mutations scoped to explicit **Church** accreditation; do not introduce global or network-wide authority.
- [ ] Preserve stable IDs and historical references so existing **Assignments**, **Unavailability**, memberships, and role history remain understandable after a rename.
- [ ] Define whether Campus metadata/timezone maintenance belongs in this first slice or a follow-up.

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

**User Story**: As an accredited **Admin**, I want to maintain **Campus** names and timezones for my accredited **Church**, so that context switching and schedule presentation stay accurate as church locations change.

**Why P2**: `CONTEXT.md` gives **Campus** timezone presentation meaning, but timezone changes can surprise users; this may require human review and clearer copy than Ministry naming.

**Acceptance Criteria**:

1. WHEN an accredited **Admin** renames a **Campus** THEN the system SHALL update shell context labels without changing canonical scheduling instants.
2. WHEN an accredited **Admin** changes a **Campus** timezone THEN the system SHALL preserve UTC **Event**, **Assignment**, and **Unavailability** records and use the new timezone only for future presentation.
3. WHEN a **Church** has one or more **Campuses** THEN the UI SHALL keep **Church** and **Campus** selectors separate per ADR 0001.

**Independent Test**: Change a **Campus** timezone and verify an existing **Event** keeps the same UTC value while rendered local time follows the updated **Campus** timezone.

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

### P3: Church metadata and first-admin setup

**User Story**: As a product operator, I want a supported path to maintain **Church** metadata and bootstrap first **Admin** accreditation, so that new Churches do not depend on manual seed scripts forever.

**Why P3**: This may imply product-operator authority beyond church-scoped **Admin**, which is deliberately not the same as the out-of-scope network-wide super **Admin**. It needs an explicit decision before implementation.

**Acceptance Criteria**:

1. WHEN this story is promoted beyond P3 THEN the spec SHALL define who may create or edit **Church** records without introducing implicit global **Admin** powers.
2. WHEN **Church** default timezone changes THEN canonical UTC records SHALL remain unchanged and presentation effects SHALL be documented for users.

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
| ORG-STRUCT-01 | P1: Create Ministry | Specify | Pending |
| ORG-STRUCT-02 | P1: Rename Ministry | Specify | Pending |
| ORG-STRUCT-03 | P1: Admin authorization boundary | Specify | Pending |
| ORG-STRUCT-04 | P1: Validation and server-truth refresh | Specify | Pending |
| ORG-STRUCT-05 | P2: Campus metadata/timezone maintenance | Specify | Pending |
| ORG-STRUCT-06 | P2: Ministry archive/retirement | Specify | Pending |
| ORG-STRUCT-07 | P3: Church metadata and first-admin setup | Specify | Pending |

**Coverage:** 7 total, 0 mapped to tasks, 7 unmapped until Design/Tasks.

---

## Open Questions

1. Should the first implementation be **Ministry** create/rename only, leaving Campus metadata and Ministry archive to follow-up issues?
2. Does the product need a Church setup/operator role, or will first **Church** and first **Admin** continue to be provisioned outside the app?
3. Should **Ministry** names be unique per **Church**, or only strongly warned for duplicates?
4. If **Campus** timezone changes, does the UI need an explicit review dialog explaining that existing UTC schedules are unchanged but local presentation changes?

## Success Criteria

- [ ] Accredited **Admins** can manage basic **Ministry** structure without direct database access.
- [ ] Existing Organization, Availability, and Scheduling reads continue to work against stable structure IDs after renames.
- [ ] The next Design phase has explicit answers for Campus scope, archive semantics, and first-admin setup.
