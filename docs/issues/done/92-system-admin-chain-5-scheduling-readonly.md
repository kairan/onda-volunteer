# 92 — System Admin chain 5: read-only scheduling (P5)

**Type:** Feature  
**Label:** `ready-for-agent`  
**Blocked by:** #88  
**TLC:** `.specs/archive/features/system-admin-platform/`

## What to build

Cross-church scheduling **GET** bypass; all scheduling writes return `SYSTEM_ADMIN_READ_ONLY`; operator read UI.

## Tasks

T-SYS-24–26

## Acceptance criteria

- [ ] System Admin lists/views events across churches
- [ ] POST assign (and other writes) rejected for system admin
- [ ] Web scheduling support view has no write actions

## Parallel with (after #88)

#89, #90, #91, #93

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/92
