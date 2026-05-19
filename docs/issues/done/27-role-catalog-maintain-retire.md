# 27 — Role catalog: add, rename, Retire

**Type:** **HITL** (catalog + **Retire** affects future assigns — review labels and destructive-adjacent UX before merge)  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/prd/volunteer-management-platform.md` (stories **18**, **22**, **31**); `CONTEXT.md` (**Role**, **Retired**)

## Parent

- Platform PRD: `docs/prd/volunteer-management-platform.md`

## What to build

Per-**Ministry** **Role** catalog maintenance: **Leader** for ministries they lead, **Admin** for accredited **Church**. Add and rename catalog entries; **Retire** forbids new **Assignments** but preserves historical rows. Replace **`/ministries`** placeholder with a first real screen listing catalog entries for a selected **Ministry**.

## Acceptance criteria

### Automated / AFK-verifiable

- [ ] **Retired** **Role** rejects new assign with stable domain error; historical **Assignments** unchanged.
- [ ] Unauthorized users cannot mutate catalogs outside scope.
- [ ] Automated tests cover retire + assign rejection.

### HITL — required before merge

- [ ] Reviewer confirms **Retire** UX is distinguishable from delete and copy matches glossary (**Retired** vs permission “role”).
- [ ] Reviewer signs off catalog list readability for long **Ministry** names in **pt-BR**.

## Blocked by

- Slice **15** — Organization context reads (GitHub **#5**)

## Tracker

GitHub: https://github.com/kairan/onda-volunteer/issues/10
