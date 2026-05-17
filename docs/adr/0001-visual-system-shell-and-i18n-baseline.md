# ADR 0001: Visual system, app shell, and i18n baseline

## Status

Accepted for shell, i18n, accessibility, and structural decisions. Visual-direction details were first superseded by ADR 0002 and are now superseded by ADR 0003 (HOPE design system); use `DESIGN_SYSTEM.md` as the current visual reference.

## Context

`@onda/web` is moving from minimal inline styling to **Tailwind CSS**, **shadcn/ui**, and a deliberate **“Radical Urban Minimalism”** direction for **Onda Dura Church** as the **product brand**, while the domain model remains multi-**Church** volunteer management (see `CONTEXT.md`).

We need a stable baseline that is expensive to reverse later: **design tokens**, **component strategy**, **shell navigation**, **internationalization**, and **accessibility expectations**.

## Decision

### Brand and domain separation

- **Product brand** in global chrome is fixed (**Onda** / **Onda Dura Church**), distinct from any **Church** entity in **Organization**; active **Church** (and **Campus**) names appear in context controls and scoped workflows (`CONTEXT.md`: **Onda**, **Church**, **Campus**).
- **Responsive wordmark:** compact lockup when horizontal space is tight; full lockup when space allows, without crowding the **Church** switcher.

### Color, structure, and density

- **Monochrome brand layer:** **#000000** and **#FFFFFF** drive primary surfaces and typography contrast; **whitespace** is a structural layout element.
- **Practical semantic accents (restricted use):** **destructive/error**, **focus-visible**, **success**, and **warning**—each with a tight ramp, used only for state and accessibility, never as decoration.
- **Neutral dividers and hairlines:** **#000000** at stepped opacities only (no decorative gray ramp).
- **Single semantic focus token** for focus rings/outlines across components; **links** stay **monochrome** (underline/weight/hover) with focus still using the focus token.
- **Semantic palette locking policy (hybrid):** canonize **destructive** and **focus** early; **success** and **warning** remain role-defined first and are tuned during implementation against real components for **WCAG 2.2 AA**.
- **Focus-visible chromatic anchor (locked):** **blue** hue family; used only for `focus-visible` rings/outlines (never as a decorative fill); exact chroma/lightness finalized in tokens against white and near-black control surfaces.
- **Destructive / error chromatic anchor (locked):** **warm red-orange** hue family; used for destructive actions, error text, borders, and icons where semantics require urgency; exact chroma/lightness finalized in tokens for **WCAG 2.2 AA** on `#FFFFFF` and paired surfaces.
- **Success / warning chromatic direction (not hex-locked):** tune during implementation for **WCAG 2.2 AA**—**`success` converges on restrained green**, **`warning` on restrained amber**, both kept visually distinct from **blue** focus and **warm red-orange** destructive.
- **Primary button (locked, light surfaces):** **ink primary**—solid **`#000000`** fill with **`#FFFFFF`** label for the default primary action; secondary/tertiary use outline/text variants; **destructive** actions use the **warm red-orange** semantic path (not neutralized into black).
- **Disabled controls (locked, hybrid):** **opacity-muted** treatment for **buttons** (stable layout, `not-allowed` cursor); **hairline-muted** treatment for **inputs** (use **black-alpha** borders/text steps so fields remain legible in partial forms).
- **Light-first** signed-in UI; implement **CSS variables** so **dark mode** can be added later **without** a token rewrite, but **no** theme toggle until that milestone.
- **Operational balanced** density: generous gutters and rhythm, but tables and forms remain usable for scheduling-heavy work.
- **Content width:** about **1280px** max for the main content column on wide screens; wide tables scroll inside their region when needed.

### Typography, imagery, and motion

> Current visual direction note: display typography details in this section are historical. ADR 0003 replaces Archivo Narrow with Montserrat for the HOPE brand layer.

- **Display:** **Archivo Narrow** (self-hosted), extra-bold caps hierarchy with tight tracking where the brief calls for display treatment.
- **UI/body:** **Inter** (self-hosted), lighter weights for body copy with generous line-height.
- **Imagery:** documentary-style photography in **selective product moments** only; **grayscale default** with **color by exception** when justified.
- **Empty states without assets:** **type + thin Lucide icon only** (no raster placeholders).
- **Motion:** **minimal polish**—short functional transitions only; **no** bouncy springs or large parallax; honor **`prefers-reduced-motion`**.
- **Overlay motion budget (locked):** **`Dialog` / `Sheet` / `Popover`** enter/exit animations target **150–200ms** with non-overshooting easing; when **`prefers-reduced-motion: reduce`**, overlays should open/close **instantly** or use **≤ ~50ms** opacity-only transitions (no spatial travel).

### Data tables and lists

- **Row hover / selection (locked, hybrid):** use a subtle **black-alpha background wash** on hover; use a stronger selected state plus a **`#000000` left rail** (about **2px**) for selection (avoid decorative zebra striping and avoid new hues for selection).

