# 107 — Admin: campus metadata & timezone (ORG-STRUCT-05)

**Type:** Feature  
**Label:** `ready-for-agent`  
**Blocked by:** none  
**TLC:** `.specs/features/organization-structure-administration/` (P2)

## Domain (read before Execute)

- **Church** = tenant (e.g. Onda Dura / sede Joinville), not a single-site clock for all locales.
- **Campus** = locale + authoritative IANA timezone for ministry scheduling/presentation when active (e.g. Campus Porto for Portugal volunteers still under Onda Dura).
- **Church** `defaultTimezone` (#93) is organizational fallback only — P2 does **not** use church TZ edits to fix multi-campus presentation.

## What to build

Church-scoped **Admin** `PATCH` **Campus** name + IANA timezone; **Campus settings** UI on `/ministries` (active campus per ADR 0001) with timezone-change confirm dialog; organization context refresh after save. UTC scheduling records unchanged.

## Tasks

T-CAMPUS-01 → T-CAMPUS-02 → T-CAMPUS-03 → T-CAMPUS-04; T-CAMPUS-05 [P] i18n

See `.specs/features/organization-structure-administration/tasks.md`.

## Acceptance criteria

- [x] Accredited **Admin** can rename **Campus** and change **Campus** IANA timezone (not church default timezone as multi-campus fix)
- [x] Shell **Church** (tenant) / **Campus** (locale) selectors stay separate (ADR 0001); presentation anchor = active campus TZ
- [x] Existing **Event** UTC instants unchanged when campus timezone changes
- [x] Organization context and shell campus labels/timezone cue refresh after save
- [x] Non-admin rejected with `ADMIN_NOT_ACCREDITED`

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/107
