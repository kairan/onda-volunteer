# Working context picker — context & decisions

Captured 2026-07-01 from product/design discussion (serve-well reference + dual-role UX).

---

## Problem statement (user story)

> Como voluntário que **lidera Louvor** mas **serve em Kids**, quero escolher explicitamente em que ministério e com que permissão estou a trabalhar, para ver o nav e as rotas certas sem perder “My Assignments” só porque também sou líder noutro sítio.

---

## Relationship to Lovable (`serve-well`)

The Lovable prototype includes a **role switcher dropdown** in the top bar (`Volunteer` / `Ministry Leader` / `Church Admin`). That control was **rejected for production** in [ui-refresh `context.md`](../ui-refresh-onda-brand/context.md):

> Role switcher dropdown — **Reject for production** — use Church/Campus + account menu

### What we learned from Lovable anyway

| Lovable pattern | Decision for Onda product |
|-----------------|---------------------------|
| Global persona switch (demo roles) | **Reject** — grants are per-ministry, not global |
| Need to switch “what I’m doing now” | **Adopt problem** — solve with **Working context** (ministry + mode) |
| Ministry name in sidebar header | **Already adopted** via Church name + org switchers |
| Separate nav per persona | **Adopt** — but driven by **active working context**, not demo dropdown |

### Inspired control (not a copy)

Production control label (pt-BR): **“Atuar como”**

Example options:

```
Louvor · Líder
Kids · Voluntário
```

This is **not** the Lovable role dropdown. It is a **grant-scoped context picker** backed by `organization/context`.

---

## Terminology (avoid confusion)

| Term | Meaning | In picker? |
|------|---------|------------|
| **Volunteer** | Sign-in person; permission to be assigned | Mode `volunteer` when `membershipStatus === ACTIVE` |
| **Leader** | Ministry-scoped stewardship grant | Mode `leader` when `ministry.isLeader` |
| **Role** | Catalog slot on an event (“Lead Vocalist”) | **Never** — different concept |
| **Admin** | Church-scoped org admin | Separate nav (`isOrgAdmin`); not a working-context mode |
| **System Admin** | Platform operator | `/system-admin/*`; out of church shell |

---

## Decisions

| ID | Decision | Rationale |
|----|----------|-----------|
| CTX-01 | One picker entry per ministry **mode**, not per global role | Matches API (`X-Leader-Ministry-Id`) and domain grants |
| CTX-02 | If user is **Leader** of a ministry, do **not** also show “Voluntário” for that same ministry | Leader supersedes; avoids duplicate/confusing entries |
| CTX-03 | `PENDING` / `INACTIVE` memberships → no volunteer option | Domain: only **Active** eligible for assignments |
| CTX-04 | Church + Campus switchers **unchanged**; picker is scoped to active church | Campus = timezone anchor (ADR 0001) |
| CTX-05 | Replace shell **Ministry-only** dropdown with **Working context** dropdown when user has ≥1 option | Ministry-only picker cannot express leader vs volunteer hat |
| CTX-06 | Nav derives from **active working context mode**, not `any(ministry.isLeader)` | Fixes dual-role hiding “My Assignments” |
| CTX-07 | `/scheduling` view = `leader` iff `workingContext.mode === 'leader'` | Removes `useSchedulingViewRole` global leader detection |
| CTX-08 | Volunteer assignments remain **church-scoped** API; UI may highlight active ministry (v1) | No backend change required for v1 |
| CTX-09 | Persist context per church in `localStorage` | Avoid bleed across tenants when switching church |
| CTX-10 | **No API changes** for v1 | `GET /organization/context` already returns `isLeader` + `membershipStatus` per ministry |

---

## Current `web-next` gaps (why this spec exists)

1. **`buildNavForGrants`** uses `isLeader = any(ministry.isLeader)` → dual-role users lose `myAssignments` nav item.
2. **`/scheduling`** uses the same `any(isLeader)` rule → always shows leader roster if user leads anywhere.
3. **`OrganizationContextControls`** ministry dropdown sets `activeMinistryId` but does **not** switch volunteer vs leader **mode**.
4. **`LeaderSchedulingPage`** already uses `activeMinistryId` for `X-Leader-Ministry-Id` scope — good foundation once mode is explicit.

---

## Out of scope (v1)

| Item | Reason |
|------|--------|
| Backend new endpoints | Context derivable from existing org payload |
| Accept/Decline assignments | Already deferred (ADR 0006 / ui-refresh) |
| Global search | Deferred |
| Church Admin / System Admin shell redesign | Functional port only |
| Filtering volunteer assignments API by ministry | Optional v2; v1 UI highlight/filter client-side |
