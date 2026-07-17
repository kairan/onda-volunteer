# official-brandbook-web-onda Validation

**Date**: 2026-07-16  
**Spec**: `.specs/features/official-brandbook-web-onda/spec.md`  
**Diff range**: `7186d21..HEAD` (`7186d21` → `fd01c91`)  
**Verifier**: independent sub-agent (author ≠ verifier) — iteration 2 of max 3  
**Branch**: `feat/180-official-brandbook-web-onda`

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T01 Vendor assets | ✅ Done | Assets under `src/assets/brand/` |
| T02 Light tokens + contract | ✅ Done | |
| T03 Dark retune | ✅ Done | |
| T04 IgrejaOndaWordmark | ✅ Done | |
| T05 Wire shells | ✅ Done | System Admin Logo 1 assert present |
| T06 Auth gradient | ✅ Done | |
| T07 Empty grafismo | ✅ Done | Dedicated stable timeAway test |
| T08 Sidebar watermark | ✅ Done | No-glass on AssignmentCard/roster |
| T09 ADR + docs | ✅ Done | |

---

## Prior FAIL gaps (iteration 1) — re-check

| Gap | Evidence | Result |
| --- | -------- | ------ |
| 1. timeAway empty grafismo dedicated stable test | `timeAway.behavior.test.tsx:97-117` — dedicated `it('shows filled grafismo on empty time-away')`; create-dialog test no longer nests brand asserts | ✅ Closed |
| 2. System Admin Logo 1 (BB-LOGO-01 AC4) | `systemAdminShell.behavior.test.tsx:38-40` — `findAllByRole('img', { name: /igreja onda/i })` length > 0 | ✅ Closed |
| 3. font-display uppercase (BB-TYPE-01 AC2) | `globals.css:34-38` + `theme.contract.test.ts:114-117` — `@utility font-display` + `text-transform: uppercase` | ✅ Closed (≤2/screen = ADR convention, not unit-enforced) |
| 4. No glass on AssignmentCard/roster (BB-FLR-01 AC4) | `AssignmentCard.test.tsx:11-13`; `RosterByEventSection.behavior.test.tsx:53-57` | ✅ Closed |
| 5. Destructive + dark AA (BB-TOK-01 AC5 / BB-DARK-01 AC2) | `theme.contract.test.ts:189-203` destructive contrast ≥3:1; `:206-222` dark FG/BG ≥4.5:1 + primary FG ≥3:1 | ✅ Closed |
| 6. Print flourish hide edge | `theme.contract.test.ts:225-231` — `@media print` auth gradient + watermark | ✅ Closed |

---

## Spec-Anchored Acceptance Criteria

### BB-TOK-01 — Official design tokens

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN `:root` loads THEN `--background` = `#eeeee7` (oklch) | `oklch(0.9472 0.0093 106.58)` | `theme.contract.test.ts:97` — `--background` oklch lock | ✅ PASS |
| WHEN primary/hover THEN `#2537de` / `#1f2bc8` (oklch) | primary `0.4601…267.96`; hover `0.4176…268.04` | `theme.contract.test.ts:99-100` | ✅ PASS |
| WHEN cards/inputs THEN white card + cool-blue borders | `--card: oklch(1 0 0)`; border/input cool blue | `theme.contract.test.ts:101,146-147` | ✅ PASS |
| WHEN contract tests run THEN new anchors replace provisional | Official oklch locks | `theme.contract.test.ts:96-106` | ✅ PASS |
| WHEN destructive/warning THEN distinguishable + WCAG 2.2 AA on `#eeeee7`/white | AA for destructive on wash/card | `theme.contract.test.ts:189-203` — destructive oklch lock + `contrastRatio(...) >= AA_UI_COMPONENT` (3:1). No separate `--warning` token in theme (ADR: semantic destructive/focus/warning — destructive locked) | ✅ PASS |

