# Serve Well — Lovable design reference (local clone)

**Live prototype:** [https://serve-well.lovable.app/](https://serve-well.lovable.app/)

**Operator console:** [https://serve-well.lovable.app/system-admin](https://serve-well.lovable.app/system-admin)

Exploratory UX built in Lovable — **not production code**. Use for layout, hierarchy, tokens, and interaction patterns when building **`apps/web-next`**. Canonical requirements live in [`.specs/features/ui-refresh-onda-brand/`](../../.specs/features/ui-refresh-onda-brand/).

> **Do not run this folder as part of the monorepo CI.** It is a TanStack Start export (Bun lockfile, demo auth). Port **selected files** into `apps/web-next` instead of wiring this package into `pnpm-workspace.yaml`.

## Local source map (port into `web-next`)

| Reference file | Port to | Notes |
|----------------|---------|-------|
| [`src/styles.css`](src/styles.css) | `apps/web-next/src/styles/globals.css` | oklch shadcn vars, `--shadow-card`, Space Grotesk stack |
| [`src/components/ui/sidebar.tsx`](src/components/ui/sidebar.tsx) | `apps/web-next/src/components/ui/` | Required for shell (T03) |
| [`src/components/onda/AppShell.tsx`](src/components/onda/AppShell.tsx) | `apps/web-next/src/shell/` | Layout only — **drop** role switcher, search, demo `useRole` |
| [`src/components/onda/AppSidebar.tsx`](src/components/onda/AppSidebar.tsx) | `apps/web-next/src/shell/` | Nav structure — wire to `buildNavForGrants`, production routes |
| [`src/components/onda/dashboards/VolunteerDashboard.tsx`](src/components/onda/dashboards/VolunteerDashboard.tsx) | `apps/web-next/src/routes/dashboard.tsx` (preview → live) | **Drop** Accept/Decline, location rows |
| [`src/components/onda/dashboards/MinistryLeaderDashboard.tsx`](src/components/onda/dashboards/MinistryLeaderDashboard.tsx) | `apps/web-next/src/routes/scheduling.tsx` (preview → live) | Keep Assign/Release CTAs; drop pending badges |
| [`src/components/ui/card.tsx`](src/components/ui/card.tsx), [`badge.tsx`](src/components/ui/badge.tsx), [`button.tsx`](src/components/ui/button.tsx), [`avatar.tsx`](src/components/ui/avatar.tsx) | `apps/web-next/src/components/ui/` | Match `shadow-card` + rounded-lg patterns |

## Role coverage in prototype

| Role | Lovable URL / switcher | In scope for v1 refresh spec |
|------|------------------------|------------------------------|
| Volunteer | `/` (role: Volunteer) | Yes → prod route `/dashboard` |
| Ministry Leader | `/` (role: Ministry Leader) | Yes → prod route `/scheduling` (leader landing) |
| Church Admin | `/` (role: Church Admin) | **Future phase** |
| System Admin | `/system-admin` | **Future phase** — neutral functional port only |

## Prototype vs product (do not copy blindly)

| Lovable element | Product today | Spec decision |
|-----------------|---------------|---------------|
| Accept / Decline on assignment cards | Release on event detail only | **Out of scope** v1 — see `context.md` |
| Event location (Main Auditorium, Chapel) | No venue field on **Event** | **Out of scope** |
| Global search bar | Not implemented | **Out of scope** v1 |
| Role switcher dropdown | Composed grants + Church/Campus switchers | **Demo only** |
| Admin KPI cards (+14 this month, 92% fill) | No reporting API | **Future** — Church Admin phase |
| Event Published / Draft badges | `PUBLIC`/`PRIVATE` + cancellation | Use domain terms in implementation |
| Routes `/`, `/assignments`, `/roster` | `/dashboard`, `/scheduling`, parity with `apps/web` | **Map layouts, not URLs** |

## Canonical spec

Implementation requirements and brand tokens: [`.specs/features/ui-refresh-onda-brand/`](../../.specs/features/ui-refresh-onda-brand/).
