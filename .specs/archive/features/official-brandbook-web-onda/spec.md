# Official BrandBook → web-onda — Specification

## Status

- **Phase:** Shipped — merged PR [#182](https://github.com/kairan/onda-volunteer/pull/182) (2026-07-17); archived per AD-001
- **Decisions:** [context.md](./context.md) · **AD-002** in [`.specs/project/STATE.md`](../../../project/STATE.md)
- **Design:** [design.md](./design.md)
- **Tasks:** [tasks.md](./tasks.md) — all tasks `[x]`
- **Validation:** [validation.md](./validation.md) — PASS
- **Amends:** ADR 0006 (provisional → official Brandbook 2027) — amended 2026-07-16
- **Ship record:** `docs/issues/done/180-web-onda-official-brandbook.md`
- **Issue:** [#180](https://github.com/kairan/onda-volunteer/issues/180) (closed)
- **Brand source (canonical):** `apps/web-onda/src/assets/brand/` after T01 (see [`docs/runbooks/brand-assets.md`](../../../docs/runbooks/brand-assets.md)). Optional local marketing kit is human-only; do not require machine-local paths for Execute.

## Problem Statement

`apps/web-onda` still runs on the **provisional** Igreja Onda identity from ADR 0006 (`#2034D6`, `#FAFAFA`, typed “Onda” wordmark). The official **Brandbook 2027** is now available with locked palette (`#eeeee7`, blues through `#2537de`), Logo 1 wordmark files, grafismos, and type rules. Shipping cutover (#175) on provisional chrome would lock the wrong brand into production.

## Goals

- [x] Official BrandBook tokens (background `#eeeee7`, primary blues, borders/muted from secondary scale) drive `web-onda` theme contract tests.
- [x] Shell shows official **Logo 1** PNG wordmark **`igreja onda`** (not typed “Onda”).
- [x] Balanced brand flourishes: auth gradient, empty-state grafismo, subtle sidebar watermark, glass only on existing frosted chrome.
- [x] Typography: Space Grotesk for all product UI; Right Grotesk display uppercase only; **no** SF Pro embedding.
- [x] Feature complete before #175 Execute (pending merge to `main`).

## Out of Scope

| Item | Reason |
|------|--------|
| SVG wordmark extraction / ship | `.ai` not extractable without Illustrator; PNG Logo 1 for now |
| SF Pro Display in app | Apple license forbids web embedding; captions use Space Grotesk |
| Locale wordmarks (`onda church` / `iglesia onda`) | Locked to `igreja onda` |
| Church Admin / System Admin layout redesign | Tokens only; layouts deferred |
| Marketing `/` landing, Instagram templates, submarcas | Not product shell |
| Full BrandBook glass/gradient density on roster tables | Balanced lane — avoid clutter |
| Reskinning `apps/web` or `apps/web-next` | Deleted at #175; only `web-onda` |
| Auto-traced / recreated wordmark | BrandBook forbids recreating logo by typing/tracing |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|-----------------------|----------------|-----------|------------|
| Flourish intensity | Balanced | User lock | y |
| Wordmark | PNG Logo 1 `igreja onda` | User lock; SVG later | y |
| Page background | `#eeeee7` | Official primary palette | y |
| Captions font | Space Grotesk (no SF Pro) | License + BrandBook allows Space for captions | y |
| Timing | Before #175 | User lock | y |
| Primary action hex | `#2537de` | Brightest primary BrandBook blue; hover `#1f2bc8` | y — locked in design.md |
| Dark mode | Light retune of `.dark` tokens to same brand family | Keep existing dark support without full BrandBook dark system | y — agent discretion in T03 |
| Admin shells | Inherit tokens only | Prior ADR pattern | y (assumption) |

**Open questions:** none blocking Specify — primary-hex confirmation may refine in Design without changing stories.

---

## User Stories

### P1: Official design tokens ⭐ MVP

**User Story**: As any signed-in user, I want the app colors to match the official BrandBook so the product feels like Igreja Onda, not a provisional prototype.

**Why P1**: Wrong tokens at cutover become production debt.

**Acceptance Criteria**:

1. WHEN `:root` theme loads THEN page `--background` SHALL resolve to official warm wash **`#eeeee7`** (or equivalent oklch locked in theme contract tests).
2. WHEN primary actions / links / focus rings render THEN they SHALL use BrandBook primary blue **`#2537de`** with hover **`#1f2bc8`** (contract-tested).
3. WHEN cards and inputs render THEN surfaces SHALL remain white/`--card` with borders from BrandBook secondary cool blues (e.g. `#9cc7e4` / `#b0d3e7` family — exact token mapping in Design).
4. WHEN theme contract tests run THEN they SHALL assert the new anchors (replacing provisional `#2034D6` / `#FAFAFA` oklch locks).
5. WHEN destructive/warning scheduling semantics appear THEN they SHALL remain distinguishable and WCAG 2.2 AA on `#eeeee7` and white cards.

**Independent Test**: Open any `web-onda` route; inspect CSS variables / run `theme.contract.test.ts`.

---

### P1: Official Logo 1 wordmark in shell ⭐ MVP

**User Story**: As a church-role user, I want to see the official **igreja onda** logo in the shell so the product is recognizably branded.

**Why P1**: BrandBook forbids typed Space Grotesk recreation of the wordmark.

**Acceptance Criteria**:

1. WHEN church-role shell header/sidebar brand area renders THEN it SHALL show **Logo 1** PNG assets for **`igreja onda`** (not the string “Onda” as the sole mark).
2. WHEN the brand sits on a light surface THEN the shell SHALL use the **preto** Logo 1 asset; WHEN on a dark/primary tile THEN it SHALL use the **branco** Logo 1 asset.
3. WHEN the active **Church** name is shown THEN it SHALL remain adjacent/under the wordmark as tenant context (ADR 0001 structure preserved).
4. WHEN System Admin operator shell renders THEN it SHALL use the same Logo 1 treatment (tokens + mark), without a layout redesign.
5. WHEN logo files are missing from the package THEN build/tests SHALL fail (assets committed under `apps/web-onda`).

**Independent Test**: Load shell; assert `<img>`/`role="img"` for igreja onda logo; behavior test updated from “Onda” text.

---

### P1: Typography per BrandBook (product-safe) ⭐ MVP

**User Story**: As a user, I want type that matches BrandBook roles without illegal font embedding.

**Why P1**: Closes SF Pro decision and keeps Right Grotesk rules.

**Acceptance Criteria**:

1. WHEN UI chrome, body, forms, tables, and captions/meta render THEN they SHALL use **Space Grotesk** (including former “caption” role).
2. WHEN display/hero headlines use Right Grotesk THEN text SHALL be **uppercase** and limited to ≤2 per screen (existing display utility).
3. WHEN scanning app font loads THEN there SHALL be **no** `@font-face` or binary for Apple **SF Pro** in `apps/web-onda`.
4. WHEN ADR 0006 / DESIGN_SYSTEM docs update THEN they SHALL state SF Pro = print/marketing only.

**Independent Test**: Theme contract + grep for SF Pro paths; visual spot-check heroes.

---

### P1: Balanced brand flourishes ⭐ MVP

**User Story**: As a user, I want restrained BrandBook atmosphere (wave/grafismo, soft motion of color) without cluttering scheduling work.

**Why P1**: User requested fuller pass at Balanced intensity.

**Acceptance Criteria**:

1. WHEN the auth / signed-out entry surface renders THEN it SHALL include a soft BrandBook blue **gradient** (not a flat neutral-only screen).
2. WHEN major empty states render (e.g. no assignments / no events) THEN they SHALL include a **grafismo** support graphic that does not replace or outrank the Logo 1 wordmark where the logo also appears.
3. WHEN the church-role sidebar renders THEN it MAY show a **subtle** grafismo watermark (low opacity, non-interactive, does not reduce nav contrast below AA).
4. WHEN frosted/sticky top-bar chrome already uses blur THEN it MAY keep/tune **glass** styling; WHEN rendering cards, tables, or roster rows THEN they SHALL **not** use glassmorphism fills.
5. WHEN grafismos appear THEN they SHALL come from BrandBook assets committed in-repo (not hand-drawn approximations of the logo).

**Independent Test**: Auth screen + empty dashboard + sidebar screenshot/review; no glass on `AssignmentCard` / roster tables.

---

### P1: Docs & ADR amendment ⭐ MVP

**User Story**: As an agent/human maintainer, I want ADR 0006 and design docs to cite official BrandBook values so future work does not reintroduce provisional tokens.

**Acceptance Criteria**:

1. WHEN this feature ships THEN ADR 0006 SHALL be amended (or superseded note added) with official hex table, Logo 1 PNG rule, Balanced flourish rules, and SF Pro exclusion.
2. WHEN `DESIGN_SYSTEM.md` / theme docs mention provisional `#2034D6` / `#FAFAFA` as current THEN they SHALL be updated to official values.
3. WHEN #175 cutover starts THEN this feature’s tokens/logo SHALL already be on `main` (or the cutover branch must include them).

**Independent Test**: Diff ADR + docs; #175 checklist references this feature.

---

### P2: Dark mode brand retune

**User Story**: As a user with dark preference, I want dark theme not to clash with the new light BrandBook.

**Acceptance Criteria**:

1. WHEN `.dark` is active THEN primary/accent SHALL remain in the BrandBook blue family (not provisional leftover hues).
2. WHEN contrast is checked on dark surfaces THEN text/icons SHALL meet WCAG 2.2 AA for critical chrome.

**Independent Test**: Toggle dark; spot-check shell + primary button.

---

## Edge Cases

- WHEN logo PNG fails to load THEN shell SHALL show accessible text fallback **`igreja onda`** (not “Onda”) plus broken-image affordance — still prefer fixing assets in CI.
- WHEN sidebar is collapsed THEN logo treatment SHALL remain recognizable (icon crop or compact mark — Design chooses without inventing a new logo).
- WHEN grafismo watermark sits under nav THEN hit targets and focus rings SHALL remain fully usable.
- WHEN printing pages THEN decorative grafismos/gradients MAY hide (`print` CSS) while content stays readable.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| BB-TOK-01 | P1: Official design tokens | T02 | ✅ Verified |
| BB-LOGO-01 | P1: Official Logo 1 wordmark | T01, T04, T05 | ✅ Verified |
| BB-TYPE-01 | P1: Typography product-safe | T02, T09 | ✅ Verified |
| BB-FLR-01 | P1: Balanced flourishes | T01, T06–T08 | ✅ Verified |
| BB-DOC-01 | P1: Docs & ADR | T09 | ✅ Verified |
| BB-DARK-01 | P2: Dark mode retune | T03 | ✅ Verified |

**Coverage:** 6 total, 6 mapped to tasks, 0 unmapped ✅

---

## Implicit-requirement dimensions

| Dimension | Resolution |
|-----------|------------|
| Input validation & bounds | N/A — no new user inputs |
| Failure / partial-failure | Logo load fallback (edge case); assets must exist in CI |
| Idempotency / retry | N/A |
| Auth boundaries | Auth **visual** only; no auth logic change |
| Concurrency | N/A |
| Data lifecycle | Brand assets versioned in git; no TTL |
| Observability | N/A |
| External-dependency failure | N/A (local assets) |
| State-transition integrity | N/A |

Remaining dimensions N/A for this visual scope.

---

## Success Criteria

- [x] Theme contract tests lock `#eeeee7` + `#2537de` / `#1f2bc8` (or documented oklch equivalents).
- [x] Shell behavior tests expect Logo 1 / `igreja onda`, not sole “Onda” text mark.
- [x] No SF Pro files under `apps/web-onda`.
- [x] Auth + empty states show Balanced flourishes; cards/tables stay non-glass.
- [x] ADR 0006 amended; #175 unblocked (merged to `main`).
