# 146 — web-next migration Slice 4: Org-admin routes functional port (T24)

**Type:** AFK (functional port — neutral tokens, redesign deferred)  
**Status:** Open — **ready for agent** (Slice 1 [#143](https://github.com/kairan/onda-volunteer/issues/143) shipped 2026-06-21)  
**Label:** `ready-for-agent`  
**TLC:** `.specs/features/frontend-migration-web-next/` (MIG-ADMIN-01)

## Parent

- Blocked by: **none** (foundation [#143](https://github.com/kairan/onda-volunteer/issues/143) shipped)
- No serve-well redesign — neutral inherited Onda shell tokens only

## Tasks

- [ ] **T24** — port `ministries.tsx`, `volunteers.tsx`, `ministryLeaders.tsx` + `ministryStructureQueries.ts`; CRUD via `useMutation` with org-context key invalidation

## Done when

- [ ] All three pages render live data via `useQuery`; CRUD mutations invalidate relevant keys
- [ ] No HOPE classes; shell token defaults; each page flagged `// TODO: Onda design phase`
- [ ] Vitest behavior tests (one per page) + `pnpm lint` clean

**Gate:** quick. Consider splitting per-page if review is heavy.

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/146
