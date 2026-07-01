# ADR 0001: App shell, i18n, and scheduling UX baseline

## Status

**Accepted** — **structural** decisions only (shell, i18n, accessibility, scheduling interaction patterns).

| Topic | Authority |
|-------|-----------|
| Visual tokens, typography, components | [ADR 0006](./0006-onda-brand-visual-system.md) + [`design-reference/serve-well/`](../../design-reference/serve-well/) |
| Frontend package strategy | [ADR 0007](./0007-frontend-serve-well-plus-api.md) |
| System operator role | [ADR 0005](./0005-system-admin-operator-role.md) |
| Event detail URL | [ADR 0004](./0004-retire-legacy-event-detail-route.md) |
| Historical visual (Lamborghini, HOPE) | [archive/](./archive/) — ADR 0002, 0003 |

## Context

Multi-**Church** volunteer scheduling needs a stable **shell**, **i18n**, and **accessibility** baseline that is expensive to reverse. Visual direction has changed since this ADR was written; do **not** implement monochrome / HOPE tokens from older sections — use ADR 0006 and the serve-well reference instead.

## Decision

### Brand and domain separation

- **Product brand** in global chrome is fixed (**Onda**), distinct from any **Church** in **Organization**; active **Church** and **Campus** names appear in context controls (`CONTEXT.md`).
- **Responsive wordmark:** compact lockup when horizontal space is tight; full lockup when space allows, without crowding context switchers.

### Layout and density

- **Light-first** signed-in UI; **CSS variables** for theming; **no** dark-mode toggle until a future milestone.
- **Operational balanced** density: usable tables and forms for scheduling-heavy work.
- **Content width:** about **1280px** max for main column on wide screens; wide tables scroll inside their region.

### Semantic colors (scheduling)

These apply across visual eras — exact hex values live in ADR 0006 tokens:

- **Destructive / error:** warm red-orange family; WCAG 2.2 AA on surfaces.
- **Focus-visible:** blue family for rings/outlines only (Onda primary `#2034D6` in current brand).
- **Success / warning:** restrained green / amber where scheduling semantics require them.

### Motion and empty states

- **Motion:** minimal functional transitions; honor **`prefers-reduced-motion`**.
- **Overlays:** `Dialog` / `Sheet` / `Popover` enter/exit **150–200ms**; instant or ≤50ms opacity-only when reduced motion.
- **Empty states:** type + thin Lucide icon (no raster placeholders unless brand allows later).

### Loading, forms, and validation

- **Loading:** skeleton placeholders for initial page/table loads; thin spinner for inline refresh.
- **Validation:** field-first inline errors; top summary when **≥ 4** field errors or a global server error is present.

### Tooling

- **Tailwind CSS** + **shadcn/ui** (New York preset).
- **Icons:** Lucide, consistent sizing.
- **Component strategy:** token-first primitives; curated variants for high-traffic components.

### Shell, navigation, and routing

- **Desktop:** persistent **left sidebar** (~**260px** expanded).
- **Mobile:** **sticky top bar** + **sheet/drawer** nav (`SidebarTrigger`).
- **Skip link** to `#main` as first focusable element.
- **Church switcher:** prominent dropdown; **Campus** secondary selector when multiple campuses exist (not a combined ambiguous list).
- **Working context (2026-07+):** when a user holds multiple ministry grants, shell exposes **“Atuar como”** — `{{ministry}} · Líder` / `{{ministry}} · Voluntário` (see ADR 0007, [working-context-picker spec](../../.specs/features/working-context-picker/)).
- **Timezone cue** near Church/Campus context (short label + IANA in tooltip).
- **Account actions:** sidebar footer (desktop); top bar account entry (mobile).
- **Signed-in landing:** **Dashboard** at **`/dashboard`**.
- **Availability nav label:** **Time away** (domain term: **Unavailability**).

### Feedback and quality

- **Hybrid feedback:** success → short toasts; warnings/errors → inline near workflow.
- **Toast anchor:** bottom-right; at most **two** non-critical toasts visible.
- **WCAG 2.2 Level AA** for text, controls, focus, semantic states.
- **Route errors:** inside shell when possible (retry panel); full-screen only for bootstrap failures.

### Scheduling UI posture (v1)

- **Pessimistic mutations** by default for Events, Assignments, Unavailability — await server confirmation; no optimistic roster states.
- **Destructive confirms:** explicit consequence copy; specific verb labels (not vague OK/Continue).

### Internationalization

- **`react-i18next`**; locales **`pt-BR`** (default) and **`en`**.
- **Namespaces:** route-shaped + `common` + `shell`.
- **`Intl`** for human-readable numbers/times; persisted scheduling instants remain **UTC**.
- **Fallback:** `pt-BR` → `en`.
- **Language switcher** on account/footer surfaces.

### Engineering notes

- User-visible strings via i18n keys — no ad-hoc bilingual literals in components.
- External links: `target="_blank"` + `rel="noopener noreferrer"`.

## Alternatives considered

- **Toast-only or inline-only feedback:** rejected — hybrid model.
- **English-default locale:** rejected — Brazil-first default with English supported.

## Consequences

- New frontend work must **not** reintroduce HOPE or Lamborghini patterns (see archived ADRs).
- Visual implementation details belong in ADR 0006 and serve-well — not duplicated here.
- When Identity stores locale preferences or Church-level locale defaults ship, amend this ADR or add a focused i18n ADR.

## References

- Domain language: [`CONTEXT.md`](../../CONTEXT.md)
- Visual: [ADR 0006](./0006-onda-brand-visual-system.md)
- Frontend restart: [ADR 0007](./0007-frontend-serve-well-plus-api.md)
