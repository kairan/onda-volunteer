# 173 — web-onda Phase 3: Leader vertical slice (T11–T13)

**Type:** Feature  
**Status:** Shipped (validated 2026-07-04)  
**TLC:** `.specs/features/frontend-restart-serve-well-base/` (RST-LEAD-01)  
**Parent:** [#170](https://github.com/kairan/onda-volunteer/issues/170) · **Unblocked by:** [#172](https://github.com/kairan/onda-volunteer/issues/172)

## What was built

Live leader vertical slice in `apps/web-onda`:

- **T11** — Leader `/scheduling`: serve-well `MinistryLeaderDashboard`; `leaderEventsQuery`, assign/release, `RosterByEventSection`
- **T12** — Event detail, new private event routes; assign/release on detail
- **T13** — `/leader/volunteer-time-away` functional port

Playwright API-backed smoke for leader paths. 1440px HITL sign-off 2026-07-04.

**PR:** [#177](https://github.com/kairan/onda-volunteer/pull/177)  
**Validation:** `.specs/features/frontend-restart-serve-well-base/validation.md` (Phase 3 section)

## Tasks

- [x] **T11** — Leader scheduling hub
- [x] **T12** — Event detail + private event create
- [x] **T13** — Leader volunteer time away

## Done when

- [x] RST-LEAD-01 met (automated + 1440px HITL)
- [x] Leader behavior tests + Playwright smoke green
- [x] CI green on PR #177

## Deferred (not blocking #173)

- Public event create at `/scheduling/events/new` — still placeholder (accredited-admin; was placeholder in `web-next`)
- Roster nav dedupe note from PR #171 review

## Next

- [#175](https://github.com/kairan/onda-volunteer/issues/175) — Phase 5 Cutover (T17) — unblocked after [#174](https://github.com/kairan/onda-volunteer/issues/174) (PR [#178](https://github.com/kairan/onda-volunteer/pull/178) merged)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/173
