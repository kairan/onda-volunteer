# Serve Well — Lovable design reference (local clone)

**Live prototype:** [https://serve-well.lovable.app/](https://serve-well.lovable.app/)

**Operator console:** [https://serve-well.lovable.app/system-admin](https://serve-well.lovable.app/system-admin)

**Snapshot refreshed:** 2026-07-01 (synced from local Lovable export; not wired to any absolute path in repo)

Exploratory UX built in Lovable — **not production code**. Use for layout, hierarchy, tokens, and interaction patterns when building **`apps/web-onda`**. Canonical Execute spec: [`.specs/features/frontend-restart-serve-well-base/`](../../.specs/features/frontend-restart-serve-well-base/) · ADR [0007](../../docs/adr/0007-frontend-serve-well-plus-api.md).

> **Do not run this folder as part of the monorepo CI.** It is a TanStack Start export (Bun lockfile, demo auth). Port **selected files** into `apps/web-onda` instead of wiring this package into `pnpm-workspace.yaml`.

## Local source map (port into `web-onda`)

| Reference file | Port to | Notes |
|----------------|---------|-------|
| [`src/styles.css`](src/styles.css) | `apps/web-onda/src/styles/globals.css` | oklch shadcn vars, `--shadow-card`, Space Grotesk stack; self-host fonts |
| [`src/components/ui/*`](src/components/ui/) | `apps/web-onda/src/components/ui/` | Full shadcn set (T02) |
| [`src/components/onda/AppShell.tsx`](src/components/onda/AppShell.tsx) | `apps/web-onda/src/components/onda/` | Layout only — **drop** role switcher, search, demo `useRole` |
| [`src/components/onda/AppSidebar.tsx`](src/components/onda/AppSidebar.tsx) | `apps/web-onda/src/components/onda/` | Nav structure — wire to `buildNavForWorkingContext` |
| [`src/components/onda/WeekTimeline.tsx`](src/components/onda/WeekTimeline.tsx) | `apps/web-onda/src/components/onda/` | Shared component (wire in phase 2+) |
| [`src/components/onda/modals.tsx`](src/components/onda/modals.tsx) | `apps/web-onda/src/components/onda/` | Dialog patterns — wire to mutations |
| [`src/components/onda/dashboards/VolunteerDashboard.tsx`](src/components/onda/dashboards/VolunteerDashboard.tsx) | `apps/web-onda/src/routes/` | Split across `/dashboard` + volunteer `/scheduling` |
| [`src/components/onda/dashboards/MinistryLeaderDashboard.tsx`](src/components/onda/dashboards/MinistryLeaderDashboard.tsx) | `apps/web-onda/src/routes/` | Leader `/scheduling` layout |

## Do not port (demo / wrong stack)

| Path | Reason |
|------|--------|
| `src/server.ts`, `src/start.ts` | TanStack Start — monorepo uses Vite SPA |
| `src/lib/role.tsx`, `useRole` | Demo role dropdown |
| `src/lib/auth.tsx`, `integrations/supabase/*` | Replaced by `web-next` auth graft |
| `src/routes/*` as-is | Production URLs differ — copy **layouts** only |

## Role coverage in prototype

| Role | Lovable URL / switcher | In scope for v1 (`web-onda`) |
|------|------------------------|------------------------------|
| Volunteer | `/` (role: Volunteer) | Yes → prod route `/dashboard` |
| Ministry Leader | `/` (role: Ministry Leader) | Yes → prod route `/scheduling` (leader landing) |
| Church Admin | `/` (role: Church Admin) | Functional port (RST-ADMIN-01) |
| System Admin | `/system-admin` | Functional port — ADR 0005 |

## Prototype vs product (do not copy blindly)

| Lovable element | Product today | Spec decision |
|-----------------|---------------|---------------|
| Accept / Decline on assignment cards | Release on event detail only | **Out of scope** v1 |
| Event location (Main Auditorium, Chapel) | No venue field on **Event** | **Out of scope** |
| Global search bar | Not implemented | **Out of scope** v1 |
| Role switcher dropdown | Church/Campus + working context | **Demo only** |
| Routes `/`, `/assignments`, `/roster` | `/dashboard`, `/scheduling`, parity with `apps/web` | **Map layouts, not URLs** |

## Canonical specs

- Execute: [`.specs/features/frontend-restart-serve-well-base/`](../../.specs/features/frontend-restart-serve-well-base/)
- Brand tokens: [`.specs/features/ui-refresh-onda-brand/`](../../.specs/features/ui-refresh-onda-brand/) · ADR [0006](../../docs/adr/0006-onda-brand-visual-system.md)
