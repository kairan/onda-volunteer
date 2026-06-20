# 135 — Web i18n: align copy with ubiquitous language glossary

**Type:** AFK  
**Status:** Shipped (validated 2026-06-18, PR [#138](https://github.com/kairan/onda-volunteer/pull/138))  
**TLC:** `.specs/features/ubiquitous-language-drift/` (I18N-01)

## Parent

- TLC feature: `.specs/features/ubiquitous-language-drift/spec.md` (I18N-01)

## What was built

Copy-only alignment: pt-BR **Time away** nav (no `Tempo livre`), **System Admin** dev persona labels, System Admin nav without "roles" for permission levels, pt-BR **indisponibilidade** consistency, removed duplicate `churchSettings` in `ministries.json`, minor string cleanups.

## Acceptance criteria

- [x] pt-BR **Time away** nav/title avoids "free time" connotation.
- [x] Dev persona: **System Admin** (en + pt-BR).
- [x] System Admin Users link avoids "roles" for permission levels.
- [x] pt-BR ministry structure uses **indisponibilidade** consistently.
- [x] Single `churchSettings` block per locale file.
- [x] Web tests updated for changed asserted strings.

## Specification links

- Spec: `.specs/features/ubiquitous-language-drift/spec.md`
- Tasks: `.specs/features/ubiquitous-language-drift/tasks.md`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/135
