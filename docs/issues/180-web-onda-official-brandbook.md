# 180 — web-onda: official BrandBook 2027 alignment

**Type:** Feature  
**Status:** Ready for agent  
**TLC:** `.specs/features/official-brandbook-web-onda/`  
**Blocks:** [#175](https://github.com/kairan/onda-volunteer/issues/175) cutover  
**GitHub:** https://github.com/kairan/onda-volunteer/issues/180

## Problem

`apps/web-onda` still uses provisional ADR 0006 tokens (`#2034D6`, `#FAFAFA`) and a typed “Onda” wordmark. Official Brandbook 2027 is available; cutover must not ship provisional chrome.

## What to build

Tasks **T01–T09** in `.specs/features/official-brandbook-web-onda/tasks.md`:

1. Vendor Logo 1 + grafismo PNGs  
2. Light token remap + theme contract  
3. Dark retune  
4–5. `IgrejaOndaWordmark` + shell wiring  
6–8. Balanced flourishes (auth gradient, empty grafismo, sidebar watermark)  
9. Amend ADR 0006 + docs  

## Acceptance criteria

- [ ] BB-TOK-01 — `#eeeee7` background; `#2537de` / `#1f2bc8` primary; contract tests updated  
- [ ] BB-LOGO-01 — Logo 1 PNG `igreja onda` in church + system-admin shells  
- [ ] BB-TYPE-01 — Space Grotesk for UI; no SF Pro in package  
- [ ] BB-FLR-01 — Balanced auth/empty/sidebar flourishes; no glass on cards/tables  
- [ ] BB-DOC-01 — ADR 0006 amended  
- [ ] BB-DARK-01 — dark theme blue family retuned  

## Tracker

Label: `ready-for-agent`
