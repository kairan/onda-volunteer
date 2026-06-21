# 143 — web-next migration Slice 1: Foundation, data core & shell (T01–T13.5)

**Type:** AFK (foundation chain — no standalone user value)  
**Status:** Shipped (validated 2026-06-21)  
**TLC:** `.specs/features/frontend-migration-web-next/` (MIG-FND-01..04, MIG-DATA-01..02, MIG-CUT-01 route parity)

## Parent

- TLC feature: `.specs/features/frontend-migration-web-next/` — Slice 1 of 6; unlocks [#144](https://github.com/kairan/onda-volunteer/issues/144)–[#148](https://github.com/kairan/onda-volunteer/issues/148)
- Planning: [#142](https://github.com/kairan/onda-volunteer/pull/142) (TLC specs + ADR 0006)

## What was built

Parallel `apps/web-next` package on React 19 · Vite · TanStack Router · TanStack Query · Tailwind 4 with Onda brand tokens (no HOPE artifacts). Data core ported: auth primitives, `apiClient`, `queryKeys`, `QueryClient`, i18n + `LocalTimeProvider`, `OrganizationProvider` on TanStack Query. Shell: grant-gated nav manifest, `AppShell` (shadcn `Sidebar`), full route tree with auth guard (route strings match `apps/web`), throwaway mock-data brand preview on `/dashboard` and `/scheduling` (MIG-FND-04).

**PRs:** [#151](https://github.com/kairan/onda-volunteer/pull/151) (T01–T03), [#150](https://github.com/kairan/onda-volunteer/pull/150) (T04–T10), [#152](https://github.com/kairan/onda-volunteer/pull/152) / [#153](https://github.com/kairan/onda-volunteer/pull/153) (T11–T13.5)

## Acceptance criteria

### Foundation (T01–T03)

- [x] `apps/web-next` package scaffold; `pnpm dev:web-next` on distinct port (5174)
- [x] Onda `globals.css` + `tokens.ts` + theme contract test (Onda vars present, HOPE vars absent)
- [x] shadcn primitives on Onda tokens (button, card, input, badge, dialog, sheet, skeleton, avatar, sidebar)

### Data core (T04–T10)

- [x] Auth primitives port (`sessionToken`, `supabaseClient`, `authSession`, `devVolunteerStorage`)
- [x] `AuthSessionProvider` + `fetchIdentityMe` port
- [x] `apiClient` (protected-headers fetch + 401→dev retry) + `apiError`
- [x] `queryKeys` typed factory
- [x] `QueryClient` + provider (pessimistic defaults)
- [x] i18n + `LocalTimeProvider` port (pt-BR default)
- [x] `OrganizationProvider` rebuilt on TanStack Query

### Shell (T11–T13)

- [x] Grant-gated nav manifest
- [x] `AppShell` (ADR 0001 layout, Onda tokens, `shellRoute()` helper, toast host)
- [x] `router.tsx` route tree + auth guard + stubs; providers wired in `main.tsx`; route parity with `apps/web/src/router.tsx`

### Brand checkpoint (T13.5)

- [x] Mock-data look-and-feel preview: Volunteer `/dashboard` + `/scheduling` and Leader `/scheduling` using Onda components + fixtures under `src/__preview__/` (no `apiClient`/Query in preview bodies)

### Done when (slice gates)

- [x] `pnpm --filter @onda/web-next build` green; typecheck + test green (66 Vitest tests)
- [x] No HOPE artifacts imported
- [x] Shell renders with org context + grant-gated nav; auth guard redirects unauthenticated
- [x] Route tree paths match current `apps/web` router
- [x] Brand checkpoint renders from mock fixtures (throwaway markers present)
- [x] `pnpm lint` clean (`--max-warnings 0`)

## HITL

T13.5 visual sign-off checklist remains in `.specs/features/frontend-migration-web-next/hitl-signoff.md` for human brand review at 1440px; automated gates shipped without blocking on HITL rows (per STATE.md HITL gate policy).

## Specification links

- Spec: `.specs/features/frontend-migration-web-next/spec.md`
- Design: `.specs/features/frontend-migration-web-next/design.md`
- Tasks: `.specs/features/frontend-migration-web-next/tasks.md` (T01–T13.5)
- Context: `.specs/features/frontend-migration-web-next/context.md` (route parity, auth UX, volunteer nav IA)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/143