### BB-LOGO-01 — Official Logo 1 wordmark

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN church shell brand renders THEN Logo 1 PNG `igreja onda` | `role=img` name `/igreja onda/i` | `AppShell.behavior.test.tsx:129-131` | ✅ PASS |
| WHEN light THEN preto; WHEN dark/primary tile THEN branco | preto / branco Logo 1 | `IgrejaOndaWordmark.test.tsx:16` preto; `ProtectedAppShell.behavior.test.tsx:55` branco | ✅ PASS |
| WHEN Church name shown THEN adjacent/under wordmark | Church name present | `AppShell.behavior.test.tsx:132` — `Demo Church` | ✅ PASS |
| WHEN System Admin shell THEN same Logo 1 treatment | `igreja onda` wordmark | `systemAdminShell.behavior.test.tsx:38-40` | ✅ PASS |
| WHEN logo files missing THEN build/tests fail | Four brand files exist | `theme.contract.test.ts:165-176` — `existsSync(.../assets/brand/...)` | ✅ PASS |

### BB-TYPE-01 — Typography product-safe

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN UI chrome/body/forms/captions THEN Space Grotesk | `--font-sans: 'Space Grotesk'` | `theme.contract.test.ts:108-111` | ✅ PASS |
| WHEN display/hero uses Right Grotesk THEN uppercase + ≤2/screen | Uppercase utility; ≤2 convention | `theme.contract.test.ts:114-117` — `text-transform: uppercase`. ≤2/screen documented ADR convention (not unit-enforced) | ✅ PASS |
| WHEN scanning font loads THEN no SF Pro | No SF Pro import/binary | `theme.contract.test.ts:150-162` | ✅ PASS |
| WHEN ADR/DESIGN_SYSTEM update THEN SF Pro = print/marketing only | Documented exclusion | `docs/adr/0006-onda-brand-visual-system.md:111` | ✅ PASS |

### BB-FLR-01 — Balanced flourishes

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN auth entry THEN soft BrandBook blue gradient | Not flat `bg-background` only | `ProtectedAppShell.behavior.test.tsx:51-52` — `auth-brand-gradient` | ✅ PASS |
| WHEN major empty states THEN grafismo (decorative) | Grafismo present, `aria-hidden` | `scheduling.behavior.test.tsx:70-72,182-184`; `timeAway.behavior.test.tsx:114-117` | ✅ PASS |
| WHEN sidebar THEN subtle watermark MAY | Low-opacity line watermark; nav usable | `AppShell.behavior.test.tsx:201-212` | ✅ PASS |
| WHEN sticky header THEN glass MAY; WHEN cards/tables THEN no glass | No glass on AssignmentCard / roster | `AssignmentCard.test.tsx:11-13`; `RosterByEventSection.behavior.test.tsx:53-57`; auth panel `ProtectedAppShell.behavior.test.tsx:59` | ✅ PASS |
| WHEN grafismos THEN BrandBook in-repo assets | `grafismo-ondas-*` sources | `BrandGrafismo.test.tsx:16,24`; `theme.contract.test.ts:169-170` | ✅ PASS |

### BB-DOC-01 — Docs & ADR

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN feature ships THEN ADR 0006 amended | Official hex, Logo 1, Balanced, SF Pro | `docs/adr/0006-onda-brand-visual-system.md:83-111` | ✅ PASS |
| WHEN DESIGN_SYSTEM mentions provisional as current THEN update | Banner points to Brandbook 2027 | `DESIGN_SYSTEM.md:3` | ✅ PASS |
| WHEN #175 cutover starts THEN brand on main / included | #175 docs cite #180 prerequisite | `docs/issues/175-web-onda-phase-5-cutover.md:4-5` | ✅ PASS |

### BB-DARK-01 — Dark mode retune

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| WHEN `.dark` active THEN primary/accent BrandBook blue family | Dark `--primary`/`--ring` blue-family oklch | `theme.contract.test.ts:179-186` | ✅ PASS |
| WHEN contrast on dark THEN WCAG 2.2 AA for critical chrome | AA for text/icons on dark | `theme.contract.test.ts:206-222` — FG/BG ≥4.5; primary FG ≥3 | ✅ PASS |

