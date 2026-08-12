# 186 — Replace demo campuses with Onda Dura regional churches

**Type:** Feature (Organization / demo seed)  
**Status:** Execute  
**TLC:** `.specs/features/186-onda-dura-regional-campuses/` (CAMPUS-01..04)  
**Supersedes:** PR [#179](https://github.com/kairan/onda-volunteer/pull/179)

## Problem

Seed and Playwright fixtures still use fictional `Igreja Central` / `Comunidade Norte`. PR #179 went stale after the #175 cutover (`apps/web` / `apps/web-next` removed). Public campus list now includes **Hamamatsu (Japão)**.

## What to build

- API seed catalog: Onda Brasil (18), Onda USA (2), Onda Europa (4), Onda Japão (1)
- Keep `seed-church-demo` / `seed-church-norte` ids
- Delete obsolete fake campuses on re-seed
- web-onda e2e: `Onda Brasil` + `seed-campus-joinville`
- Serve-well campus picker grouped by region

## Acceptance criteria

- [ ] Catalog unit test matches ondadura.com.br/campus (verified 2026-08-12)
- [ ] Seed upserts regional churches; demo event/assignment stay on Onda Brasil
- [ ] web-onda smoke mocks/fixtures use Joinville
- [ ] Serve-well lists Hamamatsu under Onda Japão
