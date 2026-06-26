# PRD: HOPE design system migration

> **Historical — superseded for visual direction.** Current brand authority: ADR [0006](../adr/0006-onda-brand-visual-system.md) and the web-next migration ([#143](https://github.com/kairan/onda-volunteer/issues/143)–[#148](https://github.com/kairan/onda-volunteer/issues/148)). Retained for ADR 0002→0003 chain and #49 automated gate history.

## Problem Statement

The web client currently implements a dark-field, Lamborghini-inspired visual identity (ADR 0002): black background, gold accent (#FFC000), Archivo Narrow display font, hairline white-alpha borders, and no elevation feedback. This direction diverges from the visual language used across other Onda Dura church projects and creates a cinematic, luxury-exclusive feel that does not match the service-oriented, accessibility-first needs of a **Volunteer** scheduling product. Dense **Scheduling** tables, **Unavailability** forms, and **Ministry** rosters need high-contrast black-on-white readability for extended sessions, not white-on-black cinema.

## Solution

Replace the Lamborghini brand layer with the HOPE design system — a sharp, flat, brutalist-inspired visual identity already used in other Onda Dura projects. The migration inverts the color posture to light-first (gray #e8e8e8 page background, white card surfaces, black text and borders), swaps the accent to brighter yellow (#FFD93D), replaces Archivo Narrow with Montserrat for display typography, introduces heavy 2–3px solid black borders as structural elements, and adds hard offset box-shadows (no blur) as the signature hover/interaction pattern. Zero border-radius is preserved. All shell structure decisions from ADR 0001 (sidebar navigation, i18n, a11y, scheduling UI posture) remain in force — only the visual direction changes.

## User Stories

1. As a **Volunteer**, I want the app to feel visually consistent with other Onda Dura church tools I already use, so that the experience feels familiar and trustworthy from day one.
2. As a **Volunteer**, I want black text on light backgrounds for scheduling tables and forms, so that I can scan dense rosters comfortably during long planning sessions.
3. As a **Volunteer**, I want interactive elements (buttons, cards) to give clear tactile feedback when I hover or tap, so that I know what is clickable without guessing.
4. As a **Volunteer**, I want a bold, newspaper-like grid layout with visible structural borders, so that data-heavy pages feel organized rather than floating in whitespace.
5. As a **Volunteer**, I want headings in a heavy geometric font (Montserrat) with uppercase treatment, so that section hierarchy is immediately visible and the app feels confident.
6. As a **Volunteer** on mobile, I want the same brutalist visual identity scaled down with appropriate touch targets, so that the experience is consistent across devices.
7. As a **Leader**, I want the sidebar navigation restyled with the HOPE visual language (light background, heavy borders, yellow accent on active states), so that chrome navigation is readable alongside dense content.
8. As a **Leader**, I want the **Church**/**Campus** context controls to remain prominent and functional in the restyled sidebar, so that switching context is never buried under visual redesign.
9. As an **Admin**, I want destructive actions to still use the warm red-orange semantic color (unchanged), so that dangerous operations remain visually distinct even after the palette shift.
10. As a **Volunteer**, I want the product brand displayed as a square-bordered box with "ON/DA" text in the HOPE stamp style, so that the brand feels intentional and aligned with the design system.
11. As a **Volunteer**, I want the dashboard hero section to use the HOPE pattern (black badge, yellow-highlighted heading, stats bar with cell borders), so that the landing page matches the new identity.
12. As a **Volunteer**, I want focus rings and keyboard navigation to remain WCAG 2.2 AA compliant after the visual migration, so that accessibility is not regressed.
13. As a **Volunteer**, I want loading skeletons to use the HOPE shimmer pattern (light gray gradient on white surfaces), so that loading states match the new light-field aesthetic.
14. As a **Volunteer**, I want cards to lift slightly with a hard offset shadow on hover, so that the brutalist interaction pattern is consistent across all card types.
15. As a **Volunteer**, I want buttons with 2px solid black borders and the HOPE hover pattern (translateY + offset shadow), so that every interactive control follows the same tactile language.

## Implementation Decisions

### Module 1 — Design Tokens (`globals.css` + `tokens.ts`)

The token layer is the deepest module: a single `:root` change propagates through every component consuming CSS variables. The migration inverts the color field:

- `--background` shifts from `0 0% 0%` (black) to approximately `0 0% 91%` (#e8e8e8 gray)
- `--foreground` shifts from white to black
- `--surface` shifts from `0 0% 13%` (#212121) to `0 0% 100%` (white)
- `--brand` and `--primary` shift from `45 100% 50%` (#FFC000) to `51 100% 62%` (#FFD93D)
- `--border` shifts from white-alpha-16% to `0 0% 0%` (solid black)
- New tokens added: `--border-weight: 2px`, `--shadow-offset-sm: 4px 4px 0`, `--shadow-offset-md: 6px 6px 0`, transition tokens matching HOPE spec
- `--ring` (focus blue), `--destructive` (warm red-orange) remain unchanged (ADR 0001)
- `--radius` remains `0px` (shared between both systems)

### Module 2 — Font Stack

- Remove `@fontsource/archivo-narrow` package dependency
- Add `@fontsource/montserrat` with weights 400, 700, 800
- Update `--font-display` from `'Archivo Narrow'` to `'Montserrat'`
- `--font-sans` (Inter) unchanged
- Update `globals.css` imports accordingly

### Module 3 — Button Primitive

- Add `border-2 border-black` to base class
- Default variant becomes ink-on-white: `bg-black text-white`, hover shifts to accent
- Accent variant: `bg-[#FFD93D] text-black`, hover inverts
- Outline variant: transparent with `border-2 border-black`
- All interactive variants get HOPE hover: `hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]`
- Destructive variant retains semantic red-orange with matching offset shadow

### Module 4 — Card Primitive

- Base: `border-2 border-black bg-white` on `#e8e8e8` page background
- Hover: `hover:-translate-y-[3px] hover:shadow-[6px_6px_0_#000]`
- Optional left-edge yellow accent via `:before` pseudo-element on hover
- `CardTitle` switches from `font-display` referencing Archivo Narrow to Montserrat (automatic via token change)

### Module 5 — Shell Restyle

- Sidebar: `bg-white` (or `bg-surface`), `border-r-2 border-black` (heavy right border)
- `ShellBrand`: square box with `border-[2.5px] border-black`, split text "ON/DA", compact variant for mobile
- Nav links: Inter normal-case (per ADR 0001 nav label policy), active indicator changes from gold underline to `border-bottom: 2.5px solid #FFD93D`
- Mobile header: `border-b-2 border-black`, sticky, white background
- Footer: retains existing structure, restyled with HOPE borders and muted text
- All existing shell behavior (Church/Campus selectors, timezone cue, skip link, i18n, scrim overlays) preserved without functional changes

### Module 6 — Dashboard Restyle

- Hero: `bg-[#e8e8e8] border-b-2 border-black`, badge with `bg-black text-[#FFD93D]`, heading with inline yellow highlight `bg-[#FFD93D]`
- Stats bar: `border-t-2 border-black`, cells separated by `border-r-2 border-black`, stat values in Montserrat weight 900 at ~2.2rem
- Placeholder pages restyle follows naturally from token changes (they use semantic classes)

### Module 7 — Theme Contract Tests

- Update `theme.contract.test.ts` to lock new HOPE HSL values for `--primary`, `--brand`, `--background`, `--border`
- Add assertions for new tokens (`--border-weight`, shadow offset tokens)
- Update `button.behavior.test.tsx` to assert border-2 and new variant classes
- Add `card.behavior.test.ts` asserting border-2, hover shadow classes
- Add shell visual assertions (sidebar border weight, brand box structure)
- Add dashboard structure assertions (hero layout, stats grid, HOPE patterns)

### Module 8 — Documentation Cleanup

- ADR 0003 created (records the decision and trade-offs)
- ADR 0002 marked as superseded by ADR 0003
- `DESIGN.md` (Lamborghini analysis) archived or removed
- `DESIGN_SYSTEM.md` (HOPE spec) remains as the authoritative visual reference

### Architectural note

The migration is intentionally token-first. Because the existing codebase already consumes CSS variables through Tailwind's `@theme` bridge, changing the `:root` values in `globals.css` propagates light-field colors to every component using semantic classes (`bg-background`, `text-foreground`, `border-border`, `bg-surface`, `bg-primary`, etc.) without touching each file. Component-level changes (border weight, shadows, hover patterns) are additive on top of the token inversion.

## Testing Decisions

Good tests for this migration assert **external behavior and visual contracts**, not implementation details. They verify that the design tokens encode the correct values, that components expose the correct CSS classes for their variants, and that the shell structure renders the expected landmarks — without asserting specific Tailwind utility orderings or internal DOM nesting.

Prior art: `theme.contract.test.ts` (reads `globals.css` from disk and asserts regex patterns against locked HSL values) and `button.behavior.test.tsx` (renders the Button component and asserts class membership per variant).

### Modules with tests

1. **Design Tokens** — contract test asserting all HOPE values are locked in `:root` (background, foreground, surface, brand, primary, border, new tokens). Follows existing `theme.contract.test.ts` pattern.

2. **Button** — behavior test asserting border-2, hover classes, and variant class membership for default/accent/outline/ghost/destructive. Follows existing `button.behavior.test.tsx` pattern.

3. **Card** — behavior test asserting border-2, surface background, hover shadow classes. New file following the same pattern.

4. **Shell** — behavior test asserting sidebar renders with heavy border class, brand box renders with expected structure, nav links render with expected active indicator. Extends existing `AppShell.behavior.test.tsx`.

5. **Dashboard** — behavior test asserting hero section structure (badge, highlighted heading, stats grid with border separators). New file following route test patterns.

## Out of Scope

- **Dark mode**: the token architecture supports a future dark theme via CSS variable overrides, but no dark mode toggle or `:root.dark` block is shipped in this migration.
- **Category colors**: the HOPE spec defines category-specific colors (food, health, housing, etc.) that belong to a different domain. These are not adopted.
- **Header-only navigation**: the HOPE spec describes a sticky header with inline nav links. The sidebar navigation model from ADR 0001 is preserved and restyled instead.
- **Logo/brand assets**: the "ON/DA" box wordmark is implemented in code (CSS + text). No raster logo, SVG icon set, or favicon redesign is included.
- **Public pages / landing page**: this migration covers the signed-in product shell and its components. Public-facing pages are out of scope.
- **Component additions beyond Button and Card**: the HOPE spec describes search bars, filter chips, language switcher styling, urgent banners, detail pages, and empty states. These are future work as those features are built — this migration establishes the token foundation and restyled existing primitives only.
- **Print stylesheet redesign**: the existing minimal print hygiene (hide chrome, black on white) is preserved as-is.

## Further Notes

- The `DESIGN_SYSTEM.md` at the repo root is the authoritative HOPE visual reference. Implementation should cross-reference it for component-level details (hover patterns, grid layouts, responsive breakpoints) not fully enumerated in this PRD.
- The HOPE system was sourced from another Onda Dura church project. Future alignment between projects should be coordinated so the design system evolves consistently.
- ADR 0001 structural decisions (sidebar width, overlay motion budget, toast density, form validation layout, scheduling mutation model, a11y gates) are explicitly NOT touched by this migration and remain normative.
