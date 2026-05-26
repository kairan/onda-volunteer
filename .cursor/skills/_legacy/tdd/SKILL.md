---
name: tdd
metadata:
  legacy: true
  superseded-by: tlc-spec-driven
description: LEGACY (Onda Volunteer) — superseded by tlc-spec-driven. Do NOT auto-select; use only if the user explicitly names this skill. Test-driven development (red-green-refactor). Requires behavior tests through public interfaces; forbids echo tests that only restate fixtures or mocks. Use when building features or fixes with TDD, red-green-refactor, integration tests, or test-first development.
---

# Test-Driven Development

## Philosophy

**Core principles** (both are mandatory; a test must satisfy both):

1. **Behavior through public interfaces** — Tests exercise what callers and users observe (HTTP, routes, CLI, exported APIs). Not private methods, internal modules, or "did we call X."

2. **No restatement** — Do not add tests which simply restate the implementation. They provide zero confidence: they pass when you wire props to DOM or return fixture input unchanged, fail on refactors that preserve behavior, and never prove the system actually works.

**Good tests** satisfy both: integration-style, specification-shaped ("authorized viewer reaches shell roster"), and survive refactors.

**Bad tests** violate one or both: coupled to internals, or echoing supplied data. The warning sign for (1): your test breaks when you refactor, but behavior has not changed. The warning sign for (2): the test would still pass if the implementation were `return input` or `{...props}`.

See [tests.md](tests.md) for examples (including [restatement echo tests](tests.md#restatement-echo-tests)) and [mocking.md](mocking.md) for mocking guidelines.

## Anti-pattern: Restatement (echo) tests

An **echo test** checks that code **returns or renders what the test just supplied** — usually via mocks, fixtures, or shallow renders. It does not prove a capability.

**Litmus questions** (if any answer is yes, delete or rewrite the test):

- Would this test still pass if the implementation were `return input` / `{...props}`?
- Is the assertion only "this string from my fixture appears on screen"?
- Am I testing CSS class names, column labels, or i18n keys I chose in the test?
- Does a mock define the entire outcome, and the test only verify the mock was passed through?

**Common echoes** (rewrite or move up a layer):

| Echo | Better |
|------|--------|
| Render `<View data={fixture} />`, assert `fixture.title` visible | Route/API test: real loader + one observable outcome |
| `mockLoader.mockResolvedValue({ assignments: [{ name: 'Sam' }] })`, assert `Sam` | Integration: seeded API + user sees assignment |
| Assert empty-state copy when `assignments: []` in fixture | E2E with real empty API response, or omit (trivial branch) |
| `expect(loader).toHaveBeenCalledWith({ params })` | User-visible result of that navigation (URL, heading) |

**Where each layer earns its place:**

- **Unit**: routing contracts, pure domain rules, error mapping with wrong input → wrong user message.
- **Integration / e2e**: authorization, visibility, cross-module paths — use real stack or realistic boundaries.
- **Component-only**: only when the component encodes non-trivial logic (formatting, selection rules). If it is mostly layout, do not unit-test it.

## Anti-pattern: Horizontal slices

**DO NOT write all tests first, then all implementation.** This is "horizontal slicing" - treating RED as "write all tests" and GREEN as "write all code."

This produces **crap tests**:

- Tests written in bulk test _imagined_ behavior, not _actual_ behavior
- You end up testing the _shape_ of things (data structures, function signatures) rather than user-facing behavior
- Tests become insensitive to real changes - they pass when behavior breaks, fail when behavior is fine
- You outrun your headlights, committing to test structure before understanding the implementation

**Correct approach**: Vertical slices via tracer bullets. One test → one implementation → repeat. Each test responds to what you learned from the previous cycle. Because you just wrote the code, you know exactly what behavior matters and how to verify it.

```
WRONG (horizontal):
  RED:   test1, test2, test3, test4, test5
  GREEN: impl1, impl2, impl3, impl4, impl5

RIGHT (vertical):
  RED→GREEN: test1→impl1
  RED→GREEN: test2→impl2
  RED→GREEN: test3→impl3
  ...
```

## Workflow

### 1. Planning

When exploring the codebase, use the project's domain glossary so that test names and interface vocabulary match the project's language, and respect ADRs in the area you're touching.

Before writing any code:

- [ ] Confirm with user what interface changes are needed
- [ ] Confirm with user which behaviors to test (prioritize)
- [ ] Identify opportunities for [deep modules](deep-modules.md) (small interface, deep implementation)
- [ ] Design interfaces for [testability](interface-design.md)
- [ ] List the behaviors to test (not implementation steps)
- [ ] Each planned test answers: "What user/caller capability fails if we remove the feature?"
- [ ] No planned test only asserts fixture/mock data round-trips
- [ ] Get user approval on the plan

Ask: "What should the public interface look like? Which behaviors are most important to test?"

**You can't test everything.** Confirm with the user exactly which behaviors matter most. Focus testing effort on critical paths and complex logic, not every possible edge case.

### 2. Tracer bullet

Write ONE test that confirms ONE thing about the system:

```
RED:   Write test for first behavior → test fails
GREEN: Write minimal code to pass → test passes
```

This is your tracer bullet - proves the path works end-to-end.

Before GREEN: name the capability in one sentence. If the test name is "renders X" and X only exists in the fixture, rewrite. Prefer the narrowest layer that still uses a real boundary (route > isolated component).

### 3. Incremental loop

For each remaining behavior:

```
RED:   Write next test → fails
GREEN: Minimal code to pass → passes
```

Rules:

- One test at a time
- Only enough code to pass current test
- Don't anticipate future tests
- Keep tests focused on observable behavior
- Apply the [echo litmus](#anti-pattern-restatement-echo-tests) before committing each test

### 4. Refactor

After all tests pass, look for [refactor candidates](refactoring.md):

- [ ] Extract duplication
- [ ] Deepen modules (move complexity behind simple interfaces)
- [ ] Apply SOLID principles where natural
- [ ] Consider what new code reveals about existing code
- [ ] Delete or upgrade any echo tests introduced while chasing GREEN
- [ ] Run tests after each refactor step

**Never refactor while RED.** Get to GREEN first.

## Checklist per cycle

```
[ ] Test describes behavior, not implementation
[ ] Test uses public interface only
[ ] Test would survive internal refactor
[ ] Test would fail if behavior broke in a way users care about (not merely renamed)
[ ] Test is not an echo of fixture/mock input
[ ] Code is minimal for this test
[ ] No speculative features added
```
