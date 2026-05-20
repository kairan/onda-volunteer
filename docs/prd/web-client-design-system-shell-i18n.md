# PRD: Web client design system, app shell, and i18n (Onda Dura)

> Supersession note: the shell, routing, i18n, accessibility, and product-structure decisions in this PRD remain useful historical context. The visual direction and font choices are superseded by ADR 0003 and `DESIGN_SYSTEM.md`; do not use this PRD as the current visual reference.

## Problem Statement

The web client today is a thin **React (Vite)** demo with ad-hoc styling, no shared design language, and no operational **app shell** for multi-**Church** work. Stakeholders need a **bold, high-contrast, movement-oriented** interface that matches the **Onda Dura Church** product brand while staying faithful to domain language (**Church**, **Campus**, **Ministry**, **Volunteer**, **Scheduling**, **Unavailability**, **Time away** navigation label, and **Onda** as product brand). The experience must default to **Brazilian Portuguese** while supporting **English**, meet **WCAG 2.2 Level AA**, and lay down tokens and components so future scheduling screens do not reinvent visuals or copy patterns.

## Solution

Introduce **Tailwind CSS** and **shadcn/ui** (New York preset, hybrid customization), a **CSS-variable-first** theme compatible with a future **dark mode** toggle (not shipped yet), **self-hosted** **Archivo Narrow** and **Inter**, and **`react-i18next`** with **`pt-BR`** and **`en`**, **`pt-BR` → `en`** fallback for missing keys, **route-shaped namespaces**, and a **language switcher** in account/footer surfaces. Ship a **responsive hybrid shell**: fixed **~260px** desktop sidebar, **sticky** mobile top bar, **sheet** navigation on small viewports, **prominent** **Church** dropdown plus **Campus** secondary selector when needed, **responsive** product wordmark (**Onda** / **Onda Dura Church**), **Dashboard** at **`/dashboard`**, and **placeholder destination** routes with **type + icon only** empty states. Encode visual and interaction rules in **ADR 0001** as the normative baseline.

## User Stories

