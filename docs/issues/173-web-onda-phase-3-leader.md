# 173 — web-onda Phase 3: Leader vertical slice (T11–T13)

**Type:** Feature  
**Status:** Blocked by [#172](https://github.com/kairan/onda-volunteer/issues/172)  
**TLC:** `.specs/features/frontend-restart-serve-well-base/` (RST-LEAD-01)  
**Parent:** [#170](https://github.com/kairan/onda-volunteer/issues/170)

## Problem

Leaders need live scheduling hub, event detail, create flows, and volunteer time-away review — serve-well `MinistryLeaderDashboard` presentation with web-next data layer.

## What to build

- **T11** — Leader `/scheduling`: serve-well `MinistryLeaderDashboard`; `leaderEventsQuery`, assign/release
- **T12** — Event detail + new event + new private event routes (serve-well tokens on forms)
- **T13** — `/leader/volunteer-time-away` functional port

**Reuses:** serve-well `MinistryLeaderDashboard.tsx`; web-next leader scheduling + event routes

## Acceptance criteria

- [ ] **T11** — Leader scheduling hub with roster rows / assign-release
- [ ] **T12** — Event detail open; assign/release; create public + private events
- [ ] **T13** — Leader volunteer time-away behavior test passes

### Done when (slice gates)

- [ ] RST-LEAD-01 met
- [ ] Leader behavior tests + Playwright smoke path green
- [ ] Revisit `roster` nav dedupe if serve-well needs distinct Roster link (Phase 3 note from PR #171 review)

## Out of scope

- Org-admin ([#174](https://github.com/kairan/onda-volunteer/issues/174))
- Per-event role slot capacity ([#165](https://github.com/kairan/onda-volunteer/issues/165)) — orthogonal; may integrate after roster UI lands

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/173
