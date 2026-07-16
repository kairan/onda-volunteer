# ADR 0006: Onda brand visual system

**Status:** Accepted (amended 2026-07-16 — official Brandbook 2027)  
**Date:** 2026-06-20  
**Amended:** 2026-07-16 — [#180](https://github.com/kairan/onda-volunteer/issues/180) / [`.specs/features/official-brandbook-web-onda/`](../../.specs/features/official-brandbook-web-onda/)  
**Supersedes:** ADR 0003 (HOPE design system) — visual direction only; ADR 0002 archived  
**Preserves:** ADR 0001 shell structure, i18n, accessibility, scheduling UI posture  
**Frontend package:** ADR [0007](./0007-frontend-serve-well-plus-api.md) (`apps/web-onda`, serve-well + API)

**Feature specs:** [`.specs/features/official-brandbook-web-onda/spec.md`](../../.specs/features/official-brandbook-web-onda/spec.md) (current) · [`.specs/features/ui-refresh-onda-brand/spec.md`](../../.specs/features/ui-refresh-onda-brand/spec.md) (provisional source, superseded for tokens/logo)

## Context

HOPE (ADR 0003) replaced the Lamborghini layer with a brutalist newspaper aesthetic tuned for a single church brand. The product is moving toward **multi-church SaaS**; stakeholders approved a **provisional Igreja Onda** identity (brand guide palette + Space Grotesk) and validated Volunteer / Leader UX in a [Lovable prototype](https://serve-well.lovable.app/).

Church Admin and System Admin layout redesign are **explicitly deferred**; this ADR covers tokens and Volunteer / Leader surfaces only.

## Decision

### Visual identity

- **UI font:** Space Grotesk (navigation, body, labels, forms, tables, buttons) — sentence case.
- **Display font:** Right Grotesk Compact Black or Right Grotesk Thing Dark — hero/empty states only (1–2 per screen max).
- **Do not** use Inter as primary UI font or generic SaaS indigo (`#6366F1`) for this refresh.

### Color (provisional brand guide — **superseded 2026-07-16**)

> **Historical only.** The 2026-06 provisional palette (`#2034D6`, `#FAFAFA`, etc.) is **not** current product truth. See **Amended 2026-07-16** below for official Brandbook 2027 values shipped in `apps/web-onda`.

| Role | Hex (provisional — do not use) |
|------|--------------------------------|
| Primary actions / links / focus | ~~`#2034D6`~~ |
| Primary hover | ~~`#151BB6`~~ |
| Primary text | ~~`#181A43`~~ |
| Page background (default) | ~~`#FAFAFA`~~ warm white; ~~`#E4F1FA`~~ nav tint |
| Card surface | `#FFFFFF` |
| Borders | `#A1C1DB` / `#8FB5D7` |
| Muted text | `#334B6E` / `#416B92` |
| Success / confirmed | `#7DBB8F` |
| Info accent | `#5A92BC` |

### Components

- **Border radius:** 6–8px on cards and controls (end HOPE zero-radius rule).
- **Borders:** 1px blue-gray, not 2–3px pure black.
- **Shadows:** subtle `0 1px 3px rgba(17, 22, 94, 0.08)` — no hard offset stamp shadows.
- **Primary button:** filled brand primary, white label (provisional used `#2034D6` — superseded).
- **Active nav:** primary left rail or muted-panel tint (provisional used `#E4F1FA`).

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
- ~~When the official BrandBook publishes, amend this ADR with final hex/type assets.~~ **Done** — see Amended 2026-07-16.

---

## Amended 2026-07-16 — Official Brandbook 2027 (`apps/web-onda`)

**Authority:** Igreja Onda Brandbook 2027 (Marketing kit). **Normative hex** below; `apps/web-onda/src/styles/globals.css` stores oklch equivalents locked by `theme.contract.test.ts`.

### Color (official — current)

| Role | Hex | CSS variable(s) |
|------|-----|-----------------|
| Page background | `#eeeee7` | `--background` |
| Primary text / deep | `#181e5f` | `--foreground`, `--card-foreground` |
| Primary action | `#2537de` | `--primary`, `--ring`, `--sidebar-primary`, `--brand` |
| Primary hover | `#1f2bc8` | `--primary-hover` |
| Primary on primary | `#ffffff` | `--primary-foreground` |
| Card / sidebar surface | `#ffffff` | `--card`, `--sidebar` |
| Border / input | `#9cc7e4` | `--border`, `--input`, `--sidebar-border` |
| Muted panel / nav tint | `#e5f4fe` | `--muted`, `--sidebar-accent`, `--accent` |
| Muted text | `#365683` | `--muted-foreground` |
| Success (BrandBook) | `#79caab` | `--chart-4` / success semantic |
| Destructive | warm red oklch (unchanged semantics) | `--destructive` |

**Dark mode (`.dark`):** Primary/ring use BrandBook blue family (e.g. `#537ae5` oklch); backgrounds stay deep navy (`#181e5f` family). Retune only for AA — no separate Brandbook dark system.

### Typography (official — current)

| Role | Font | Rule |
|------|------|------|
| UI (nav, body, forms, tables, buttons, captions) | **Space Grotesk** | Sentence case |
| Display / hero (≤2 per screen) | **Right Grotesk** (Compact Black / Thing Dark) | **Uppercase** only |
| SF Pro Display | **Print / marketing only** | **Do not** `@font-face`, self-host, or ship Apple SF binaries in `apps/web-onda` (license forbids web embedding) |

### Logo 1 wordmark (official — current)

- Shell brand mark = **Logo 1 PNG** for locale **`igreja onda`** — not typed Space Grotesk “Onda”.
- Assets: `apps/web-onda/src/assets/brand/logo-igreja-onda-preto.png` (light surfaces) and `logo-igreja-onda-branco.png` (dark/primary tiles). See [`docs/runbooks/brand-assets.md`](../runbooks/brand-assets.md).
- **Church name** remains tenant context beside/under the mark (ADR 0001).
- On image load failure: accessible text fallback **`igreja onda`** (not “Onda”).
- Do not trace, redraw, or approximate the wordmark in CSS type.

### Balanced flourishes (official — current)

| Surface | Treatment |
|---------|-----------|
| Auth / signed-out entry | Soft BrandBook gradient (`auth-brand-gradient`: `#181e5f` → `#2537de` → `#eeeee7`); Logo 1; form card stays solid (no glass) |
| Major empty states | `grafismo-ondas-filled.png` — decorative, `aria-hidden`; does not replace wordmark |
| Sidebar (expanded) | Optional low-opacity `grafismo-ondas-line.png` watermark behind nav; must not harm AA |
| Sticky header | Frosted blur on existing chrome only |
| Cards / roster / tables | **No** glassmorphism fills |
| Print | Decorative gradients/watermarks may hide (`@media print`) |

Grafismo assets live under `apps/web-onda/src/assets/brand/`; components: `IgrejaOndaWordmark`, `BrandGrafismo`.

### Unchanged from original ADR 0006

- Border radius 6–8px; subtle card shadow; 1px blue-gray borders
- Volunteer / Leader UX patterns; Church Admin / System Admin layout redesign still deferred (tokens + mark only)
- WCAG 2.2 AA; pessimistic scheduling mutations; i18n posture

**Unblocks:** [#175](https://github.com/kairan/onda-volunteer/issues/175) cutover — official brand must be on `main` (or included on cutover branch) before T17.

## References

- Official Brandbook Execute: [`.specs/features/official-brandbook-web-onda/design.md`](../../.specs/features/official-brandbook-web-onda/design.md)
- Provisional design (historical): [`.specs/features/ui-refresh-onda-brand/design.md`](../../.specs/features/ui-refresh-onda-brand/design.md)
- Brand assets runbook: [`docs/runbooks/brand-assets.md`](../runbooks/brand-assets.md)
- Prototype index: [`design-reference/serve-well/README.md`](../../design-reference/serve-well/README.md)
- Frontend restart: [ADR 0007](./0007-frontend-serve-well-plus-api.md)
- ADR index: [README.md](./README.md)
