# Issue: Guard path — cross-**Ministry** double-booking rejected (surfaced in UI)

## Parent

`docs/prd/volunteer-management-platform.md`

## Type

AFK

## What to build

Prove cross-**Ministry** protection for the same **Volunteer** on overlapping **Assignment** intervals (still within the multi-**Church** canonical **UTC** timeline model), end-to-end: two **Ministries** under the same **Church** (or otherwise consistent with your tenancy model), conflicting intervals rejected by **Scheduling**, and the UI displays the failure.

This slice must remain separate from **Unavailability** blocking (slice 3) so PRs stay focused and failures are easier to debug.

## Acceptance criteria

- [ ] Fixture data can represent two **Ministries** rostering the same **Volunteer** onto overlapping windows.
- [ ] Second assign attempt fails with a stable domain error code carried through HTTP.
- [ ] UI surfaces the conflict clearly.
- [ ] Automated tests cover the overlap rejection using **UTC** instants and **half-open** semantics per `CONTEXT.md`.

## Blocked by

`docs/issues/02-leader-first-assignment-public-event.md`
