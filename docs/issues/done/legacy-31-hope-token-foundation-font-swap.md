# 31 — HOPE token foundation + font swap

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/hope-design-system-migration.md` (modules 1, 2, 7); `docs/adr/0003-hope-design-system-replaces-lamborghini.md`; `DESIGN_SYSTEM.md` (sections 2, 3, 4, 6, 13)

## Parent

- PRD: `docs/prd/hope-design-system-migration.md`
- GH: [#26](https://github.com/kairan/onda-volunteer/issues/26)

## What to build

Invert the CSS variable color posture from dark-field (Lamborghini) to light-field (HOPE) and swap the display font from Archivo Narrow to Montserrat. This is the foundation slice — changing `:root` values in `globals.css` propagates through every component consuming Tailwind semantic classes via the `@theme` bridge.

**Token changes:**
- `--background`: black → ~`0 0% 91%` (#e8e8e8 light gray)
- `--foreground`: white → black
- `--surface`: #212121 → white
- `--surface-foreground`: near-white → near-black
- `--muted-foreground`: tune for readability on light field
- `--brand` and `--primary`: `45 100% 50%` (#FFC000) → `51 100% 62%` (#FFD93D)
- `--brand-foreground` and `--primary-foreground`: remain black
- `--border`: white-alpha-16% → `0 0% 0%` (solid black)
- `--ring`: unchanged (focus blue)
- `--destructive`: unchanged (warm red-orange)
- `--radius`: unchanged (0px)
- Add new tokens: `--border-weight: 2px`, `--shadow-offset-sm`, `--shadow-offset-md`, `--transition-fast`, `--transition-base`, `--transition-slow` per HOPE spec

**Font swap:**
- Remove `@fontsource/archivo-narrow` dependency
- Add `@fontsource/montserrat` with weights 400, 700, 800
- Update `globals.css` imports
- Update `--font-display` from `'Archivo Narrow'` to `'Montserrat'` in `@theme`

**Contract tests:**
- Update `theme.contract.test.ts` to lock new HOPE HSL values
- Add assertions for new tokens
- Update `tokens.ts` required variables list if new tokens added

## Acceptance criteria

- [ ] App renders with light gray (#e8e8e8) page background and black text
- [ ] Card/surface areas render white on gray background
- [ ] Accent/primary color is #FFD93D yellow (not #FFC000 gold)
- [ ] Borders render as solid black (not white-alpha hairlines)
- [ ] Headings render in Montserrat (not Archivo Narrow)
- [ ] Body text renders in Inter (unchanged)
- [ ] Focus rings remain blue, destructive remains warm red-orange
- [ ] `--radius` remains `0px`
- [ ] `theme.contract.test.ts` passes with updated locked values
- [ ] `@fontsource/archivo-narrow` removed from `package.json`
- [ ] `@fontsource/montserrat` added with correct weight imports
- [ ] No TypeScript or lint errors introduced
- [ ] `prefers-reduced-motion` media query preserved

## Blocked by

None — can start immediately.
