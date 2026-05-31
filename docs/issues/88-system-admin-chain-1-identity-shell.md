# 88 — System Admin chain 1: identity + operator shell (P1)

**Type:** Feature  
**Label:** `ready-for-agent`  
**Blocked by:** #87 (recommended)  
**TLC:** `.specs/features/system-admin-platform/`  
**Parallel plan:** [parallel-execution.md](../.specs/features/system-admin-platform/parallel-execution.md)

## What to build

`SystemAdministrator` model (seed-only), auth context guards, `identity/me.isSystemAdmin`, `/system-admin` web shell.

## Tasks

T-SYS-04–10 (T-SYS-10 web parallel after T-SYS-07)

## Acceptance criteria

- [ ] Seeded system admin passes operator routes; demo volunteer denied
- [ ] `GET /identity/me` includes `isSystemAdmin`
- [ ] Web guard redirects non-operators

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/88
