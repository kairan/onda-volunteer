# 180 — web-onda: official BrandBook 2027 alignment

**Type:** Feature  
**Status:** Shipped  
**PR:** [#182](https://github.com/kairan/onda-volunteer/pull/182) (merged 2026-07-17)  
**TLC:** `.specs/archive/features/official-brandbook-web-onda/`  
**Unblocks:** [#175](https://github.com/kairan/onda-volunteer/issues/175) cutover  
**GitHub:** https://github.com/kairan/onda-volunteer/issues/180

## What was built

Official Brandbook 2027 alignment for `apps/web-onda` (T01–T09):

- Light/dark theme tokens (`#eeeee7`, `#2537de` / `#1f2bc8`) + contract tests
- Logo 1 PNG wordmark `igreja onda` in church + system-admin shells
- Balanced flourishes: auth gradient, empty-state grafismo, sidebar watermark
- ADR 0006 amended; SF Pro = print/marketing only

**Validation:** `.specs/archive/features/official-brandbook-web-onda/validation.md` (PASS — 24/24 ACs)

## Acceptance criteria

- [x] BB-TOK-01 — `#eeeee7` background; `#2537de` / `#1f2bc8` primary; contract tests updated  
- [x] BB-LOGO-01 — Logo 1 PNG `igreja onda` in church + system-admin shells  
- [x] BB-TYPE-01 — Space Grotesk for UI; no SF Pro in package  
- [x] BB-FLR-01 — Balanced auth/empty/sidebar flourishes; no glass on cards/tables  
- [x] BB-DOC-01 — ADR 0006 amended  
- [x] BB-DARK-01 — dark theme blue family retuned  

## Next

- [#175](https://github.com/kairan/onda-volunteer/issues/175) — Phase 5 Cutover (T17) — unblocked

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/180 (closed)
