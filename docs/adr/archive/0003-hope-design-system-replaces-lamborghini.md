# HOPE design system replaces Lamborghini brand layer

Onda adopts the HOPE design system — a sharp, flat, brutalist-inspired visual identity with a light-first posture — replacing the dark-field Lamborghini-inspired brand layer from ADR 0002. The change is motivated by alignment with the Onda Dura church's existing visual language across projects and by the practical needs of a scheduling-heavy volunteer management product where dense tables, forms, and rosters benefit from high-contrast black-on-white readability over cinematic dark aesthetics.

The HOPE system uses a light gray page background (#e8e8e8), white card surfaces, pure black (#000) for text and heavy 2–3px structural borders, yellow (#FFD93D) as the single accent color, Montserrat for display/heading typography (replacing Archivo Narrow), Inter for body/UI text (unchanged), zero border-radius everywhere (unchanged from ADR 0002), and hard offset box-shadows without blur as the signature hover/interaction pattern. The overall posture is brutalist/newspaper: grid layouts with visible cell borders, uppercase headings with tight tracking, and a stamp-like lift-and-shadow on interactive elements.

## Status

Accepted. Superseded ADR 0002. **Superseded by ADR [0006](../0006-onda-brand-visual-system.md) (Onda brand). Archived 2026-07-01.**

## Considered options

- **Keep Lamborghini dark layer, add HOPE for public pages only.** Rejected because maintaining two complete visual systems doubles token and component complexity for a small team, and the signed-in product is where volunteers spend all their time.
- **Adopt HOPE literally including its category colors and header-only navigation.** Rejected because the category palette (food, health, housing) belongs to a different domain, and the header-only nav pattern from HOPE does not scale for an app with 6+ top-level sections — the existing sidebar model (ADR 0001) is kept and restyled.
- **Blend HOPE accent yellow with Lamborghini gold (#FFC000).** Rejected because #FFC000 was tuned for contrast on black backgrounds and loses clarity on the light gray (#e8e8e8) HOPE field.

## Consequences

- ADR 0001 decisions about shell structure (sidebar, i18n, a11y, scheduling UI posture, loading patterns, form validation) remain in force — only the visual direction from ADR 0001 and ADR 0002 is superseded.
- Semantic colors (destructive warm red-orange, focus blue, success restrained green, warning restrained amber) from ADR 0001 are preserved unchanged — HOPE does not conflict with them.
- The theme contract test must be updated to lock the new HOPE token values (light background, #FFD93D accent, Montserrat display font, 2px border weight).
- Font dependencies shift from `@fontsource/archivo-narrow` to `@fontsource/montserrat`; weight imports expand (400, 700, 800 minimum).
- Every component and shell surface carrying Lamborghini dark-field colors, hairline white-alpha borders, or Archivo Narrow display text must be migrated to the HOPE equivalents.
- `DESIGN.md` (Lamborghini analysis) should be archived or removed; `DESIGN_SYSTEM.md` (HOPE spec) becomes the authoritative visual reference.
