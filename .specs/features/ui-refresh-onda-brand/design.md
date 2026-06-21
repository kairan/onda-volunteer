# Onda brand UI refresh — Design

**Status:** Specify complete — ready for Tasks / Execute  
**Supersedes:** ADR 0003 (HOPE), visual portions of ADR 0001  
**Prototype reference:** `design-reference/serve-well/`, [serve-well.lovable.app](https://serve-well.lovable.app/)

---

## 1. Design intent

Modern minimal **church SaaS**: trustworthy, calm, data-dense friendly. Product chrome stays neutral so **Church** names in context selectors carry tenant identity — not HOPE brutalism, not generic purple startup templates.

**In scope:** Volunteer + Ministry Leader screens + shared church-role shell tokens.  
**Out of scope:** Church Admin and System Admin layout redesign (future phases).

---

## 2. Typography

| Role | Family | Usage | Rules |
|------|--------|-------|-------|
| **UI / body** | **Space Grotesk** | Nav, body, labels, forms, tables, card titles, buttons | Sentence case; weights 400–700 |
| **Display** | **Right Grotesk Compact Black** or **Right Grotesk Thing Dark** | Page hero, dashboard greeting headline, empty-state hero only | Max 1–2 per screen; never tables/forms |
| **Fallback** | Space Grotesk | If Right Grotesk unavailable at Execute time | Document in PR |

**Hierarchy**

1. Display headline (Right Grotesk) — e.g. “Hi Maria 👋”
2. Section title — Space Grotesk 600–700
3. Body — Space Grotesk 400–500
4. Caption / meta — Space Grotesk 400, muted blue-gray token

Load via self-hosted fonts (`@fontsource` or project assets). Remove Montserrat / HOPE display usage.

---

## 3. Color tokens

Extract from provisional Igreja Onda brand guide. This doc is the **design source consumed by [`frontend-migration-web-next`](../frontend-migration-web-next/)** — map these to CSS variables in `apps/web-next/src/styles/*` + `theme/*` (do not execute in-place on `apps/web`).

### Primary blues

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-primary` | `#2034D6` | Primary buttons, links, active nav, focus rings |
| `--brand-primary-hover` | `#151BB6` | Hover / pressed primary |
| `--brand-text` | `#181A43` | Primary text |
| `--brand-heading-deep` | `#11165E` | Deep headings (reserved; operator shell future) |
| `--brand-emphasis` | `#1B2488` | Secondary emphasis, badges |

### Surfaces & chrome

| Token | Hex | Usage |
|-------|-----|-------|
| `--brand-bg-warm` | `#FBFBDE` | Page background option (warm) |
| `--brand-bg-cool` | `#E4F1FA` | Page background option (cool) / active nav tint |
| `--brand-surface` | `#FFFFFF` | Cards, inputs |
| `--brand-surface-subtle` | `#E1F1F6`, `#E8E6D3` | Secondary panels (pick one default + one alt) |
| `--brand-border` | `#A1C1DB` | Card/input borders (1px) |
| `--brand-border-strong` | `#8FB5D7` | Dividers, table rules |
| `--brand-text-muted` | `#334B6E`, `#416B92` | Secondary / meta text |
| `--brand-success` | `#7DBB8F` | Positive / confirmed states |
| `--brand-info` | `#5A92BC`, `#6897B9` | Info accents |

**Default page background:** `#FAFAFA` warm white (locked from local clone `design-reference/serve-well/src/styles.css`, 2026-06-21). Use `#E4F1FA` for active nav tint, muted panels, and confirmed-badge washes — not full-page fill. Alt `#FBFBDE` remains reserved for brand team override only.

### Semantic (preserve ADR 0001)

Keep existing **destructive** (warm red-orange), **focus** (may align focus ring to `#2034D6`), **warning**, **success** scheduling semantics where they differ from brand success green. Tune for WCAG 2.2 AA on white and `#E4F1FA`.

---

## 4. Layout & components

### Shell (church roles — Volunteer & Leader)

Implement using **shadcn `Sidebar` + `SidebarProvider`** — port layout from `design-reference/serve-well/src/components/onda/AppShell.tsx` and `AppSidebar.tsx`.

- **Desktop:** collapsible left sidebar (~260px) + sticky top bar with backdrop blur (ADR 0001 structure).
- **Mobile:** `SidebarTrigger` + sheet/drawer nav (ADR 0001).
- **Logo area:** “Onda” wordmark in Space Grotesk + primary icon tile. **Church** name under logo (tenant), e.g. “Grace Chapel”.
- **Context:** Church + Campus switchers in top bar (replace Lovable role dropdown and search — **out of scope**).
- **Active nav item:** sidebar accent tint (`--sidebar-accent`) or `#E4F1FA` background.

### Cards

Match reference `styles.css` `--shadow-card` and card components:

```css
background: var(--brand-surface);
border: 1px solid var(--brand-border);
border-radius: 8px; /* --radius: 0.5rem in reference */
box-shadow: var(--shadow-card); /* 0 1px 2px rgb(24 26 67 / 0.04), 0 1px 3px rgb(24 26 67 / 0.06) */
```

No HOPE offset shadows, no 2–3px black borders, no zero-radius mandate.

### Buttons

| Variant | Default | Hover |
|---------|---------|-------|
| Primary | `#2034D6` fill, white text | `#151BB6` |
| Outline | transparent, `#2034D6` border | `#E4F1FA` tint |
| Ghost | transparent | subtle `#E1F1F6` |

### Status badges (Volunteer assignments)

| State | Style | Notes |
|-------|-------|-------|
| Confirmed assignment | `#E4F1FA` bg + `#1B2488` text or brand info | All current assignments are confirmed once rostered |
| (Future) Pending response | defer | Not in v1 |

### Tables / roster rows (Leader)

- Event group header: title + date/time + fill ratio badge (`3/5 filled`)
- Row: **Role** label · volunteer initials circle · name · action (Release | Assign)
- Unfilled row: italic “Unfilled” + Assign button (brand primary)
- Row hover: `#E4F1F6` or `#E4F1FA` wash — no stamp translateY

---

## 5. Screen layouts (1440px reference)

### 5.1 Volunteer — Dashboard (`/dashboard`)

```
┌─ Sidebar ─┬─ Top bar: Dashboard · Church/Campus · Account ─────────────┐
│ Onda       │                                                          │
│ [Church]   │  [Display] Hi {name} 👋                                   │
│            │  {n} upcoming assignments                                 │
│ Dashboard* │                                                          │
│ My Assign. │  My upcoming assignments          Next 30 days            │
│ Time Away  │  ┌─────────┐ ┌─────────┐ ┌─────────┐                     │
│            │  │ Event   │ │ Event   │ │ Event   │  (cards → event)    │
│            │  │ Min·Role│ │ ...     │ │         │                     │
│            │  └─────────┘ └─────────┘ └─────────┘                     │
│            │                                                          │
│            │  Time away                    [+ Add period]               │
│            │  · Jul 5–12  Family vacation        [Edit] [Delete]       │
│            │  · (link: View all → /time-away)                          │
└────────────┴──────────────────────────────────────────────────────────┘
```

**My Assignments (`/dashboard` or dedicated route):** full list + filters — same card pattern, can share component with dashboard section.

### 5.2 Ministry Leader — Dashboard (`/dashboard` when leader context)

Leader landing when active ministry is known (ministry switcher or single ministry):

```
┌─ Sidebar ─┬─ Top bar ──────────────────────────────────────────────────┐
│ …          │  [Ministry name] display headline                           │
│ Dashboard* │  {n} events this week · {m} open slots                      │
│ Events     │                          [New event] [Assign volunteer]     │
│ Roster     │  Roster                                                     │
│ Volunteers │  ┌─ Sunday Service ──────────────── 3/5 filled ─────────┐  │
│ Time Away  │  │ Lead Vocalist    [SC] Sarah Chen        [Release]    │  │
│            │  │ Keys             [PP] Priya Patel       [Release]    │  │
│            │  │ Drums            Unfilled               [Assign]     │  │
│            │  └──────────────────────────────────────────────────────┘  │
└────────────┴──────────────────────────────────────────────────────────────┘
```

Wire **New event** → existing private event create flow. **Assign** → event detail roster or inline assign modal (reuse `#115` patterns).

---

## 6. i18n

- Labels in **pt-BR** and **en** under route namespaces (`dashboard`, `scheduling`, `timeAway`, `shell`).
- Examples: “Minhas escalas”, “Períodos indisponíveis”, “Próximos 30 dias”.
- No hardcoded bilingual strings in components.

---

## 7. Accessibility

- WCAG 2.2 AA contrast on `#FFFFFF`, `#FAFAFA`, and `#E4F1FA` accent surfaces.
- Focus visible: `#2034D6` ring (2px offset).
- Touch targets ≥ 44×44px on mobile icon controls (ADR 0001).
- Honor `prefers-reduced-motion` for card hover elevation.

---

## 8. Implementation map

**Reference (read-only):** `design-reference/serve-well/` — see [README](../../../design-reference/serve-well/README.md) for file-level port map.

| UI area | Reference | Production target (`web-next`) |
|---------|-----------|--------------------------------|
| CSS variables / Tailwind theme | `design-reference/serve-well/src/styles.css` | `apps/web-next/src/styles/globals.css`, `theme/tokens.ts` |
| Shell chrome | `…/components/onda/AppShell.tsx`, `AppSidebar.tsx` | `apps/web-next/src/shell/*` |
| Volunteer dashboard | `…/dashboards/VolunteerDashboard.tsx` | `apps/web-next/src/routes/dashboard.tsx` |
| Leader roster landing | `…/dashboards/MinistryLeaderDashboard.tsx` | `apps/web-next/src/routes/scheduling.tsx` |
| shadcn primitives + sidebar | `…/components/ui/*` | `apps/web-next/src/components/ui/*` |
| Theme contract test | — | `apps/web-next/src/theme/theme.contract.test.ts` |
| ADR | — | `docs/adr/0006-onda-brand-visual-system.md` |

Do **not** re-skin `apps/web` in place — migration spec owns Execute.

---

## 9. Verification

- Theme contract test locks primary hex, page bg, border, radius, Space Grotesk stack.
- Vitest behavior tests updated for new labels/roles (no snapshot-only tests).
- Playwright smoke: volunteer dashboard + leader roster assign/release still green.
- Manual: compare side-by-side with `design-reference/serve-well` screenshots at 1440px.
