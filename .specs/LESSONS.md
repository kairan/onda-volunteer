# LESSONS — auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Specify/Design)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation — do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 — API e2e for new response fields must assert the field on GET detail, not only on PATCH or client mocks.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `apps/api/test` · harmful: 0
- features: role-slot-capacity-per-event
- evidence: SCHED-SLOT-01 AC5 — no GET /events/:id roleCapacities assertion (apps/api/test)
- last seen: 2026-06-30T15:45:09Z

### L-002 — When busy/disabled state keys on a composite id, add a behavior test that mutating one slot does not busy siblings.
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `apps/web-next` · harmful: 0
- features: role-slot-capacity-per-event
- evidence: SCHED-SLOT-03 AC5 — no busyRoleKey per-slot behavior test (apps/web-next)
- last seen: 2026-06-30T15:45:09Z

### L-003 — New i18n keys in en and pt-BR need at least one behavior test per locale for user-visible copy.
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `apps/web-next/src/i18n` · harmful: 0
- features: role-slot-capacity-per-event
- evidence: SCHED-SLOT-04 AC3 — pt-BR scheduling strings untested (apps/web-next/src/i18n)
- last seen: 2026-06-30T15:45:09Z

## Quarantined (failed when applied — ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
