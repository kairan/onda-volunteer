# 108 — Ministry archive (ORG-STRUCT-06)

**Type:** Feature  
**Shipped:** 2026-06-06 via [#113](https://github.com/kairan/onda-volunteer/pull/113)  
**TLC:** `.specs/features/organization-structure-administration/` (`spec.md` ORG-STRUCT-06, `design.md` § Ministry archive, `tasks.md` T-ARCHIVE-*)

## Summary

Accredited **Admin** archives a **Ministry** so new scheduling, membership, role-catalog, and unavailability **create** writes are blocked while history remains readable and existing unavailability rows can be cleaned up. Requires `Ministry.archivedAt` + shared `assertMinistryAcceptsWrites` across Organization, Events, and Scheduling.

## Blockers cleared

- [x] Schema decision: `archivedAt DateTime?` on `Ministry`
- [x] Cross-module write guard inventory + shared helper pattern
- [x] API contract: `POST /ministries/:ministryId/archive` (archive-only — no unarchive in v1)
- [x] Organization context + web picker filtering rules
- [x] Product decisions locked 2026-06-06 (see below)

## Product decisions (locked 2026-06-06)

| Topic | Decision |
|-------|----------|
| **Unarchive** | **Not in v1** — archive-only; no unarchive endpoint or UI |
| **Unavailability on archived ministries** | Create and bulk create blocked; **update/delete allowed** for cleanup of existing rows |
| **Shell ministry switcher** | Archived ministries visible **only** for church-scoped **Admin** and **System Admin** (with badge); **hidden** from non-admin switcher |
| **Archive confirm i18n** | Agent drafts `en` + `pt-BR` in Execute (role retire #44 pattern); no HITL gate |

## What was built

See **design.md** § Ministry archive. High level:

1. Prisma migration — `Ministry.archivedAt`
2. `ministry-write-guard.ts` + guards on listed write paths (unavailability update/delete exempt)
3. `OrganizationService.archiveMinistry` (void future assignments in transaction)
4. Web archive UI on `/ministries` structure section + picker filters + admin-only shell switcher visibility
5. API e2e + web behavior tests

## Acceptance criteria

- [x] Archive sets `archivedAt` and voids future **Assignments** for that **Ministry**
- [x] New writes return `MINISTRY_ARCHIVED` (events, assignments, memberships, roles, unavailability create/bulk)
- [x] Unavailability update/delete on existing rows succeeds on archived ministry (cleanup)
- [x] Historical rows still show **Ministry** name; context returns `archivedAt`
- [x] Archived **Ministries** hidden from active scheduling / Time away pickers; visible in admin structure with badge
- [x] Shell switcher: archived visible with badge for admin/system admin only; hidden for others
- [x] Rename on archived ministry still works for accredited **Admin**
- [x] No unarchive endpoint or UI in v1

## Depends on

- P1 ministry structure shipped ([#109](https://github.com/kairan/onda-volunteer/issues/109))
- P2 campus metadata ([#107](https://github.com/kairan/onda-volunteer/issues/107))

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/108
