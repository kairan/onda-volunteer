# ADR 0006: Onda brand visual system (provisional)

**Status:** Accepted  
**Date:** 2026-06-20  
**Supersedes:** ADR 0003 (HOPE design system) — visual direction only; ADR 0002 archived  
**Preserves:** ADR 0001 shell structure, i18n, accessibility, scheduling UI posture  
**Frontend package:** ADR [0007](./0007-frontend-serve-well-plus-api.md) (`apps/web-onda`, serve-well + API)

**Feature spec:** [`.specs/features/ui-refresh-onda-brand/spec.md`](../../.specs/features/ui-refresh-onda-brand/spec.md)

## Context

HOPE (ADR 0003) replaced the Lamborghini layer with a brutalist newspaper aesthetic tuned for a single church brand. The product is moving toward **multi-church SaaS**; stakeholders approved a **provisional Igreja Onda** identity (brand guide palette + Space Grotesk) and validated Volunteer / Leader UX in a [Lovable prototype](https://serve-well.lovable.app/).

Church Admin and System Admin layout redesign are **explicitly deferred**; this ADR covers tokens and Volunteer / Leader surfaces only.

## Decision

### Visual identity

- **UI font:** Space Grotesk (navigation, body, labels, forms, tables, buttons) — sentence case.
- **Display font:** Right Grotesk Compact Black or Right Grotesk Thing Dark — hero/empty states only (1–2 per screen max).
- **Do not** use Inter as primary UI font or generic SaaS indigo (`#6366F1`) for this refresh.

### Color (provisional brand guide)

| Role | Hex |
|------|-----|
| Primary actions / links / focus | `#2034D6` |
| Primary hover | `#151BB6` |
| Primary text | `#181A43` |
| Page background (default) | `#FAFAFA` warm white (locked from Lovable clone, 2026-06-21); `#E4F1FA` for nav tint / muted panels (alt `#FBFBDE` reserved) |
| Card surface | `#FFFFFF` |
| Borders | `#A1C1DB` / `#8FB5D7` |
| Muted text | `#334B6E` / `#416B92` |
| Success / confirmed | `#7DBB8F` |
| Info accent | `#5A92BC` |

### Components

- **Border radius:** 6–8px on cards and controls (end HOPE zero-radius rule).
- **Borders:** 1px blue-gray, not 2–3px pure black.
- **Shadows:** subtle `0 1px 3px rgba(17, 22, 94, 0.08)` — no hard offset stamp shadows.
- **Primary button:** filled `#2034D6`, white label; hover `#151BB6`.
- **Active nav:** `#2034D6` left rail or `#E4F1FA` tint.

### UX patterns adopted from Lovable (in scope)

**Volunteer:** personal greeting, assignment summary, card list, time-away preview on dashboard, sidebar (Dashboard · My Assignments · Time Away).

**Ministry Leader:** ministry hero, weekly summary + open slots, roster grouped by event with fill ratio, unfilled rows + Assign, Release on filled rows, New event / Assign volunteer CTAs.

### Explicitly not adopted (v1)

- Assignment Accept/Decline inbox (no domain/API support)
- Event venue on cards
- Global search
- Demo role switcher (production uses Church/Campus + composed grants)
- Church Admin KPI dashboard / System Admin operator redesign

### Unchanged from ADR 0001

- Responsive hybrid shell (sidebar / mobile drawer)
- `react-i18next`, pt-BR default + en
- WCAG 2.2 AA
- Pessimistic scheduling mutations
- Church + Campus context switchers
- Semantic destructive/focus/warning colors where scheduling semantics require them — tune against new backgrounds

## Consequences

- `DESIGN_SYSTEM.md` must be updated when Execute completes (HOPE sections archived or replaced).
- Theme contract tests must lock new token values.
- Font dependencies shift from `@fontsource/montserrat` toward Space Grotesk (+ Right Grotesk if licensed).
- Agents must not reintroduce HOPE patterns (black 2px borders, offset shadows, all-caps Montserrat) on in-scope routes.
- When the official BrandBook publishes, amend this ADR with final hex/type assets.

## References

- Design: [`.specs/features/ui-refresh-onda-brand/design.md`](../../.specs/features/ui-refresh-onda-brand/design.md)
- Decisions: [`.specs/features/ui-refresh-onda-brand/context.md`](../../.specs/features/ui-refresh-onda-brand/context.md)
- Prototype index: [`design-reference/serve-well/README.md`](../../design-reference/serve-well/README.md)
- Frontend restart: [ADR 0007](./0007-frontend-serve-well-plus-api.md)
- ADR index: [README.md](./README.md)
