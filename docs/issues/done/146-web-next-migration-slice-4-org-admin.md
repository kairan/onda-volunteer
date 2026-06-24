# 146 — web-next migration Slice 4: Org-admin routes functional port (T24)

**Type:** AFK (functional port — neutral tokens, redesign deferred)  
**Status:** Shipped (validated 2026-06-24)  
**TLC:** `.specs/features/frontend-migration-web-next/` (MIG-ADMIN-01)

## Parent

- Foundation [#143](https://github.com/kairan/onda-volunteer/issues/143) shipped 2026-06-21
- No serve-well redesign — neutral inherited Onda shell tokens only

## What was built

Functional port of `ministries.tsx`, `volunteers.tsx`, `ministryLeaders.tsx` with `ministryStructureQueries.ts`; CRUD via `useMutation` with org-context key invalidation; Vitest behavior tests per page.

**PR:** [#159](https://github.com/kairan/onda-volunteer/pull/159)

## Acceptance criteria

- [x] **T24** — port org-admin pages + queries; CRUD via `useMutation` with org-context key invalidation

### Done when (slice gates)

- [x] All three pages render live data via `useQuery`; CRUD mutations invalidate relevant keys
- [x] No HOPE classes; shell token defaults; each page flagged `// TODO: Onda design phase`
- [x] Vitest behavior tests (one per page) + `pnpm lint` clean

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/146