### Display typography policy

> Current visual direction note: ADR 0003 keeps the display-surface scope discipline but swaps the display family to Montserrat.

- **All-caps Archivo Narrow (locked scope):** use extra-bold all-caps with tight tracking for **display surfaces only**—page titles, hero treatments, and major section titles; **primary navigation labels**, **table headers**, and **form labels** use **Inter** with normal casing for **pt-BR** readability and long **Organization** names.

### Loading, forms, and validation

- **Loading UI (locked, hybrid):** monochrome **skeleton** placeholders (**black-alpha**, subtle pulse, layout-stable) for initial **page/table** loads; **thin Lucide spinner** for **inline refresh/revalidate** paths.
- **Form validation layout (locked, hybrid):** **field-first** inline messages for invalid controls; add a **top summary** when error count is **≥ 4** **or** when a **non-field** / global server error must be communicated alongside field cues.

### Shape, icons, and print

- **Default radius:** **2px** (“micro”) for primary chrome (buttons, inputs, cards, dialogs).
- **Icons:** **Lucide** via a project wrapper defaulting to **thin** stroke (**1.5**), consistent sizing.
- **Elevation (locked):** **no blurred `box-shadow`** on any surface, including **`Dialog`**, **`Sheet`**, and **`Popover`**; separate layers using **scrim/backdrop**, spacing, and a crisp **`#000000` / black-alpha** border. If a surface still reads ambiguously flat on **#FFFFFF**, use a **hairline stack** (nested **1px** borders and/or **outline**)—never blur.
- **Overlay scrim (locked default):** modal-style overlays use a **standard scrim** of about **45%** **`#000000`** alpha over the signed-in app; allow **component-level overrides** (lighter drawers vs heavier destructive confirms) while remaining **blur-free**.
- **Status badges (locked):** default chips stay **monochrome** (outline/hairline body); communicate semantic state with a **small marker**—either a **dot** or a **`~2px` left rail** using **restrained green / restrained amber / warm red-orange** only where the status is genuinely semantic (avoid fully filled chromatic pills as the default).
- **Print:** **minimal print hygiene** in v1 (hide nonessential chrome where appropriate, favor readable black on white, suppress decorative imagery by default); **not** full roster pagination yet.

### shadcn and Tailwind

- **Tooling policy:** follow **shadcn’s current recommended** Tailwind + Vite integration **unless** a concrete incompatibility forces a fallback.
- **shadcn style preset:** **New York**.
- **Component strategy (hybrid):** **token-first** customization for primitives; **curated variants** for high-visibility components (for example **Button**, **Card**, **Dialog**, **Badge**, navigation primitives).
- **Initial component batch:** **foundation + navigation** only (avoid pulling large calendar/date complexity prematurely).

### Shell, navigation, and routing

- **Responsive hybrid navigation:** **desktop** persistent **left sidebar**; **mobile** **top bar** + **sheet/drawer** navigation.
- **Desktop sidebar width (locked):** expanded rail targets **~260px** as the default width (tune only if **pt-BR** labels or long **Church** names chronically wrap in usability testing).
- **Sticky shell behavior (locked):** **desktop** sidebar remains fixed; **mobile** top bar is **sticky/pinned** during scroll; do **not** globally mandate sticky in-page **table** headers or section toolbars in v1—add **per-route** only once real roster views justify it.
- **Mobile icon hit targets (locked):** icon-only chrome controls use a **minimum ~44×44 CSS px** hit region with a visually smaller **~36px** icon centered inside (padding expands the target, not stroke weight).
- **Skip link (locked):** the shell includes a **“Skip to main content”** control as the first focusable element, visible on keyboard focus, targeting the primary **`main`** landmark (for example `#main`).
- **Help / support entry (locked):** **desktop** exposes a small **Help** text link in the **sidebar footer**; **mobile** relies on **Help** inside the **account** entry (optionally also include **Help** inside **account** on desktop for consistent muscle memory).
- **Church switcher:** **prominent**, **dropdown** interaction in v1.
- **Context switcher accessibility (locked):** **Church** and **Campus** triggers show the **current selection** visibly, use correct **`aria-expanded`** / menu wiring, and source **accessible names** and control labels from **`shell`** i18n strings (include the current **Church** name where it helps assistive tech).
- **Campus:** when multiple **Campuses** exist, use a **secondary selector** adjacent to the **Church** control (not a combined ambiguous list in v1).
- **Church timezone cue (locked):** show a **concise** default-timezone indicator near **Church** / **Campus** context (short label or common abbreviation); expose the full **IANA** timezone id in a **tooltip** or details popover, not as the only visible string.
- **Account actions:** **split by breakpoint**—**sidebar footer** on desktop; **top bar** account entry on mobile.
- **Primary signed-in landing label:** **Dashboard** at **`/dashboard`**; **`/`** remains intentionally **unchanged** until explicitly replaced (no forced redirect policy yet).
- **Primary nav:** **placeholder destinations**—each top-level item routes to a real path rendering an intentional empty state inside the shell (not fake feature claims).
- **Availability navigation label:** public nav uses **Time away** while precise domain language remains **Unavailability** where needed (`CONTEXT.md`).

