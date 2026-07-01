# HOPE Design System — Ondadura Visual Identity

> **Historical — HOPE era only.** Current authority: ADR [0006](docs/adr/0006-onda-brand-visual-system.md) + [0007](docs/adr/0007-frontend-serve-well-plus-api.md) + [`design-reference/serve-well/`](design-reference/serve-well/). HOPE full text retained below for #49 gate history; see [docs/adr/archive/](docs/adr/archive/).

A sharp, flat, brutalist-inspired design system. No rounded corners. Heavy borders. Bold typography. Yellow accent on black-and-white base.

---

## 1. Philosophy

- **Sharp edges everywhere** — all `border-radius` is `0px`
- **Heavy 2–3px borders** in pure black (`#000`)
- **Offset box-shadows** on hover (e.g. `5px 5px 0 #000`) for a print/stamp effect
- **Uppercase headings** with tight tracking
- **Minimal color palette** — black, white, grey, one accent yellow
- **Grid-based layouts** with visible cell borders (like a newspaper or broadsheet)

---

## 2. Color Palette

### Core

| Token                    | Value                     | Usage                                |
|--------------------------|---------------------------|--------------------------------------|
| `--color-accent`         | `#FFD93D`                 | Primary highlight, CTAs, active states |
| `--color-accent-dark`    | `#e6c200`                 | Hover/pressed accent                 |
| `--color-bg`             | `#e8e8e8`                 | Page background                      |
| `--color-dark`           | `#000000`                 | Borders, text, dark sections         |
| `--color-surface`        | `#ffffff`                 | Cards, inputs                        |
| `--color-surface-2`      | `#f2f2f2`                 | Secondary surfaces                   |
| `--color-border`         | `#000000`                 | Default borders                      |
| `--color-border-light`   | `#cccccc`                 | Subtle dividers                      |

### Text

| Token                      | Value       | Usage                    |
|----------------------------|-------------|--------------------------|
| `--color-text-primary`     | `#000000`   | Headings, primary text   |
| `--color-text-secondary`   | `#333333`   | Body paragraphs          |
| `--color-text-muted`       | `#666666`   | Captions, labels, meta   |
| `--color-text-inverse`     | `#ffffff`   | Text on dark backgrounds |

### Semantic / Category Colors (used sparingly as accents)

| Token                    | Value     | Category         |
|--------------------------|-----------|------------------|
| `--cat-food`             | `#22c55e` | Food             |
| `--cat-health`           | `#3b82f6` | Health           |
| `--cat-housing`          | `#f59e0b` | Housing          |
| `--cat-employment`       | `#8b5cf6` | Employment       |
| `--cat-documentation`    | `#6366f1` | Documentation    |
| `--cat-financial`        | `#10b981` | Financial        |
| `--cat-violence`         | `#ef4444` | Domestic Violence|
| `--cat-education`        | `#0ea5e9` | Education        |
| `--cat-discrimination`   | `#ec4899` | Discrimination   |
| `--cat-general`          | `#6b7280` | General          |

---

## 3. Typography

### Fonts

| Role     | Family       | CSS Variable         | Weights            |
|----------|-------------|----------------------|--------------------|
| Headings | Montserrat  | `--font-heading`     | 400–900            |
| Body     | Inter       | `--font-body`        | 300–600            |

Load via Google Fonts or `next/font`:

```css
--font-heading: var(--font-montserrat, 'Montserrat', sans-serif);
--font-body: var(--font-inter, 'Inter', sans-serif);
```

### Scale (fluid clamp)

| Element | Size                            | Weight | Transform   | Tracking     |
|---------|---------------------------------|--------|-------------|--------------|
| `h1`    | `clamp(2.5rem, 7vw, 5rem)`     | 800    | `uppercase` | `-0.01em`    |
| `h2`    | `clamp(1.8rem, 4vw, 3rem)`     | 800    | `uppercase` | `-0.01em`    |
| `h3`    | `clamp(1.1rem, 2vw, 1.5rem)`   | 800    | `uppercase` | `-0.01em`    |
| `h4`    | `1.1rem`                        | 800    | `uppercase` | `-0.01em`    |
| `body`  | `16px` base, `line-height: 1.65`| 400    | none        | normal       |
| `p`     | inherits                        | 400    | none        | normal       |

### Rules

- All headings: `font-family: var(--font-heading)`, `text-transform: uppercase`, `line-height: 1.1`
- Body text: `font-family: var(--font-body)`, `line-height: 1.75`, no transform
- Labels/captions: `font-family: var(--font-heading)`, `0.7–0.82rem`, `uppercase`, `letter-spacing: 0.06–0.12em`, `font-weight: 700`

---

## 4. Spacing

