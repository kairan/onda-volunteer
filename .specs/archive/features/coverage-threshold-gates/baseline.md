# Coverage baseline (2026-06-11)

Recorded from local `pnpm test:coverage` after fixing API `jest-e2e.json` `rootDir` (#128 prerequisite).

| Package | Lines | Statements | Branches | Functions | Enforced floor |
|---------|------:|-----------:|---------:|----------:|---------------:|
| **API** (Jest e2e) | 86.0% | 86.5% | 64.3% | 89.3% | 85 / 85 / 63 / 88 |
| **Web** (Vitest) | 62.4% | 61.6% | 50.7% | 62.8% | 61 / 60 / 49 / 61 |

Floors are baseline minus ~1–2 percentage points. Re-baseline when adding large untested surface area.
