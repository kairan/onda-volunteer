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
```

Example `apps/api/.env` (add/update):

```env
SUPABASE_JWT_SECRET=your-jwt-secret-from-dashboard
AUTH_ALLOW_DEV_HEADERS=true
```

Restart `pnpm dev:api` and `pnpm dev:web` after changing env.

## 4. Sign in on the web

1. Open [http://localhost:5173](http://localhost:5173).
2. Use the **Sign in (Supabase)** panel → enter email → **Send code** → paste the code from email → **Verify code**.
3. When signed in, the panel shows your **auth subject** (UUID). Copy it.

## 5. Link auth subject → demo Volunteer

The API maps JWT `sub` to `Volunteer.authSubjectId`. Link your Supabase user to the seeded demo volunteer:

```bash
pnpm link:volunteer-auth -- <your-auth-subject-uuid>
```

Default volunteer id is `seed-volunteer-demo` (also a **Leader** for `seed-ministry-demo` after seed).

## 6. Try JWT-protected actions

With a session active, the web sends `Authorization: Bearer <token>` instead of dev headers (when `VITE_AUTH_USE_DEV_HEADERS` is not `false`).

On the demo event page you can **Create assignment**, **Release**, etc. using real auth.

To test API-only:

```bash
# After sign-in, copy access_token from browser devtools → Application → localStorage
# key like sb-<project>-auth-token, or use the Auth panel subject + link script first.

curl -X POST http://localhost:3000/assignments/<id>/release \
  -H "Authorization: Bearer <access_token>"
```

## Grant Admin stewardship (optional)

To test **Admin** (not **Leader**) creating assignments: add an `AdminAccreditation` row for the volunteer and the event’s church, or extend seed. JWT identity must still match `Volunteer.authSubjectId`.

## Optional: turn off dev headers

When JWT flow works end-to-end:

- API: `AUTH_ALLOW_DEV_HEADERS=false`
- Web: `VITE_AUTH_USE_DEV_HEADERS=false`

Then every protected call **requires** a valid Bearer token.

## Failure modes

| Symptom | Fix |
|--------|-----|
| Yellow “Supabase not configured” on web | Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, restart Vite |
| `AUTH_MISCONFIGURED` / `AUTH_INVALID` | `SUPABASE_JWT_SECRET` must match the **same** Supabase project as the web anon key |
| `PROFILE_NOT_LINKED` | Run `pnpm link:volunteer-auth -- <sub>` |
| `LEADER_NOT_AUTHORIZED` | Seed creates leadership for demo volunteer; re-run `pnpm --filter @onda/api prisma:seed` or add `MinistryLeader` row |
| No email received | Check spam; confirm Email provider enabled; free tier rate limits apply |

## Alternative: full local Supabase stack

If you prefer everything local (Postgres + Auth + Inbucket mail catcher):

```bash
brew install supabase/tap/supabase
supabase init   # in repo root, if you add config later
supabase start
```

That uses different ports and `DATABASE_URL` than `docker compose`. This repo’s default path is **Docker Postgres + hosted Supabase Auth** unless you explicitly migrate.