### Feedback and quality

- **Hybrid feedback:** **success** uses **short toasts**; **warnings/errors** (especially scheduling validation) use **inline** patterns near the relevant workflow.
- **Toast anchor:** **bottom-right**.
- **Toast stack density (locked):** show **at most two** concurrent non-critical toasts; when a third arrives, **replace the oldest** non-error toast; **error/destructive** toasts may **preempt** success toasts and must not be silently dropped.
- **Accessibility gate:** **WCAG 2.2 Level AA** for text, controls, focus, and semantic states (including toasts and inline errors).
- **Unhandled errors (locked):** default to a **route-level** error boundary rendered **inside the shell** as a **monochrome** panel (type + thin icon + **Retry**) so navigation context remains when possible; reserve **full-screen fatal** treatment only for **root/bootstrap** failures where the router/shell cannot render.

### Scheduling UI posture (v1)

- **Mutation model (locked):** treat **Scheduling**-shaped mutations (**Events**, **Assignments**, **Unavailability** changes) as **pessimistic by default** (await server confirmation) until overlap rules and conflict messaging are proven in real screens; avoid **optimistic** UI that can briefly show illegal roster states. Pair with **success toasts** and authoritative refetch/invalidation after commit.
- **Destructive confirmations (locked):** use **`Dialog`** with explicit consequence copy; the destructive action uses a **specific verb label** (never vague **OK** / **Continue** alone); **no type-to-confirm** in v1 unless a future ADR defines **bulk** destructive flows.

### Internationalization

- **Library:** **`react-i18next`**.
- **Locales:** **`pt-BR`** and **`en`**, with **route-shaped namespaces** per primary surface plus **`common`** and **`shell`**.
- **Localized formatting (locked):** format numbers and calendar times shown to humans with **`Intl`** using the **active UI locale**, while persisted **Events**, **Assignments**, and **Unavailability** remain **UTC** instants in the backend model; when the domain calls for **Church**/**Campus** default timezone framing, present that explicitly alongside localized strings (see `CONTEXT.md` time presentation rules).
- **Default first-use locale:** **`pt-BR`** always for initial UI language (`CONTEXT.md`: **Default UI language**).
- **Missing strings:** fallback chain **`pt-BR` → `en`**.
- **Language switcher:** **yes**, exposed from **account/footer** surfaces (`CONTEXT.md`: **Language switcher**); persistence belongs in client storage until **Identity** can store preferences (implementation detail intentionally not duplicated here).

### Shell data (engineering note)

- **Hybrid integration posture:** static/demo fallbacks are acceptable in v1, but components and copy should be shaped around real domain terms (**Church**, **Campus**, **Ministry**, **Volunteer**, etc.) to reduce throwaway refactors.
- **External links (locked):** off-origin links open a **new browsing context** (`target="_blank"`) with **`rel="noopener noreferrer"`**; inline UI copy uses a consistent **thin `ExternalLink` icon** affordance next to the link text (footer/legal patterns included).
- **Placeholder route copy (locked):** all user-visible strings on **placeholder destinations** are authored as **`react-i18next`** keys under the **route-shaped namespaces**—no ad-hoc bilingual literals embedded in React components.

## Alternatives considered

- **Strict literal monochrome (no semantic hues):** rejected for accessibility and operational clarity on dense scheduling surfaces.
- **Dark-first or system-default theme:** rejected for default signed-in readability and printed-roster adjacency; dark remains a later milestone on the same token architecture.
- **Toast-first or inline-only feedback:** rejected in favor of **hybrid** to balance clean pages with non-dismissable critical workflow errors.
- **Browser-default or English-default locale:** rejected in favor of an explicit **Brazil-first** default while still supporting **English** as a first-class locale.

## Consequences

- Implementers must treat **semantic colors** as **regulated**: introducing new hues for “brand decoration” is out of scope and would violate this baseline.
- **Self-hosted fonts** and **i18n namespaces** add upfront build and maintenance overhead, but reduce runtime surprises and keep translations reviewable per surface.
- **Placeholder destination routes** imply a small routing expansion early; the upside is a realistic shell for stakeholders without pretending unfinished features exist.
- **`/`** staying unchanged temporarily means there will be **two entry aesthetics** until an explicit migration replaces the legacy landing—this is an accepted short-term inconsistency.
- When **Organization** gains **Church**-level locale defaults or **Identity** gains stored language preferences, this ADR should be **superseded or amended**—the current decisions intentionally leave those hooks open.