**Status**: ✅ All ACs covered — **24/24** matched (≤2 display/screen = documented convention)

---

## Edge Cases

| Edge case | Spec outcome | Evidence | Result |
| --------- | ------------ | -------- | ------ |
| Logo PNG fails to load | Fallback text `igreja onda` (not `Onda`) | `IgrejaOndaWordmark.test.tsx:41-43` | ✅ |
| Sidebar collapsed | Recognizable compact mark | `IgrejaOndaWordmark.test.tsx:31-32` — `object-cover` / `object-left` | ✅ |
| Watermark under nav | Hit targets / focus usable | `AppShell.behavior.test.tsx:189-213` | ✅ |
| Printing | Decorative flourishes MAY hide | `theme.contract.test.ts:225-231` + `globals.css:191-198` | ✅ |

---

## Discrimination Sensor

Scratch method: temporary file backups under `/tmp`; mutate → run targeted Vitest → restore. Working tree verified clean after each (and after accidental race with gate).

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `globals.css` `:root --primary` | Wrong primary oklch → `oklch(0.9999 0.0001 0)` | ✅ Killed — `theme.contract.test.ts:99` |
| 2 | `SystemAdminShell.tsx` wordmark | Replaced `IgrejaOndaWordmark` with text `Onda` | ✅ Killed — `systemAdminShell.behavior.test.tsx:39` |
| 3 | `AssignmentCard.tsx` | Injected `backdrop-blur` into className | ✅ Killed — `AssignmentCard.test.tsx:12` |

**Sensor depth**: lightweight (3 targeted, suggested)  
**Result**: 3/3 killed — PASS ✅

---

## Interactive UAT Results

Not performed (Verifier sub-agent; visual UAT deferred to human if desired).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep | ✅ |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ✅ |
| Per-layer Coverage Expectation | ✅ |
| Every test maps to a spec requirement | ✅ |
| Documented guidelines followed: `AGENTS.md` Vitest/RTL | ✅ |

---

## Gate Check

- **Gate command**: `pnpm --filter @onda/web-onda test && pnpm typecheck:web-onda && pnpm --filter @onda/web-onda build && pnpm lint`
- **Vitest run 1 (isolated)**: **132 passed**, 0 failed
- **Vitest run 2 (in full gate, after restore)**: **132 passed**, 0 failed
- **typecheck:web-onda**: ✅
- **build**: ✅
- **lint**: ✅ (`--max-warnings 0`)
- **Test count after feature**: 132 (`@onda/web-onda` Vitest) — was 125 at prior FAIL report (+7)
- **Skipped tests**: none
- **Failures**: none (prior timeAway flake not reproduced across two full suite runs)

---

## Fix Plans

None — prior gaps closed with evidence; sensor mutants killed; gate green.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| BB-TOK-01 | ❌ Needs Fix (AC5) | ✅ Verified |
| BB-LOGO-01 | ❌ Needs Fix (AC4) | ✅ Verified |
| BB-TYPE-01 | ❌ Needs Fix (AC2) | ✅ Verified |
| BB-FLR-01 | ❌ Needs Fix (AC4 cards/tables) | ✅ Verified |
| BB-DOC-01 | ✅ Verified | ✅ Verified |
| BB-DARK-01 | ❌ Needs Fix (AC2) | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 24/24 ACs matched | 0 blocking gaps (≤2 display/screen = ADR convention)  
**Sensor**: 3/3 mutations killed  
**Gate**: 132 passed, typecheck/build/lint green (vitest ×2)

**What works**: Official BrandBook tokens + AA locks; Logo 1 in church + System Admin shells; typography/SF Pro exclusion; Balanced flourishes; no glass on cards/roster; print hide; ADR/docs/#175; discrimination sensor.

**Issues found**: none

**Next steps**: Merge path / unblock #175 after human UAT if desired.