1. As a **Volunteer**, I want the app to feel coherent and readable in **Portuguese** by default, so that I am not fighting English-first microcopy during everyday use.
2. As a **Volunteer**, I want to switch the UI to **English** from an obvious account/footer control, so that bilingual teams can work comfortably without losing my place in the app.
3. As a **Volunteer**, I want my language choice to persist between visits until **Identity** stores a preference, so that I am not reset to defaults constantly.
4. As a **Volunteer**, I want **focus** states that are easy to see when using the keyboard, so that I can complete forms and navigation safely.
5. As a **Volunteer** using a screen reader, I want a **skip link** to jump to the main content, so that I do not tab through the entire sidebar every time.
6. As a **Volunteer** on a phone, I want the **top bar** and primary actions to respect **44×44** touch targets (with visually smaller icons), so that controls are usable without mis-taps.
7. As a **Volunteer**, I want **links** in body copy to look like text with clear underlines, so that the interface stays monochrome without hiding affordances.
8. As a **Volunteer**, I want **success** actions to confirm with a short **toast** that does not cover critical controls, so that I know the save worked without losing context.
9. As a **Volunteer**, I want **warnings and errors** near the relevant field or table region, so that I can correct problems without hunting for a dismissible banner.
10. As a **Volunteer**, I want **empty** placeholder areas to explain what will live here using calm typography and a thin icon, so that unfinished product areas feel intentional rather than broken.
11. As a **Volunteer**, I want **documentary-style** imagery only where it helps community feel, with **grayscale** as the default treatment, so that the UI stays serious and content-forward.
12. As a **Volunteer**, I want **photos in color** only when it truly helps recognition, so that the monochrome brand discipline is not diluted casually.
13. As a **Leader**, I want to see which **Church** context I am acting in at a glance, so that I do not assign people under the wrong congregation.
14. As a **Leader** stewarding multiple **Churches**, I want a **dropdown** **Church** switcher that is easy to find, so that I can change context quickly between ministries I coordinate.
15. As a **Leader** working across **Campuses**, I want a **second** control for **Campus** when there is more than one, so that timezone and site framing stay explicit without mixing two concerns into one menu.
16. As a **Leader**, I want a concise **timezone cue** next to **Church**/**Campus** context with the full **IANA** id available on demand, so that I trust how **Events** and **Assignments** are framed without raw strings cluttering the chrome.
17. As an **Admin**, I want **destructive** actions to require a clear **dialog** with specific verb labels, so that I do not confirm irreversible work with vague “OK” wording.
18. As an **Admin**, I want **no type-to-confirm** for routine destructive flows in v1, so that common operations stay fast until true bulk-danger flows are defined later.
19. As a **Volunteer**, I want **scheduling-related** saves to reflect **server truth** before the UI celebrates success, so that I never briefly see an illegal roster state during optimistic flicker.
20. As a **Volunteer**, I want **tables** to show hover and selection states using **monochrome** washes and a **left rail** for selection, so that I can scan rosters without rainbow row backgrounds.
21. As a **Volunteer**, I want **badges** for statuses to stay mostly **monochrome** with a small **semantic dot** or **left rail**, so that scanning is fast without chromatic pill soup.
22. As a **Volunteer**, I want **dialogs and sheets** to separate from the page using **backdrop scrims** and borders rather than drop shadows, so that the product matches the radical minimal aesthetic.
23. As a **Volunteer**, I want overlay animations to feel **snappy** and to respect **reduced motion**, so that the UI does not feel gimmicky or nauseating.
24. As a **Volunteer**, I want **skeleton** loading for big page/table loads and a **spinner** for quick refreshes, so that waiting states match the expected duration of the operation.
25. As a **Volunteer**, I want **forms** to show field-level errors first, and a **top summary** only when there are many issues or a global server error, so that simple mistakes stay local while messy failures stay comprehensible.
26. As a **Volunteer**, I want **disabled** buttons to look clearly disabled and **disabled inputs** to remain readable, so that long forms do not look like broken wireframes.
27. As a **Volunteer**, I want **primary** actions to appear as **ink** buttons on light surfaces, so that the default path is visually obvious.
28. As a **Volunteer**, I want **destructive** buttons to use the **warm red-orange** semantic family, so that danger is never confused with neutral chrome.
29. As a **Volunteer**, I want **success** and **warning** accents to converge on **restrained green** and **restrained amber** when color is used, so that meaning stays consistent as features grow.
30. As a **Volunteer**, I want **external** links to open safely in a new tab with a clear icon, so that I understand when I am leaving the app.
31. As a **Volunteer**, I want a **Help** entry in the **sidebar footer** on desktop and inside **account** on mobile, so that support is discoverable without stealing top-bar space from context switching.
32. As a **Volunteer**, I want **errors** from loaders to appear inside the shell with a **retry** affordance when possible, so that I can recover without losing navigation chrome.
33. As a **Volunteer**, I want **print** output to stay readable with minimal chrome, so that rosters printed from the browser are not littered with navigation noise.
34. As a **Volunteer**, I want **display typography** (Archivo Narrow, all caps) reserved for **hero and major titles**, while nav and dense UI use **Inter** in normal casing, so that Portuguese strings and long **Ministry** names remain readable.
35. As a **Volunteer**, I want **icons** to use a consistent thin stroke, so that the interface feels like one system.
36. As a **Developer**, I want **shadcn** primitives installed with a **foundation + navigation** batch first, so that dependency creep stays controlled.
37. As a **Developer**, I want **token-first** customization plus **curated** variants on high-visibility components, so that we do not fork every upstream file unnecessarily.
38. As a **Developer**, I want **Tailwind** integration to follow **shadcn’s current recommended** Vite path unless blocked, so that upgrades stay aligned with upstream documentation.
39. As a **Developer**, I want **CSS variables** for theme roles even while shipping **light-only** UI, so that **dark mode** can land later without a wholesale token rewrite.
40. As a **Developer**, I want **route-shaped i18n namespaces** aligned to placeholder areas, so that translators and reviewers can work in parallel without merge pain.
41. As a **Developer**, I want **placeholder routes** for primary nav sections, so that navigation IA is exercised early with truthful empty states.
42. As a **Developer**, I want the legacy **`/`** demo route to remain unchanged until explicitly replaced, so that ongoing tracer-bullet work is not destabilized mid-flight.
43. As a **Developer**, I want **`/dashboard`** to become the signed-in home inside the new shell, so that there is a clear product entry separate from the legacy landing experiment.
44. As a **Developer**, I want **TanStack Router** layouts to wrap authenticated areas in the shell, so that future feature routes inherit navigation automatically.
45. As a **Developer**, I want **Intl** formatting for numbers and localized times keyed off the **active UI locale**, while persisted scheduling remains **UTC** instants, so that presentation never corrupts canonical records.
46. As a **Developer**, I want **toast** stacking rules that cap concurrent success noise and never drop critical errors, so that feedback stays disciplined under rapid actions.
47. As a **Product owner**, I want decisions captured in **ADR 0001**, so that future contributors understand trade-offs without re-litigating the entire workshop.
48. As a **Product owner**, I want glossary updates in **`CONTEXT.md`** for **Onda**, **Time away**, **Default UI language**, and **Language switcher**, so that domain language stays consistent between product and engineering.
49. As a **Volunteer** with **reduced motion** preferences, I want nonessential animations removed or reduced to near-instant opacity transitions, so that overlays and micro-interactions do not violate my OS settings.
50. As a **Volunteer**, I want **sidebar** width chosen for **Portuguese** labels and long **Church** names, so that wrapping stays rare on common laptop widths.
51. As a **Volunteer**, I want **modal scrims** around **45%** black alpha by default with room for lighter drawers or heavier destructive dialogs, so that focus feels intentional without cinematic darkness by default.
52. As a **Volunteer**, I want **no blurred shadows** anywhere, so that the brand stays flat, sharp, and contemporary.
53. As a **Volunteer**, I want **neutral structure** built from **black-alpha hairlines** only, so that the UI does not quietly introduce decorative gray ramps.
54. As a **Accessibility champion**, I want **WCAG 2.2 AA** treated as a release gate for interactive states and copy contrast, so that accessibility is not an afterthought bolt-on.
55. As a **Volunteer**, I want **Time away** in the sidebar while still seeing **Unavailability** language where precision matters, so that public navigation stays human without losing model accuracy.

## Implementation Decisions

### Normative references

- Visual, shell, i18n, motion, elevation, badge, table interaction, accessibility, and scheduling UI posture decisions are **normative** in **ADR 0001**; this PRD defers to that ADR when there is any ambiguity.
- Domain vocabulary and public labels (**Time away**, **Onda**, **Default UI language**, **Language switcher**) remain authoritative in **`CONTEXT.md`**.

### Deep modules (encapsulate complexity behind stable seams)

- **Design token registry:** maps semantic roles (**background**, **foreground**, **border-hairline**, **destructive**, **focus**, future **`success`/`warning` ramps**) to **CSS variables** consumable by Tailwind and shadcn; owns **black-alpha** divider scale, **micro** radius (**2px**), scrim defaults, and **no blur shadow** policy. Stable public surface: token names and variable contracts, not individual hex edits scattered in components.
- **i18n controller:** initializes **`react-i18next`**, registers **`pt-BR`** and **`en`**, applies **`pt-BR` → `en`** fallback, loads **route-shaped** namespaces, exposes a tiny API for switching locale and persisting choice until **Identity** preferences exist. Stable public surface: `changeLocale`, `t` namespaces convention, and persistence adapter boundary.
- **App shell composer:** owns responsive layout rules (desktop sidebar width **~260px**, mobile top bar stickiness, sheet navigation wiring, `main` landmark target for skip link, footer regions for Help and account). Stable public surface: slot APIs for **Church**/**Campus** controls, nav items, and page outlet.
- **Context switcher controller (Church/Campus):** encapsulates dropdown behavior, keyboard/list wiring, and hybrid demo/real data shaping so routes do not reimplement menus. Stable public surface: props for available **Churches**, optional **Campuses**, selection callbacks, and `aria` labeling sourced from **`shell`** translations.
- **Navigation manifest:** single source of truth for primary nav labels, paths, feature flags, and placeholder-vs-real status; prevents drift between sidebar and mobile sheet.
- **Lucide icon facade:** centralizes **thin** stroke default and sizing so components do not import raw icons with inconsistent props.
- **Feedback orchestrator:** wraps toast provider with **bottom-right** anchoring, **max-two** stacking policy, and precedence rules for errors over success; keeps Sonner/shadcn wiring in one place.
- **Route error presentation:** standardizes **route-level** error UI inside the shell with **Retry**, versus **fatal root** handling, aligned with ADR wording.

