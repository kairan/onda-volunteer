# Serve Well — Lovable design reference

**Live prototype:** [https://serve-well.lovable.app/](https://serve-well.lovable.app/)

**Operator console:** [https://serve-well.lovable.app/system-admin](https://serve-well.lovable.app/system-admin)

Exploratory UX built in Lovable, now the visual reference for the parallel **`apps/web-next`** rebuild (per [`frontend-migration-web-next`](../../.specs/features/frontend-migration-web-next/)) — not an in-place refresh of `apps/web`. **Not production code** — use for layout, hierarchy, and interaction patterns only.

## What to copy into the repo

| Artifact | Purpose |
|----------|---------|
| Screenshots (Volunteer + Leader, desktop + mobile) | Visual north star during Execute |
| Extracted CSS tokens | Match `design.md` in `.specs/features/ui-refresh-onda-brand/` |
| Component hierarchy notes | Map Lovable sections → existing routes |

## Role coverage in prototype

| Role | Lovable URL / switcher | In scope for v1 refresh spec |
|------|------------------------|------------------------------|
| Volunteer | `/` (role: Volunteer) | Yes |
| Ministry Leader | `/` (role: Ministry Leader) | Yes |
| Church Admin | `/` (role: Church Admin) | **Future phase** — do not implement from prototype yet |
| System Admin | `/system-admin` | **Future phase** — keep current operator shell until spec’d |

## Prototype vs product (do not copy blindly)

| Lovable element | Product today | Spec decision |
|-----------------|---------------|---------------|
| Accept / Decline on assignment cards | Release on event detail only | **Out of scope** v1 refresh — see `context.md` |
| Event location (Main Auditorium, Chapel) | No venue field on **Event** | **Out of scope** |
| Global search bar | Not implemented | **Out of scope** v1 |
| Role switcher dropdown | Composed grants + Church/Campus switchers | **Demo only** — use real shell context controls |
| Admin KPI cards (+14 this month, 92% fill) | No reporting API | **Future** — Church Admin phase |
| Event Published / Draft badges | `PUBLIC`/`PRIVATE` + cancellation | Use domain terms in implementation |

## Canonical spec

Implementation requirements and brand tokens: [`.specs/features/ui-refresh-onda-brand/`](../../.specs/features/ui-refresh-onda-brand/).
