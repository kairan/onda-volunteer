# Frontend restart — context & decisions

Captured 2026-07-01. Product owner direction: **visual layer of `web-next` is not acceptable**; restart from **serve-well presentation + existing API/data layer**.

---

## Why pivot

| Issue with `web-next` approach | Symptom |
|--------------------------------|---------|
| Cherry-pick visual onto ported `web` routes | UI never matches Lovable fidelity |
| Shell rebuilt incrementally | Inconsistent spacing, cards, nav |
| IA split (`/dashboard` + `/scheduling`) without visual unity | Feels unlike serve-well prototype |
| Dual-role UX patched late | `any(isLeader)` breaks volunteer flows |

**Conclusion:** Invert build order — **serve-well UI skeleton first**, wire API second. Do **not** continue #148 cutover.

---

## Decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| RST-01 | **Freeze** `frontend-migration-web-next` cutover (#148) | Avoid shipping visual layer owner rejects |
| RST-02 | New frontend target = **serve-well + API** | Matches validated prototype |
| RST-03 | **Salvage** data layer from `web-next` / `web` (apiClient, auth, org, queries, i18n, tests of behavior) | Months of domain wiring preserved |
| RST-04 | **Discard** `web-next` visual shell, routes layout, `__preview__`, HOPE→Onda cherry-picked theme | Source of dissatisfaction |
| RST-05 | Visual authority = `design-reference/serve-well/` | Not “inspired by” — copy structure, adapt wiring |
| RST-06 | Monorepo stack = **Vite SPA + TanStack Router + pnpm** | Not TanStack Start / Lovable config / Bun |
| RST-07 | Working context (**ministério · chapéu**) in **Foundation** shell | See [working-context-picker](../working-context-picker/) — not a later patch |
| RST-08 | Reject Lovable **demo role dropdown** | Use Church/Campus + working context + grants |
| RST-09 | `apps/web` remains **production** until single cutover of new package | No multi-month dual deploy of three apps |
| RST-10 | Admin / System Admin: **functional port** with inherited Onda tokens | Same as MIG-ADMIN-01 — no bespoke redesign v1 |
| RST-11 | At cutover, **delete** `apps/web` and `apps/web-next` from monorepo | Avoid three frontend packages permanently; git history preserves old code |

---

## Information architecture lock

**Decision RST-IA-01 (visual-first):** Volunteer + Leader screens follow **serve-well screen composition** (combined dashboard patterns, nav labels from prototype). Production URLs may differ from Lovable paths during build; **cutover** may add redirects from legacy `apps/web` URLs.

| serve-well (reference) | Suggested prod route (v1) | Notes |
|------------------------|---------------------------|-------|
| `/` volunteer dashboard | `/dashboard` | Greeting + summary + time-away section |
| `/assignments` | `/scheduling` (volunteer branch) | 2-col assignment cards |
| `/time-away` | `/time-away` | Unchanged |
| `/` leader dashboard / `/roster` | `/scheduling` (leader branch) | Ministry hero + roster by event |
| `/events` | `/scheduling/events/*` | Existing API routes preserved |

**Do not** rebuild volunteer home and assignments on one URL unless product explicitly reverses RST-IA-01 later.

---

## What happens to existing specs

| Spec | Status |
|------|--------|
| `frontend-migration-web-next` | **Frozen** — TLC folder archived after cutover; **`apps/web-next` package deleted** |
| `ui-refresh-onda-brand` | **Still valid** — tokens/typography |
| `working-context-picker` | **Merged** into this feature Foundation |
| `design-reference/serve-well` | **Authority** for Execute |

---

## Out of scope (v1 restart)

- Backend API / Prisma changes
- TanStack Start / SSR (unless separate ADR later)
- Accept/Decline assignments, event venue, global search (unchanged deferrals)
- Church Admin / System Admin visual redesign
- Deleting `apps/web-next` **before** `web-onda` reaches route parity (keep package for salvage until T17)
