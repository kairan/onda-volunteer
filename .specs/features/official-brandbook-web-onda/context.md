# Official BrandBook → web-onda — Context

**Gathered:** 2026-07-16  
**Spec:** `.specs/features/official-brandbook-web-onda/spec.md`  
**Status:** Approved for Tasks (Specify confirmed 2026-07-16)

---

## Feature Boundary

Align `apps/web-onda` with the official **Igreja Onda Brandbook 2027** (in-repo: `apps/web-onda/src/assets/brand/` — see [`docs/runbooks/brand-assets.md`](../../../docs/runbooks/brand-assets.md)) using a **Balanced** visual pass — tokens, official **Logo 1** PNG wordmark, restrained grafismos/gradients/glass — **before** Phase 5 cutover (#175). Does not redesign Volunteer/Leader IA or add new product flows.

---

## Implementation Decisions

### Scope depth

- **Fuller pass**, lane **Balanced**: official palette + `#eeeee7` page background; Logo 1 in shell; soft gradient on auth; grafismo on empty-state heroes + subtle sidebar watermark; glass only where frosted chrome already exists (e.g. sticky top bar) — not on data cards/tables.

### Wordmark

- Always **`igreja onda`** (Portuguese BrandBook primary), including en UI chrome.
- **Ship PNG Logo 1** (digital variant) — black + white assets from `1. LOGO/IGREJA ONDA/`.
- SVG export deferred (`.ai` has no extractable PDF/SVG vectors without Illustrator).

### Page background

- Move default page background from provisional `#FAFAFA` to official **`#eeeee7`**.

### Typography / SF Pro

- **Option A:** Space Grotesk for all product UI including captions/footnotes/meta.
- SF Pro Display remains **print/marketing only** — do not self-host or `@font-face` Apple SF files in the app (license forbids web embedding).
- Right Grotesk remains display/hero only, always uppercase per BrandBook.

### Timing

- Complete **before** [#175](https://github.com/kairan/onda-volunteer/issues/175) cutover so production never ships provisional palette + typed “Onda” wordmark as the cutover baseline.

### Agent's Discretion

- Exact CSS mapping of secondary palette hex → muted/border/sidebar-accent tokens (must stay WCAG AA).
- Which grafismo file (filled vs line) for sidebar watermark vs empty states.
- Gradient stop values for auth (from BrandBook blue scale).
- Whether dark-mode `:root.dark` is lightly retuned or left visually secondary for this slice.

### Declined / Undiscussed Gray Areas → Assumptions

| Topic | Assumption | Rationale |
|-------|------------|-----------|
| System Admin / Church Admin layouts | Tokens inherit; no layout redesign | Same deferral pattern as ADR 0006 / prior refresh |
| Marketing landing `/` | Out of scope | Not product shell; BrandBook print pieces separate |
| Auto-trace PNG → SVG | Not allowed | BrandBook forbids recreating wordmark |
| Instagram / submarca assets | Out of scope | Empty submarcas; IG templates not app chrome |
| Locale-switched wordmarks (`onda church` / `iglesia onda`) | Not in v1 | User locked `igreja onda` only |

---

## Specific References

- Brand assets (canonical): `apps/web-onda/src/assets/brand/` + [`docs/runbooks/brand-assets.md`](../../../docs/runbooks/brand-assets.md). Optional local marketing kit may exist outside the repo for humans; agents/CI use in-repo files only.
- Supersedes provisional hex in ADR 0006 (`#2034D6`, `#FAFAFA`) and typed shell “Onda” text.
- Target package: `apps/web-onda` only (not re-skinning `apps/web` / `apps/web-next` before delete at cutover).

---

## Deferred Ideas

- Official SVG wordmark swap when Marketing exports from Illustrator.
- Locale-specific wordmarks (EN/ES).
- Full BrandBook glassmorphism / gradient density across dense roster UIs.
- Onda Store–style grafismo-as-hero treatments.
