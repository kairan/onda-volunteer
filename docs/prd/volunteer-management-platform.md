# PRD: Volunteer management platform (multi-Church)

## Problem Statement

Churches need a dependable way to roster **Volunteers** across **Ministries** and **Events** without double-booking people, while respecting when someone is unavailable for a specific **Ministry**. The product must support **multiple Churches** (and optional **Campuses**) with accurate time handling across regions, clear permission boundaries for **Admin** and **Leader** stewardship, and reporting-friendly history when **Roles** or roster rows change over time.

## Solution

Deliver a web application backed by **NestJS** and **PostgreSQL (Supabase)**, with **Prisma** as the ORM and **Supabase Auth** for sign-in. The system models **Organization** (Churches, Campuses, Ministries, membership, leader delegation, Admin accreditation, **Role** catalogs), **Availability** (**Unavailability** per **Volunteer** per **Ministry**), and **Scheduling** (**Events**, **Assignments**, conflict rules). A **React (Vite)** client uses **TanStack Router** and **TanStack Query** for navigation and server-backed UI state, with routes that enforce authentication and load strongly typed domain payloads from the API.

## User Stories

1. As a **Volunteer**, I want to sign in with passwordless email, so that I can access my own schedule without shared passwords.
2. As a **Volunteer**, I want to see my upcoming **Assignments** in the correct local framing, so that I do not miss serves when I travel.
3. As a **Volunteer**, I want the schedule UI to default to the **Church** I am working in, so that times match the congregation I am viewing.
4. As a **Volunteer**, I want an optional personal-local presentation of times, so that I can sanity-check against my own timezone without changing canonical records.
5. As a **Volunteer**, I want to record **Unavailability** for a specific **Ministry**, so that I can still be rostered in other **Ministries** when appropriate.
6. As a **Volunteer**, I want a bulk action to mirror the same dates across all **Ministries** where I have membership, so that vacations do not require repetitive entry.
7. As a **Volunteer**, I want to decline or release an **Assignment**, so that I can correct mistaken rostering without calling the office.
8. As a **Volunteer**, after declining or releasing, I want to be offered (not forced) matching **Unavailability**, so that I am not immediately re-rostered for the same window by mistake.
9. As a **Volunteer**, I want to belong to multiple **Ministries**, so that I can serve in more than one team.
10. As a **Volunteer**, I want to belong to **Ministries** in more than one **Church** under one login, so that network-shaped serving is possible without duplicate accounts.
11. As a **Volunteer** on a **Pending** **Ministry membership**, I want to pre-enter **Unavailability**, so that onboarding does not block calendar truth.
12. As a **Volunteer** on a **Pending** membership, I want to understand I cannot be rostered until **Active**, so that expectations about “on the schedule” are clear.
13. As a **Leader**, I want to manage **Assignments** only for **Ministries** assigned to me, so that I cannot change other teams’ rosters.
14. As a **Leader**, I want to lead **Ministries** across multiple **Churches** when delegated, so that trusted coordinators can support more than one site.
15. As a **Leader**, I want to create **Private events** for my **Ministry**, so that rehearsals and internal work stay scoped to my team.
16. As a **Leader**, I want to assign **Volunteers** to **Public events** for my **Ministry’s** slots, so that Sunday-style services can combine many teams safely.
17. As a **Leader**, I want to add or edit **Unavailability** for **Volunteers** in **Ministries** I lead, so that pastoral coordination can happen quickly.
18. As a **Leader**, I want the **Role** catalog for my **Ministry** to be manageable without developer help, so that roster labels stay accurate.
19. As an **Admin** accredited for a **Church**, I want to create **Public events** for that **Church**, so that the worship calendar has a single source of truth.
20. As an **Admin**, I want stewardship limited to explicitly accredited **Churches**, so that cross-tenant mistakes are not possible by default.
21. As an **Admin**, I want to manage **Ministries**, delegate **Leaders**, and support **Volunteers** within my accredited scope, so that operations scale without super-user sprawl.
22. As an **Admin**, I want to retire a catalog **Role** without rewriting history, so that reports remain faithful to what actually happened.
23. As an **Admin**, I want cancelling an **Event** to void its **Assignments**, so that nobody remains rostered for a ghost occurrence.
24. As an **Admin**, I want membership lifecycle changes to void only future **Assignments** correctly, so that history remains intact while upcoming work stays accurate.
25. As a roster coordinator, I want overlap detection to use a single canonical timeline across **Churches**, so that conflicts are not missed at boundaries.
26. As a roster coordinator, I want half-open interval semantics, so that back-to-back serves are not falsely flagged as conflicts.
27. As a roster coordinator, I want **Assignments** to have explicit intervals within an **Event** window, so that partial serves are modeled accurately.
28. As a ministry member, I want **Private event** visibility scoped to my **Ministry** participants plus accredited **Admin**, so that internal work stays appropriately contained.
29. As a church participant, I want **Public event** visibility across coordinating **Ministries** within one **Church**, so that cross-team Sunday planning is possible.
30. As a product owner, I want **Public events** to remain single-**Church** for now, so that we do not prematurely design network-wide combined occurrences.
31. As a finance or compliance stakeholder, I want volunteer history preserved when **Roles** retire, so that audits and stories of service remain trustworthy.
32. As a volunteer coordinator, I want the system to block assignments during **Unavailability** for that **Ministry**, so that people are not scheduled when they said no for that team.
33. As a volunteer coordinator, I want cross-**Ministry** time conflicts blocked for the same **Volunteer**, so that nobody is double-booked across teams.
34. As a developer, I want a deep **Scheduling** module with a small public surface, so that validation rules stay centralized and testable.
35. As a developer, I want **Availability** to own **Unavailability** facts, so that **Scheduling** consumes a clear dependency rather than duplicating tables.
36. As a developer, I want Prisma schema reflecting the domain vocabulary, so that application code stays aligned with the glossary.
37. As a developer, I want a documented API contract for roster reads and assignment writes, so that the web app can evolve independently of UI details.
38. As a developer, I want a protected route pattern with typed loaders, so that navigation and data fetching remain safe as the model grows.
39. As a **System Admin**, I want a dedicated operator dashboard separate from the volunteer shell, so that platform onboarding does not mix with church day-to-day work.
40. As a **System Admin**, I want to create **Churches** and invite church **Admins** by email, so that new congregations onboard without database access.
41. As a **System Admin**, I want to find users and adjust **Organization** grants across **Churches**, so that support can fix accreditation and ministry delegation without SQL.
42. As a **System Admin**, I want read-only access to scheduling data across **Churches**, so that I can diagnose roster issues without mutating schedules.

