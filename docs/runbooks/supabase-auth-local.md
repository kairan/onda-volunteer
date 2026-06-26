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
| JWT Secret (under JWT Settings) | `SUPABASE_JWT_SECRET` | `apps/api/.env` |
| **Legacy** `service_role` `secret` key (`eyJhbG…`) | `SUPABASE_SERVICE_ROLE_KEY` | `apps/api/.env` only |

Use the **Legacy anon, service_role API keys** tab. The new `sb_publishable_…` key often returns `Invalid API key` with current `@supabase/supabase-js` — do **not** use `sb_secret_…` in the browser.

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
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
AUTH_ALLOW_DEV_HEADERS=true
AUTH_AUTO_LINK_SEED_VOLUNTEER_ID=seed-volunteer-demo
```

**`SUPABASE_SERVICE_ROLE_KEY`** (ADR [0005](../adr/0005-system-admin-operator-role.md)) — required for **System Admin** church **Admin** invites (`auth.admin.inviteUserByEmail`). Copy from **Project Settings → API → Legacy anon, service_role API keys → `service_role` `secret`**. **Never** commit or expose in the browser; API process only. When unset, invite endpoints fail or no-op per implementation; use dev-header operator flows for non-invite work.

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

## 7. Try JWT-protected actions in the shell

Event detail and roster flows live at **`/scheduling/events/$eventId`**. Legacy **`/events/$eventId`** redirects there (ADR 0004). The **`/`** demo landing remains for design preview only.

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
| `AUTH_MISCONFIGURED` / `AUTH_INVALID` | `SUPABASE_JWT_SECRET` must match **JWT Secret** under Project Settings → API for the **same** project as `VITE_SUPABASE_ANON_KEY`. Fix the `.env`, restart API, then Retry on the shell error screen (no new OTP). |
| `PROFILE_NOT_LINKED` on shell | Enable `AUTH_AUTO_LINK_SEED_VOLUNTEER_ID`, re-seed so demo volunteer has no `authSubjectId`, or run `pnpm link:volunteer-auth -- <sub>` |
| `LEADER_NOT_AUTHORIZED` | Seed creates leadership for demo volunteer; re-run `pnpm --filter @onda/api prisma:seed` |
| No email received | Check spam; confirm Email provider enabled; free tier rate limits apply |
| `email rate limit exceeded` | Supabase free tier caps auth emails/hour; wait ~1h or use **dev bypass** below without sending more OTPs |
| Volta para o login logo após OTP / “perdeu sessão” | Quase sempre **`SUPABASE_JWT_SECRET` diferente** do JWT Secret do projeto → a API responde `AUTH_INVALID`. O app **não** apaga mais a sessão do Supabase por isso; alinhe o segredo, reinicie `pnpm dev:api` e use **Tentar de novo** na tela de erro (sem novo e-mail). |
| `getUser` falha offline | A sessão continua no navegador (`getSession`); o estado de login usa o utilizador da sessão local. |

### Dev bypass when email limit is hit

With API running (`AUTH_ALLOW_DEV_HEADERS=true`) and in `apps/web/.env`:

```env
VITE_AUTH_USE_DEV_HEADERS=true
VITE_DEMO_VOLUNTEER_ID=seed-volunteer-demo
```

Open `/dashboard` **without** sending another OTP — the shell uses `X-Volunteer-Id` when there is no valid Supabase session.

## Alternative: full local Supabase stack

If you prefer everything local (Postgres + Auth + Inbucket mail catcher):

```bash
brew install supabase/tap/supabase
supabase init   # in repo root, if you add config later
supabase start
```

That uses different ports and `DATABASE_URL` than `docker compose`. This repo’s default path is **Docker Postgres + hosted Supabase Auth** unless you explicitly migrate.

## 8. System Admin operator and church Admin invites

Normative boundaries: ADR [0005](../adr/0005-system-admin-operator-role.md). Feature tasks: `.specs/archive/features/system-admin-platform/`.

### Seeded operator volunteer

After chain [#88](https://github.com/kairan/onda-volunteer/issues/88) (T-SYS-05), seed includes:

| Item | Value |
|------|--------|
| Volunteer id | `seed-volunteer-system-admin` |
| Grant | `SystemAdministrator` row (seed-only in v1) |

Re-run `pnpm --filter @onda/api prisma:seed` after pulling identity migrations.

### Dev headers (operator, no Supabase)

With `AUTH_ALLOW_DEV_HEADERS=true` on the API:

```env
# apps/web/.env — operator shell / e2e
VITE_DEMO_VOLUNTEER_ID=seed-volunteer-system-admin
```

Send `X-Volunteer-Id: seed-volunteer-system-admin` (or set web demo id as above). There is **no** header that elevates an arbitrary volunteer to **System Admin** — the volunteer id must match a seeded `SystemAdministrator` row.

### Invite redirect URLs

**Authentication → URL configuration** (same project as keys):

| Environment | Site URL | Redirect URLs (add) |
|-------------|----------|------------------------|
| Local | `http://localhost:5173` | `http://localhost:5173/**` |

**System Admin** invites use `redirectTo` **`http://localhost:5173/dashboard`** so new church **Admins** land in the normal shell after accepting Supabase email. Production: set the deployed web origin in Supabase and in API env (document prod URL when hosting).

### Happy path: invite church Admin (JWT)

Prerequisites: migrations + seed, `SUPABASE_SERVICE_ROLE_KEY` set, operator signed in as **System Admin** (JWT or dev header above).

1. **System Admin** creates a **Church** via `POST /system-admin/churches` (or operator UI).
2. **System Admin** submits `POST /system-admin/churches/:churchId/admin-invites` with `{ "email": "admin@example.com" }`.
3. API calls Supabase `inviteUserByEmail` and inserts `AdminInvite` with status `PENDING`.
4. Invitee completes Supabase sign-up / first sign-in from email.
5. On first authenticated request, **Identity** runs invite fulfillment: link **Volunteer** (create if needed), grant **Admin** accreditation for that **Church**, mark invite `FULFILLED`.
6. Invitee opens `/dashboard` — church **Admin** shell, **not** `/system-admin`.

Verify: `GET /identity/me` shows accreditation for target **Church**; operator `GET /system-admin/churches` lists the church.

### Invite failure modes

| Symptom | Fix |
|--------|-----|
| Invite API 503 / misconfigured | Set `SUPABASE_SERVICE_ROLE_KEY`; restart API |
| Redirect after invite lands on wrong host | Align Supabase **Redirect URLs** and API `redirectTo` with deployed web URL |
| `PROFILE_NOT_LINKED` after accept | Check JWT `email` claim; pending `AdminInvite` for that email; fulfillment runs on sign-in |
| Operator 403 `NOT_SYSTEM_ADMIN` | Seed `SystemAdministrator` for `seed-volunteer-system-admin`; correct `X-Volunteer-Id` / linked JWT volunteer |

### PII note (operator search)

**System Admin** volunteer search returns names and emails for support. Restrict operator grants in seed; do not log search payloads in production without a retention policy (see feature `design.md`).