### shadcn and Tailwind posture

- **Preset:** New York baseline; **hybrid** customization: token-driven primitives, curated variants on **Button**, **Card**, **Dialog**, **Badge**, and navigation primitives.
- **Install batch:** foundation + navigation components only on first pass; defer heavy date/calendar kits until scheduling UI needs them.
- **Tooling:** follow current shadcn + Tailwind guidance for Vite unless a documented incompatibility forces a fallback path (capture rationale if fallback happens).

### Internationalization posture

- **Locales:** **`pt-BR`** default first paint; **`en`** supported; **browser language auto-detection is explicitly not** the default (per ADR / glossary).
- **Namespaces:** **`common`**, **`shell`**, plus route-aligned namespaces for each primary placeholder surface.
- **Copy rule:** no user-visible literals in components that bypass i18n keys for supported locales.

### Shell and routing posture

- **Entry:** **`/dashboard`** is the primary signed-in landing inside the shell; legacy **`/`** remains untouched until an explicit follow-up replaces it.
- **Placeholder destinations:** each primary nav item resolves to a real route rendering the agreed empty state pattern inside the shell.
- **Church/Campus:** **dropdown** for **Church**; **secondary selector** for **Campus** when multiple; timezone cue per ADR.
- **Account/help placement:** per ADR (footer help desktop; account-driven help on mobile; optional duplicate in account on desktop).

