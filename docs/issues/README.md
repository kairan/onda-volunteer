# Backlog: vertical slices (tracer bullets)

Parent product definition: `docs/prd/volunteer-management-platform.md`  
Domain glossary: `CONTEXT.md`

Completed slices are kept under **`done/`** for history. Work remaining issues **in dependency order**. Each issue is a **vertical slice** (Prisma → Nest → TanStack Router → automated tests) **unless** the row is a **web-client-only** slice (**`09`–`14`**), where the stack is **tooling → theme → components → routes → automated tests** with **no API/schema change** unless explicitly stated in that slice.

| Order | File | Type | Summary |
|------:|------|------|---------|
| 1 | `done/01-read-path-event-detail.md` | Done | Read **Event** through API + Router |
| 2 | `done/02-leader-first-assignment-public-event.md` | Done | First **Assignment** create path |
| 3 | `done/03-unavailability-blocks-assign.md` | Done | **Unavailability** blocks assign |
| 4 | `done/04-cross-ministry-double-booking-rejected.md` | Done | Cross-**Ministry** overlap rejected |
| 5 | `done/05-membership-deactivate-void-future-assignments.md` | Done | Membership voiding |
| 6 | `done/06-volunteer-release-assignment-optional-unavailability.md` | Done | **Volunteer** release + optional offer |
| 7 | `done/07-supabase-auth-identity-mapping.md` | Done | **Supabase** auth + **Identity** mapping |
| 8 | `08-web-client-design-system-shell-i18n.md` | Epic | Web client epic — implement via **`09`–`14`** only |
| 9 | `done/09-web-client-design-foundation.md` | Done | Tailwind + shadcn + tokens + fonts + icon facade |
| 10 | `done/10-web-client-i18n-controller.md` | Done | **`react-i18next`**, namespaces, **`pt-BR`/`en`**, switcher |
| 11 | `done/11-web-client-shell-routing-landmarks.md` | Done | Shell layout, skip link, **`/dashboard`**, preserve **`/`** + **events** |
| 12 | `done/12-web-client-nav-placeholder-routes.md` | Done | Nav manifest + placeholder routes + empty states |
| 13 | `done/13-web-client-church-campus-context.md` | Done | **Church**/**Campus** switchers + timezone cue |
| 14 | `done/14-web-client-feedback-overlays-patterns-print.md` | Done | Toasts, errors, overlays, patterns, print (HITL signed off) |

When you create tickets in your tracker, paste each issue body and apply **`ready-for-agent`** when that issue’s **Blocked by** dependencies are cleared (see each slice file).
