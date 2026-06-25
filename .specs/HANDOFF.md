# Session handoff (2026-06-25)

## Completed this session

1. **T30a legacy rename** — `apps/web` → `apps/web-legacy`, `@onda/web` → `@onda/web-legacy`; root scripts and CI jobs renamed; `apps/web-next` unchanged. Branch: `chore/rename-web-to-web-legacy`.
2. **TLC sync** — `tasks.md` T30a added + checked; `spec.md`, `design.md`, `context.md`, `STATE.md`, issue doc `148-*`, `docs/issues/README.md` updated.
3. **GitHub #148** — issue body updated with T30a status.

## Validate

- [x] `pnpm typecheck:web-legacy` — pass
- [x] `pnpm --filter @onda/web-legacy test` — 144 tests green
- [x] `pnpm --filter @onda/web-legacy build` — pass
- [x] `pnpm lint` — pass

## Next agent action

1. **Open PR** for `chore/rename-web-to-web-legacy` (T30a).
2. **After merge:** update branch protection required checks (`typecheck-web-legacy`, `playwright-web-legacy`) per `docs/runbooks/github-branch-protection.md`.
3. Continue **[#148](https://github.com/kairan/onda-volunteer/issues/148)** — T27 remainder (web-next coverage floors), then T29 deploy repoint, then T30 final cutover (`web-next`→`web`, retire `web-legacy`).

## Blockers

None.

## HITL

T13.5 visual sign-off rows in `.specs/features/frontend-migration-web-next/hitl-signoff.md` remain open for human brand review; do not block #148 Execute.