### Interaction and motion

- **Overlay motion budget** and **`prefers-reduced-motion`** behavior per ADR.
- **Primary button** is **ink** on light surfaces; **destructive** stays semantic warm red-orange, not neutralized to black.

### Scheduling posture (anticipatory, minimal code in this milestone)

- **Pessimistic** mutations for **Scheduling**-shaped writes until real screens prove otherwise; pair with success toast + authoritative refetch strategy when those mutations exist.

### API and data boundaries

- This milestone is primarily presentation-layer; **Organization** read APIs for **Church** list and **Campus** list may be stubbed or static until available, but component contracts must accept real domain objects without renaming fields away from **`CONTEXT.md`**.

## Testing Decisions

- **Good tests** assert externally observable behavior: correct landmark and skip-link focus order, locale switching changes visible strings and persistence, router renders expected outlet for placeholder paths, and error boundary shows **Retry** and recovers after mocked failures. Avoid asserting specific Tailwind class strings or shadcn internal markup.
- **Modules to test (recommended):**
  - **i18n controller** (fallback chain, default locale, persistence adapter hook-in with a test double).
  - **Navigation manifest** (stable ordering, path existence for declared items).
  - **Context switcher controller** (selection callbacks, `aria-expanded` toggling at the behavioral level via testing-library queries rather than snapshotting implementation).
- **Optional higher-value UI tests (later):** a small Playwright smoke for mobile sheet open/close and **Church** switch selection if E2E infrastructure is introduced; not required to block the first milestone if not present.
- **Prior art:** existing vertical-slice issues emphasize API + Router read paths; this milestone adds presentation tests where the repo already uses component testing utilities—if none exist yet, establish a minimal pattern alongside the first shell component tests.

## Out of Scope

- Implementing full **Scheduling** CRUD screens, calendars, drag-and-drop roster boards, or recurring **Event** editors (covered by other slices and the platform PRD).
- **Dark mode** UI and theme toggle (tokens only prepare the path).
- **Optimistic** roster mutations and complex merge/conflict UI for concurrent editors.
- Full **print layout** for roster pagination, headers/footers, and page breaks (only **minimal print hygiene** here).
- **Third locales** beyond **`pt-BR`** and **`en`**.
- **Marketing site** redesign for **`/`** (explicitly deferred until chosen).
- **White-label** per-**Church** branding beyond the agreed **Onda** chrome rules.

## Further Notes

- This PRD is intentionally narrow: it is safe to implement without completing the entire volunteer platform backlog, but it must not contradict **`CONTEXT.md`** or **ADR 0001**.
- Parent platform intent remains in **`docs/prd/volunteer-management-platform.md`**; schedule engineering across both documents by treating this file as the **presentation foundation** milestone.
- **Issue tracker publishing:** the repository does not define an automated tracker integration. Create a tracker ticket manually (or paste from **`docs/issues/legacy-08-web-client-design-system-shell-i18n.md`**), and apply **`ready-for-agent`** per your triage convention once dependencies are satisfied.
