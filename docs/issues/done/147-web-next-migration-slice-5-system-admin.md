# 147 — web-next migration Slice 5: System Admin functional port (T25–T26)

**Type:** AFK (functional port — neutral tokens, redesign deferred)  
**Status:** Shipped (validated 2026-06-24)  
**TLC:** `.specs/features/frontend-migration-web-next/` (MIG-ADMIN-01) · ADR 0005

## Parent

- Foundation [#143](https://github.com/kairan/onda-volunteer/issues/143) shipped 2026-06-21
- Unblocks Slice 6 CI/cutover [#148](https://github.com/kairan/onda-volunteer/issues/148) (all parity slices at feature parity)

## What was built

`SystemAdminShell` + route guards, seven system-admin content pages on `useQuery`, church create invalidation, read-only scheduling guard per ADR 0005.

**PR:** [#160](https://github.com/kairan/onda-volunteer/pull/160)

## Acceptance criteria

- [x] **T25** — `SystemAdminShell` + `ensureSystemAdminRouteAccess` guard; `/system-admin/*` routes
- [x] **T26** — 7 content pages + `systemAdminQueries.ts` on `useQuery`

### Done when (slice gates)

- [x] Non-system-admin redirected from `/system-admin/*`; shell renders with Onda tokens
- [x] All pages render live data via `useQuery`; church create invalidates `queryKeys.systemAdmin.churches()`; read-only scheduling guard respected
- [x] Vitest behavior tests + `pnpm lint` clean

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/147
