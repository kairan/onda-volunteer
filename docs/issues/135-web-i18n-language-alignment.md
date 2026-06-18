# 135 — Web i18n: align copy with ubiquitous language glossary

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `CONTEXT.md`

## Parent

- TLC feature: `.specs/features/ubiquitous-language-drift/spec.md` (I18N-01)

## What to build

Copy-only alignment: pt-BR **Time away** nav (no `Tempo livre`), **System Admin** dev persona labels, System Admin nav without "roles" for permission levels, pt-BR **indisponibilidade** consistency, remove duplicate `churchSettings` in `ministries.json`, minor string cleanups.

## Acceptance criteria

- [ ] pt-BR **Time away** nav/title avoids "free time" connotation.
- [ ] Dev persona: **System Admin** (en + pt-BR).
- [ ] System Admin Users link avoids "roles" for permission levels.
- [ ] pt-BR ministry structure uses **indisponibilidade** consistently.
- [ ] Single `churchSettings` block per locale file.
- [ ] Web tests updated for changed asserted strings.

## Blocked by

None

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/135