| Token          | Value  |
|----------------|--------|
| `--space-xs`   | `4px`  |
| `--space-sm`   | `8px`  |
| `--space-md`   | `16px` |
| `--space-lg`   | `24px` |
| `--space-xl`   | `40px` |
| `--space-2xl`  | `64px` |
| `--space-3xl`  | `96px` |

---

## 5. Border Radius

**Always 0px.** This is the core of the visual identity.

```css
--radius-sm: 0px;
--radius-md: 0px;
--radius-lg: 0px;
--radius-xl: 0px;
--radius-pill: 0px;
```

---

## 6. Transitions

| Token               | Value       |
|----------------------|-------------|
| `--transition-fast`  | `150ms ease`|
| `--transition-base`  | `250ms ease`|
| `--transition-slow`  | `400ms ease`|

---

## 7. Layout

### Container

```css
.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-lg); /* 24px */
}
```

### Section

```css
.section {
  padding: var(--space-3xl) 0; /* 96px vertical */
}
```

---

## 8. Components

### 8.1 Buttons

All buttons: `border-radius: 0`, `border: 2px solid #000`, `font-family: var(--font-heading)`, `text-transform: uppercase`, `letter-spacing: 0.08em`, `font-weight: 700`.

| Variant       | Default State                                      | Hover State                                                       |
|---------------|----------------------------------------------------|--------------------------------------------------------------------|
| `.btn-primary` | `bg: #000`, `color: #fff`                          | `bg: accent`, `color: #000`, `translateY(-2px)`, `box-shadow: 4px 4px 0 #000` |
| `.btn-accent`  | `bg: #FFD93D`, `color: #000`                       | `bg: #000`, `color: #fff`, `translateY(-2px)`, `box-shadow: 4px 4px 0 #FFD93D` |
| `.btn-outline` | `bg: transparent`, `color: #000`, `border: 2px #000`| `bg: #000`, `color: #fff`, `translateY(-2px)`, `box-shadow: 4px 4px 0 #FFD93D` |
| `.btn-ghost`   | `bg: transparent`, `color: #000`, `border: none`   | `bg: rgba(0,0,0,0.06)`                                           |

Sizes:

| Size      | Padding          | Font Size  |
|-----------|------------------|------------|
| default   | `14px 28px`      | `0.82rem`  |
| `.btn-sm` | `8px 18px`       | `0.75rem`  |
| `.btn-lg` | `16px 36px`      | `0.88rem`  |

### 8.2 Cards

#### Category Card

- White background, no border-radius
- Grid layout with visible cell borders (no gaps — borders form the grid lines)
- `border-right: 2px solid #000`, `border-bottom: 2px solid #000`
- Outer container: `border: 2px solid #000`
- Hover: `translateY(-3px)`, `box-shadow: 6px 6px 0 #000`, bg shifts to `#e8e8e8`
- Left-edge yellow accent on hover (`:before` pseudo-element, `scaleY(0)→scaleY(1)`)
- Icon box: `52×52px`, `border: 2px solid #000`, `bg: #e8e8e8` → accent on hover

#### Resource Card

- `border: 2px solid #000`, white bg
- Hover: `translateY(-3px)`, `box-shadow: 5px 5px 0 #000`
- Tags/badges: `border: 1px solid #000`, `padding: 3px 10px`, uppercase, `0.72rem`
- Urgent badge: `bg: #000`, `color: #FFD93D`
- Category badge: `bg: #FFD93D`, `color: #000`

#### Feature Card

- `border: 2px solid #000`, white bg
- Hover: `translateY(-3px)`, `box-shadow: 5px 5px 0 #000`
- Large emoji icon, uppercase heading, body text

### 8.3 Header

- Sticky, `z-index: 1000`, white bg, `border-bottom: 2px solid #000`
- Height: `72px`
- Logo: square-bordered box (`48×48px`, `border: 2.5px solid #000`), split text "HO/PE"
- Nav links: uppercase, `0.82rem`, `font-weight: 700`, underline accent on hover/active (`border-bottom: 2.5px solid #FFD93D`)
- Search input: `border: 2px solid #000`, focus adds `box-shadow: 4px 4px 0 #FFD93D`

### 8.4 Footer

- `bg: #000`, `border-top: 4px solid #FFD93D`
- 4-column grid (`2fr 1fr 1fr 1fr`)
- Section titles: `0.75rem`, uppercase, `letter-spacing: 0.12em`, white, with bottom border `1px solid rgba(255,255,255,0.15)`
- Links: `rgba(255,255,255,0.55)`, hover → accent yellow
- Bottom bar: `border-top: 1px solid rgba(255,255,255,0.1)`, `0.82rem`, `rgba(255,255,255,0.35)`

### 8.5 Hero Section

