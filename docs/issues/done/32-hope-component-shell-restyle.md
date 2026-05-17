# 32 — HOPE component and shell restyle

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/hope-design-system-migration.md` (modules 3–7); `docs/adr/0003-hope-design-system-replaces-lamborghini.md`; `DESIGN_SYSTEM.md` (sections 8–11)

## Parent

- PRD: `docs/prd/hope-design-system-migration.md`
- GH: [#26](https://github.com/kairan/onda-volunteer/issues/26)

## What to build

Restyle all existing UI primitives (Button, Card), the app shell (sidebar, brand, navigation, mobile header), and the dashboard page to match the HOPE brutalist visual identity. Adds HOPE-specific component patterns (heavy borders, offset shadows, hover interactions, brand box) on top of the token foundation from slice 31.

**Button primitive:**
- Add `border-2 border-black` to base class
- Default variant: `bg-black text-white`, hover → accent yellow
- Accent variant: `bg-[#FFD93D] text-black`, hover → black bg
- Outline variant: transparent with `border-2 border-black`, hover → black fill
- Ghost variant: transparent, no border, hover → subtle black-alpha bg
- All interactive variants: HOPE hover `hover:-translate-y-0.5` + `hover:shadow-[4px_4px_0_#000]`
- Destructive retains semantic red-orange with matching offset shadow
- Sizes per HOPE spec: default `14px 28px`, sm `8px 18px`, lg `16px 36px`

**Card primitive:**
- Base: `border-2 border-black bg-white`
- Hover: `-translate-y-[3px]` + `shadow-[6px_6px_0_#000]`
- Optional left-edge yellow accent on hover via `:before` pseudo-element
- `CardTitle` inherits Montserrat from `--font-display` token

**Shell restyle:**
- Sidebar: white/surface bg, `border-r-2 border-black`
- `ShellBrand`: square box ~48px with `border-[2.5px] border-black`, split text "ON/DA", compact variant for mobile
- Nav links: Inter normal-case (ADR 0001), active → `border-bottom: 2.5px solid #FFD93D`
- Mobile header: `border-b-2 border-black`, white bg, sticky
- Mobile nav sheet: `border-r-2 border-black`, white bg
- All existing behavior preserved: Church/Campus selectors, timezone cue, skip link, i18n, account panel

**Dashboard restyle:**
- Hero: `bg-[#e8e8e8]`, `border-b-2 border-black`
- Badge: `bg-black text-[#FFD93D]` uppercase
- Heading: inline highlight `bg-[#FFD93D] text-black`
- Stats bar: `border-t-2 border-black`, cells separated by `border-r-2 border-black`, values in Montserrat 800–900 ~2.2rem

**Tests:**
- Update `button.behavior.test.tsx`: border-2, hover classes, variant membership
- Create `card.behavior.test.ts`: border-2, surface bg, hover shadow
- Extend `AppShell.behavior.test.tsx`: sidebar border weight, brand box "ON/DA", nav active indicator
- Create dashboard behavior test: hero structure, stats grid borders

## Acceptance criteria

- [ ] Buttons render with 2px solid black borders and HOPE hover lift + offset shadow
- [ ] Button variants match HOPE spec (primary=ink black, accent=yellow, outline, ghost, destructive)
- [ ] Cards render with 2px solid black borders and hover lift + offset shadow
- [ ] Sidebar has white background with heavy black right border
- [ ] Brand box renders as ~48px square with 2.5px border containing "ON/DA"
- [ ] Mobile header has heavy black bottom border on white background
- [ ] Nav links show yellow underline accent on active/hover
- [ ] Dashboard hero has black badge with yellow text, heading with yellow highlight, bordered stats bar
- [ ] All existing shell behavior preserved
- [ ] WCAG 2.2 AA contrast ratios maintained
- [ ] All behavior tests passing (button, card, shell, dashboard)
- [ ] Responsive breakpoints per HOPE spec (1024px, 768px, 480px)
- [ ] `prefers-reduced-motion` respected for hover/shadow transitions

## Blocked by

- Slice 31 (`31-hope-token-foundation-font-swap.md`) / [#27](https://github.com/kairan/onda-volunteer/issues/27)
