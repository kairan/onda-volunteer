# 09 — Web client: design foundation (Tailwind, shadcn, tokens, fonts, icons)

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/web-client-design-system-shell-i18n.md` (user stories 27–28, 34–39, 47–48, 51–53, 35–38, 52, 37), `docs/adr/0001-visual-system-shell-and-i18n-baseline.md`, `CONTEXT.md`  
**Parent:** Epic **`08-web-client-design-system-shell-i18n.md`** (PRD: web client design system)

## Parent

- Epic: `docs/issues/08-web-client-design-system-shell-i18n.md`
- PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Establish the **web client styling substrate**: Tailwind + **shadcn/ui** (**New York** preset), **CSS-variable-first** theme roles compatible with a future **dark** theme (ship **light** only now), **self-hosted** **Archivo Narrow** and **Inter**, and a **Lucide** facade enforcing **thin** stroke defaults. Encode **ADR 0001** rules: **absolute black/white** brand layer, **black-alpha** hairlines (no decorative gray ramp), **no blurred box-shadow**, **~2px** default radius, **blue** focus-visible anchor (outline-only), **warm red-orange** destructive anchor, **ink** primary buttons on light surfaces. Install only the **foundation + navigation** shadcn batch agreed in the ADR; apply **hybrid** customization starting with **Button** and **Card** (and any primitives those depend on) so downstream slices inherit a coherent baseline.

## Acceptance criteria

- [ ] Dev server and production build succeed with Tailwind + shadcn integrated per current upstream Vite guidance (document any forced fallback).
- [ ] Global theme exposes semantic **CSS variables** consumed by Tailwind/shadcn (light-first; variables exist for later dark mapping without redesigning tokens).
- [ ] **Archivo Narrow** and **Inter** load from **self-hosted** assets (no third-party font CDN for production paths).
- [ ] **Lucide** is only consumed through a project **icon facade** defaulting to **thin** stroke and consistent sizes.
- [ ] **Primary** actions render as **ink** (black fill, white label) on default light surfaces; **destructive** actions use the **warm red-orange** semantic family (not neutralized to black).
- [ ] **Focus-visible** treatment uses the **single blue** chromatic anchor for rings/outlines only (not decorative fills).
- [ ] **No blurred `box-shadow`** on shipped demo surfaces; separation uses borders, scrims, or hairline stacks per ADR.
- [ ] Automated tests or smoke checks exist for the **token contract** and/or critical primitives (e.g. button variants render, CSS variables present) without asserting brittle class-string snapshots.

## Blocked by

None — can start immediately.
