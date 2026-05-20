#!/usr/bin/env bash
# Starts the API for Playwright browser e2e (migrate + seed + listen on :3000).
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root/apps/api"

export AUTH_ALLOW_DEV_HEADERS="${AUTH_ALLOW_DEV_HEADERS:-true}"
export DATABASE_URL="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/onda?schema=public}"
export WEB_ORIGIN="${WEB_ORIGIN:-http://localhost:5173}"
export SUPABASE_JWT_SECRET="${SUPABASE_JWT_SECRET:-playwright-ci-placeholder}"

pnpm exec prisma migrate deploy
pnpm exec prisma db seed
cd "$root"
pnpm --filter @onda/api build
cd "$root/apps/api"
exec pnpm start
