# 14 — Web client: feedback, overlays, resilience, UI patterns, print hygiene

**Type:** **HITL** (human accessibility + brand motion review **before merge**)  
**Triage label:** `ready-for-agent` once dependencies for slice **14** are satisfied (**09**, **10**, **11** complete). Use this label for AFK agent pickup even though the slice type is **HITL**.  
**Merge gate:** **HITL** checklist completed and recorded in the tracker (WCAG perception + brand motion).
**Normative refs:** PRD user stories **7–9**, **17–19**, **22–24**, **26**, **29–30**, **32**, **46**, **49**, **33**, **54**, **20–21**, **24–25**; ADR 0001 (toasts, scrims, motion, badges, tables, forms, print, external links, destructive confirms)  
**Parent:** Epic **`done/legacy-08-web-client-design-system-shell-i18n.md`**

## Parent

- Epic: `docs/issues/done/legacy-08-web-client-design-system-shell-i18n.md`
- PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Ship the **feedback and overlay system**: toast host with **bottom-right** anchor and **max-two** non-critical stacking rules with **error** precedence; **route-level** error UI inside the shell with **Retry** vs **fatal root** behavior per ADR; **destructive** **`Dialog`** pattern with **specific verb** labels and **no type-to-confirm** in v1. Apply **overlay motion budget** (**150–200ms**, no overshoot) and **`prefers-reduced-motion`** handling. Provide **reference implementations or documented patterns** for **inline** warnings/errors, **monochrome** table **hover wash** + **selected left rail**, **monochrome badges** with **semantic dot / ~2px left rail**, **skeleton** vs **spinner** loading, **hybrid** form validation (**field-first** + top summary when **≥4** issues or non-field server errors), **disabled** control treatments (**hybrid**: opacity buttons, hairline-muted inputs), **minimal `@media print`** hygiene, and **external** links (**`noopener`/`noreferrer`**, **ExternalLink** affordance). **Success**/**warning** color ramps remain **tunable** per ADR but must land within **restrained green** / **restrained amber** direction when color is used.

## Acceptance criteria

### Automated / AFK-verifiable

- [x] Success/info toasts obey **bottom-right** placement and **stacking** rules; **error** toasts cannot be silently dropped.
- [x] **Route-level** error boundary renders **inside** the shell with **Retry** for recoverable loader failures; **fatal** bootstrap errors use the agreed full-screen path.
- [x] **Destructive** confirmation dialogs follow ADR copy and button-label rules.
- [x] Overlays respect **motion budget** and **`prefers-reduced-motion`** rules.
- [x] **Print** stylesheet hides nonessential chrome and keeps output **black-on-white** readable per ADR **minimal print hygiene**.
- [x] **External** links follow the **new tab + rel + icon** policy.
- [x] Automated tests cover toast orchestration and error-boundary **Retry** behavior at least for one representative route.

### HITL (human) — required before merge

- [x] **WCAG 2.2 AA** spot-check on focus rings, contrast for **semantic** states, toast text, inline errors, and disabled states on real content widths (not only automated contrast on isolated swatches).
- [x] Brand motion review: overlays feel **snappy**, not sluggish or “bouncy”; reduced-motion behavior feels intentional, not broken.
- [x] Visual review: **radical minimal** discipline holds (no accidental gray ramps, no blur shadows, **ink** primary still reads as intentional).

## Blocked by

- **Slice 09 — Design foundation**
- **Slice 11 — Shell routing & landmarks**
- **Slice 10 — i18n controller** (all user-facing strings in this slice must remain i18n-driven where applicable)