- `bg: #e8e8e8`, `border-bottom: 2px solid #000`
- Badge/label: `bg: #000`, `color: #FFD93D`, uppercase monospace-style tag
- Heading highlight: `background: #FFD93D`, `color: #000`, inline pad
- Stats bar: `border-top: 2px solid #000`, cells separated by `border-right: 2px solid #000`
- Stat value: `2.2rem`, weight 900

### 8.6 Page Header (Inner Pages)

- `bg: #000`, `border-bottom: 4px solid #FFD93D`
- Breadcrumb: uppercase, `0.8rem`, `rgba(255,255,255,0.45)`, hover → accent
- Title: white

### 8.7 Search & Filters

- Search bar: `border: 2px solid #000`, input focus bg `#fffbe6`
- Filter chips: joined cells with `border-right: 2px solid #000`, active → accent yellow bg

### 8.8 Language Switcher

- Two-segment toggle: `border: 2px solid #000`
- Active segment: `bg: #000`, `color: #fff`
- Inactive: transparent bg, `color: #000`
- `font-size: 0.72rem`, uppercase, `letter-spacing: 0.08em`

### 8.9 Urgent Banner

- `bg: #000`, `border-left: 5px solid #FFD93D`
- Title: accent yellow, uppercase
- Body: `rgba(255,255,255,0.75)`
- Links: accent yellow

### 8.10 Detail Page

- Two-column grid: `1fr 360px`
- Detail card: `border: 2px solid #000`, white bg
- Section title: `0.7rem`, uppercase, `letter-spacing: 0.12em`, `border-bottom: 2px solid #000`
- Contact items: icon box `38×38px` with `border: 2px solid #000`

### 8.11 Empty State

- Centered, `border: 2px solid var(--color-border-light)`
- Large emoji icon, muted text

### 8.12 Loading Skeleton

```css
background: linear-gradient(90deg, #ccc 0%, #e0e0e0 50%, #ccc 100%);
background-size: 200% 100%;
animation: shimmer 1.5s infinite;
```

---

## 9. Animations

### Keyframes

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
```

### Stagger Pattern

Apply `.stagger-children` to a parent. Children get incremental delays:

```
nth-child(1): 0.05s
nth-child(2): 0.10s
...
nth-child(10): 0.50s
```

---

## 10. Hover / Interaction Pattern

The signature interaction across all interactive elements:

1. `transform: translateY(-2px)` or `translateY(-3px)` — slight upward lift
2. `box-shadow: Npx Npx 0 <color>` — hard offset shadow (no blur)
3. Shadow color alternates: `#000` for light elements, `#FFD93D` for dark elements
4. Arrow icons: `translateX(5px)` on card hover

---

## 11. Responsive Breakpoints

| Breakpoint   | Changes                                                     |
|--------------|-------------------------------------------------------------|
| `≤ 1024px`   | Detail grid → single column, features grid → 2 col, footer → 2 col |
| `≤ 768px`    | Hide nav + header search, features → 1 col, footer → 1 col, categories → 2 col, resources → 1 col, filter bar wraps, search bar stacks |
| `≤ 480px`    | Categories → 1 col, hero stats → 1 col                     |

---

## 12. Utility Classes

| Class        | Effect                                               |
|--------------|------------------------------------------------------|
| `.text-center` | `text-align: center`                               |
| `.mt-sm/md/lg/xl` | Margin-top using spacing tokens                |
| `.mb-sm/md/lg/xl` | Margin-bottom using spacing tokens             |
| `.flex`        | `display: flex`                                    |
| `.flex-center` | `display: flex; align-items: center; justify-content: center` |
| `.gap-sm/md`   | Gap using spacing tokens                           |
| `.w-full`      | `width: 100%`                                      |
| `.sr-only`     | Visually hidden, screen-reader accessible          |

---

## 13. CSS Variables — Complete Reference

Paste this `:root` block into any project to bootstrap the system:

```css
:root {
  --color-accent: #FFD93D;
  --color-accent-dark: #e6c200;
  --color-bg: #e8e8e8;
  --color-dark: #000000;
  --color-surface: #ffffff;
  --color-surface-2: #f2f2f2;
  --color-border: #000000;
  --color-border-light: #cccccc;
  --color-text-primary: #000000;
  --color-text-secondary: #333333;
  --color-text-muted: #666666;
  --color-text-inverse: #ffffff;
  --radius-sm: 0px;
  --radius-md: 0px;
  --radius-lg: 0px;
  --radius-xl: 0px;
  --radius-pill: 0px;
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 40px;
  --space-2xl: 64px;
  --space-3xl: 96px;
  --font-heading: 'Montserrat', sans-serif;
  --font-body: 'Inter', sans-serif;
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
  --transition-slow: 400ms ease;
}
```

---

## 14. Quick Visual Summary

> **Black borders. Yellow accent. Zero radius. Offset shadows. Uppercase Montserrat headings. Inter body. Newspaper grid. Stamp-like interactions.**
