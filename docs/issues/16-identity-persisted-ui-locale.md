# 16 — Identity-persisted UI locale

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/web-client-design-system-shell-i18n.md` (story **3**); `CONTEXT.md` (**Default UI language**, **Language switcher**); ADR **0001**

## Parent

- Web PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Persist **Language switcher** choice on **Identity** (or an agreed **Volunteer** preference field) so locale survives visits without relying only on client storage. API read/write for the preference; web **i18n** controller loads server preference on sign-in and falls back to client persistence only when absent. **`pt-BR`** remains default for users with no saved preference.

## Acceptance criteria

- [ ] Authenticated user can save **`pt-BR`** or **`en`**; preference round-trips through the API.
- [ ] Cold load after sign-in applies stored preference before first paint where feasible (document any acceptable flash).
- [ ] Locale change does not mutate **UTC** scheduling records.
- [ ] Automated tests cover API persistence and controller boundary with a test double.

## Blocked by

None — can start immediately (requires auth slice **07** complete).

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/6
