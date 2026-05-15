# Supabase setup (local dev)

This app keeps **Postgres in Docker** (`docker compose`) for Prisma data. **Supabase** is used for **Auth only** (email OTP + JWT). That is the simplest setup: one database you already have, plus a free Supabase project for sign-in.

## 1. Create a Supabase project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. **New project** → pick a name and database password (the hosted DB is optional for this repo; we use local Postgres).
3. Wait until the project is ready.

## 2. Enable email sign-in

1. **Authentication** → **Providers** → **Email** → enable.
2. For quick testing you can leave “Confirm email” on; Supabase sends a 6-digit code (OTP) to your inbox.
3. **Authentication** → **URL configuration**:
   - **Site URL:** `http://localhost:5173`
   - **Redirect URLs:** add `http://localhost:5173/**`

## 3. Copy API keys into env files

**Project Settings** → **API**:

| Dashboard field | Env variable | File |
|-----------------|--------------|------|
| Project URL | `VITE_SUPABASE_URL` | `apps/web/.env` |
| **Legacy** `anon` `public` key (`eyJhbG…`) | `VITE_SUPABASE_ANON_KEY` | `apps/web/.env` |

Use the **Legacy anon, service_role API keys** tab. The new `sb_publishable_…` key often returns `Invalid API key` with current `@supabase/supabase-js` — do **not** use `sb_secret_…` in the browser.
| JWT Secret (under JWT Settings) | `SUPABASE_JWT_SECRET` | `apps/api/.env` |

Example `apps/web/.env` (add/update):

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_AUTH_USE_DEV_HEADERS=true
VITE_DEMO_VOLUNTEER_ID=seed-volunteer-demo
```

Example `apps/api/.env` (add/update):

```env
SUPABASE_JWT_SECRET=your-jwt-secret-from-dashboard
AUTH_ALLOW_DEV_HEADERS=true
AUTH_AUTO_LINK_SEED_VOLUNTEER_ID=seed-volunteer-demo
```

Restart `pnpm dev:api` and `pnpm dev:web` after changing env.

## 4. Happy path (shell routes)

1. Run migrations and seed: `pnpm --filter @onda/api prisma:migrate` and `pnpm --filter @onda/api prisma:seed`.
2. Open [http://localhost:5173/dashboard](http://localhost:5173/dashboard) (or any shell nav route).
3. Sign in with email OTP when prompted.
4. On first sign-in, `GET /identity/me` auto-links your Supabase `sub` to `seed-volunteer-demo` when `AUTH_AUTO_LINK_SEED_VOLUNTEER_ID` is set and that volunteer has no `authSubjectId` yet.
5. The shell loads **Church** / **Campus** context from the API using your Bearer token.

Legacy demo pages at `/` and `/events/...` still work; they may show the auth panel at the top without the shell gate.

## 5. Optional: manual link to a specific volunteer

If auto-link is disabled or the seed volunteer is already linked to someone else:

```bash
pnpm link:volunteer-auth -- <your-auth-subject-uuid>
```

Default volunteer id is `seed-volunteer-demo`.

## 6. Dev bypass (no Supabase)

If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are unset but `VITE_AUTH_USE_DEV_HEADERS=true` and `VITE_DEMO_VOLUNTEER_ID` are set, shell routes use `X-Volunteer-Id` without sign-in. The API must have `AUTH_ALLOW_DEV_HEADERS=true`.

## 7. Try JWT-protected actions on legacy demo pages

With a session active, protected calls send `Authorization: Bearer <token>` (dev headers only when there is no valid session).

## Optional: turn off dev headers

When JWT flow works end-to-end:

- API: `AUTH_ALLOW_DEV_HEADERS=false`
- Web: `VITE_AUTH_USE_DEV_HEADERS=false`

Then every protected call **requires** a valid Bearer token.

## Failure modes

| Symptom | Fix |
|--------|-----|
| Yellow “Supabase not configured” on web | Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, restart Vite |
| `AUTH_MISCONFIGURED` / `AUTH_INVALID` | `SUPABASE_JWT_SECRET` must match the **same** Supabase project as the web anon key; sign out or clear site localStorage for a stale session |
| `PROFILE_NOT_LINKED` on shell | Enable `AUTH_AUTO_LINK_SEED_VOLUNTEER_ID`, re-seed so demo volunteer has no `authSubjectId`, or run `pnpm link:volunteer-auth -- <sub>` |
| `LEADER_NOT_AUTHORIZED` | Seed creates leadership for demo volunteer; re-run `pnpm --filter @onda/api prisma:seed` |
| No email received | Check spam; confirm Email provider enabled; free tier rate limits apply |

## Alternative: full local Supabase stack

If you prefer everything local (Postgres + Auth + Inbucket mail catcher):

```bash
brew install supabase/tap/supabase
supabase init   # in repo root, if you add config later
supabase start
```

That uses different ports and `DATABASE_URL` than `docker compose`. This repo’s default path is **Docker Postgres + hosted Supabase Auth** unless you explicitly migrate.