## Implementation Decisions

### Product and domain

- Bounded contexts align to **`CONTEXT.md`**: **Identity**, **Organization**, **Availability**, **Scheduling**.
- **Volunteer** is one sign-in person; **Volunteer** may hold **Ministry membership** across **Ministries** that may belong to **more than one Church**.
- **Admin** is accredited per **Church**; actions apply only within accredited **Churches** (no implicit global **Admin** unless a future network role is introduced).
- **Leader** authority is **ministry-by-ministry**; a **Leader** may steward **Ministries** across **more than one Church** when **Organization** assigns those ministries.
- **Unavailability** is always scoped to (**Volunteer**, **Ministry**); bulk flows create one logical absence per **Ministry** rather than inventing church-wide unavailability rows.
- **Ministry membership** supports **Pending** and **Active**; **Assignments** require **Active** membership for the assignment’s **Ministry**.
- **Events** and **Assignments** use explicit **UTC** instants at persistence; each **Church** (and optional **Campus**) carries timezone settings for default presentation; viewers may opt into personal-local presentation without mutating canonical records.
- **Public events** belong to exactly **one Church** in the current scope (no multi-Church single occurrence).
- **Private events** are created by an accredited **Admin** or a **Leader** of the owning **Ministry**; **Public events** are created only by an **Admin** accredited for that **Church**.
- **Role** labels come from a per-**Ministry** catalog; **Retired** catalog entries forbid new **Assignments** but do not rewrite historical rows.
- When an **Event** is cancelled, its **Assignments** are voided for that occurrence.
- When **Active** membership ends, void **Assignments** tied to **Events** whose **scheduled end** is still in the future; preserve historical **Assignments** for **Events** that have fully ended by **scheduled end** (including the rule that an **Event** still underway is not yet “past”).
- Overlap checks use **half-open** intervals in **UTC** for **Assignments** vs **Assignments** and **Assignments** vs **Unavailability**.
- Permission levels (**Admin**, **Leader**, **Volunteer**) are not mutually exclusive on one **Identity**.

### Modules to build or modify (confirmed)

> **Stakeholder confirmation (locked):** Decomposition confirmed — **Availability** and **Scheduling** remain split, with **Scheduling** as the primary deep module consuming **Availability** as a dependency.

