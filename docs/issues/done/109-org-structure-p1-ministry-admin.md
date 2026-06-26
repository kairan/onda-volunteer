# 109 — Tracker: P1 ministry structure administration (ORG-STRUCT-01–04)

**Type:** Documentation / tracker parity  
**Label:** `ready-for-agent`  
**Blocked by:** none  
**TLC:** `.specs/archive/features/organization-structure-administration/` (P1 — code shipped)

## What shipped

Accredited **Admin** create/rename **Ministry** within accredited **Church**; stable IDs preserved; organization context refresh after mutations.

## Tasks

T-ORG-P1-01

## Acceptance criteria

- [x] Accredited **Admin** can create and rename **Ministries** (ORG-STRUCT-01, ORG-STRUCT-02)
- [x] Non-accredited users rejected with `ADMIN_NOT_ACCREDITED` (ORG-STRUCT-03)
- [x] Empty/duplicate names rejected; shell refreshes from server truth (ORG-STRUCT-04)
- [x] API e2e: `apps/api/test/ministry-structure.e2e-spec.ts`
- [x] Web UI: `/ministries` **Ministry structure** section; behavior `apps/web/src/routes/ministries.behavior.test.tsx`

## Implementation references

- API: `POST /churches/:churchId/ministries`, `PATCH /ministries/:ministryId`
- Web: `apps/web/src/organization/ministryStructure.ts`, `apps/web/src/routes/ministries.tsx`
- TLC spec traceability: ORG-STRUCT-01–04 in `.specs/archive/features/organization-structure-administration/spec.md`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/109
