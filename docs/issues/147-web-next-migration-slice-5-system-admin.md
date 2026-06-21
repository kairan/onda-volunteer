# 147 — web-next migration Slice 5: System Admin functional port (T25–T26)

**Type:** AFK (functional port — neutral tokens, redesign deferred)  
**Status:** Open — **ready for agent** (Slice 1 [#143](https://github.com/kairan/onda-volunteer/issues/143) shipped 2026-06-21)  
**Label:** `ready-for-agent`  
**TLC:** `.specs/features/frontend-migration-web-next/` (MIG-ADMIN-01) · ADR 0005

## Parent

- Blocked by: **none** (foundation [#143](https://github.com/kairan/onda-volunteer/issues/143) shipped)
- No serve-well redesign — neutral inherited Onda shell tokens only

## Tasks

- [ ] **T25** — `SystemAdminShell` + `ensureSystemAdminRouteAccess` guard; `/system-admin/*` routes
- [ ] **T26** — 7 content pages + `systemAdminQueries.ts` on `useQuery`

## Done when

- [ ] Non-system-admin redirected from `/system-admin/*`; shell renders with Onda tokens
- [ ] All pages render live data via `useQuery`; church create invalidates `queryKeys.systemAdmin.churches()`; read-only scheduling guard respected
- [ ] Vitest behavior tests + `pnpm lint` clean

**Gate:** quick. T26 (7 pages) may be split per-page if review is heavy.

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/147
