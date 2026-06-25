# Coverage baseline (2026-06-11)

Recorded from local `pnpm test:coverage` after fixing API `jest-e2e.json` `rootDir` (#128 prerequisite).

| Package | Lines | Statements | Branches | Functions | Enforced floor |
|---------|------:|-----------:|---------:|----------:|---------------:|
| **API** (Jest e2e) | 86.0% | 86.5% | 64.3% | 89.3% | 85 / 85 / 63 / 88 |
| **Web** (Vitest) | 62.4% | 61.6% | 50.7% | 62.8% | 61 / 60 / 49 / 61 |
| **Web-next** (Vitest) | 64.2% | 64.4% | 53.5% | 60.6% | 61 / 60 / 49 / 60 |

Web-next floors use #129 targets with a 1pp functions ratchet (new surface, 2026-06-25). Stubs and e2e-only modules are excluded in `apps/web-next/vitest.config.ts`.

Floors are baseline minus ~1–2 percentage points. Re-baseline when adding large untested surface area.