- **Persistence package (Prisma):** canonical schema for **Church**, optional **Campus**, **Ministry**, membership lifecycle, leader delegation, admin accreditation, **Role** catalog with retirement, **Event** kinds (**Public** vs **Private**), **Assignment** intervals, **Unavailability** intervals, and auth subject linkage for **Volunteer** identity. This is a deep module: complex cardinality and invariants, narrow exports (client + types).
- **Organization application service(s):** orchestrations for accreditation, ministry structure, membership status transitions, and catalog maintenance rules (who may mutate what, and cross-**Church** constraints).
- **Availability application service:** create/update/delete **Unavailability** with ministry scoping and permission checks; query interface used by **Scheduling** (“is this instant range blocked for this volunteer+ministry?”).
- **Scheduling application service (primary deep module):** `assignVolunteerToEvent` (or equivalent) encapsulates executor authorization, membership **Active** checks, **Unavailability** consultation, overlap detection across **Assignments** (cross-**Ministry** within the person), **Role** retirement rules, **Event** window containment for assignment intervals, and coherent domain errors. Keep the public method stable while internals evolve.
- **Time window policy helper (domain-level):** reusable half-open overlap logic over **UTC** instants to avoid duplicating comparisons across services.
- **Identity integration layer:** Supabase JWT validation, request-scoped user identity, mapping authenticated subject to **Volunteer** record(s) and permission lookups for **Admin**/**Leader** checks.
- **Presentation (HTTP) adapters:** Nest controllers for scheduling mutations and read models needed by the web app; consistent error mapping from domain failures to HTTP responses.
- **Web app shell:** TanStack Router route tree with an authenticated layout; TanStack Query for fetching; a protected route example whose loader consumes API responses typed in alignment with Prisma-generated shapes (prefer `import type` from generated types or a thin DTO mirror—choose the approach that keeps browser bundles safe while preserving strict typing at compile time).

### API contracts (initial direction)

- Read endpoints for **Event** details including **Assignments** needed by the protected route example.
- Write endpoint for **Assignment** creation that delegates entirely to **Scheduling** rules (no partial validation in the controller).
- Error contract: stable machine-readable error codes for authorization failure, inactive membership, unavailability conflict, overlap conflict, retired **Role**, interval outside **Event** window, and accreditation scope violations.

### Technical clarifications

- **Supabase** hosts Postgres and Auth; Prisma migrates schema against the same database target used locally and in hosted environments.
- Monorepo workspace layout is already started at the repository root; implementation should complete `apps/api`, `apps/web`, and the shared database package rather than introducing a second competing layout.

## Testing Decisions

- **Good tests** assert externally observable behavior: given stored rows and a command, the system accepts or rejects with the correct outcome and persists the correct state transitions. Avoid asserting private method call order or internal branching structure.
- **Primary automated test target (recommended):** the **Scheduling** assignment use-case module, using test doubles for persistence ports so overlap, **Unavailability**, membership, accreditation, and **Role** retirement scenarios can be table-driven without a database.
- **Secondary automated test target (recommended):** **Availability** write rules (permissions + ministry scoping + membership existence), for the same reasons (high regression value, small surface).
- **Integration tests (recommended, smaller suite):** Prisma-backed tests for a minimal “happy path assign” and one representative failure path per major invariant, run against a disposable Postgres (container or ephemeral DB) in CI when available.
- **Prior art:** none yet in-repo; establish patterns in the API workspace once and reuse for later modules.

> **Stakeholder confirmation (locked):** Automated tests are in-scope for **both**:
>
> - **Scheduling** logic (conflicts + **Unavailability** interactions), and
> - **Organization / membership lifecycle** (voiding **future** **Assignments** when membership is removed or deactivated), aligned with `CONTEXT.md`.
>
> **Vertical slice requirement:** first milestone deliverables must prove the full stack (**Prisma → Nest → TanStack Router**) for the core scheduling read/write flow, not only backend-only scaffolding.

## Out of Scope

- **Volunteers** without their own sign-in and household-style multi-volunteer logins (explicitly deferred in `CONTEXT.md`).
- **Public events** (or other calendars) that intentionally span **multiple Churches** in a single occurrence (deferred).
- **System Admin** implementation detail beyond the accepted operator model — see ADR [`docs/adr/0005-system-admin-operator-role.md`](../adr/0005-system-admin-operator-role.md) and feature spec [`.specs/features/system-admin-platform/spec.md`](../../.specs/features/system-admin-platform/spec.md) for scope (in-app grant/revoke of **System Admin**, impersonation, and operator scheduling writes remain out of scope).
- Full production hardening items not required to prove the architecture: email templates, push notifications, advanced audit UI, complex reporting dashboards, mobile apps.

## Further Notes

- Keep ubiquitous language consistent with `CONTEXT.md` and avoid overloading the word “role” between permission levels and roster **Roles**.
- **System Admin** (platform operator) vs church-scoped **Admin**: ADR [`docs/adr/0005-system-admin-operator-role.md`](../adr/0005-system-admin-operator-role.md); glossary term in `CONTEXT.md`.
- This PRD is written to align with `volunteer.md` deliverables: Prisma schema, Nest DDD-oriented module layout, deep **Scheduling** implementation, and a TanStack Router protected route + typed loader pattern.
- **Related PRD (presentation layer):** foundational web chrome, Tailwind/shadcn adoption, and i18n are specified in **`docs/prd/web-client-design-system-shell-i18n.md`** (see ADR **`docs/adr/0001-visual-system-shell-and-i18n-baseline.md`**). Prefer that PRD for UI-only milestones so this document stays the domain and platform backbone.
- **Issue tracker publishing:** the repository does not currently define an issue tracker integration or triage label vocabulary. Save/publish this PRD into your tracker manually when available, and apply the label **`ready-for-agent`** per your triage convention.
