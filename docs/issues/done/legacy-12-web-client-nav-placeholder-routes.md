# 12 — Web client: navigation manifest + placeholder destination routes

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** PRD user stories **10**, **41**, **55**, **34**; ADR 0001 (placeholder destinations, **Time away** label); `CONTEXT.md` (**Time away** vs **Unavailability**)  
**Parent:** Epic **`done/legacy-08-web-client-design-system-shell-i18n.md`**

## Parent

- Epic: `docs/issues/done/legacy-08-web-client-design-system-shell-i18n.md`
- PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Create a single **navigation manifest** (labels, paths, ordering, placeholder vs real flags) consumed by both **desktop** sidebar and **mobile** sheet so they cannot drift. Add **real routes** for each primary destination (including **Time away** for the **Availability** area). Each placeholder renders the **type + thin icon only** empty state inside the shell, with **all user-visible strings** sourced from the **route-shaped i18n namespaces** (no ad-hoc bilingual literals in components). **Dashboard** remains the first item as already routed in slice **11**.

## Acceptance criteria

- [ ] Primary nav items match the manifest order on **desktop** and **mobile**.
- [ ] Every manifest entry resolves to a real route that renders inside the shell.
- [ ] Placeholder pages use the agreed empty-state pattern and pull copy only from i18n keys.
- [ ] The **Availability** area uses the public nav label **Time away** while leaving room for **Unavailability** in future page-level copy where precision matters.
- [ ] Automated tests validate manifest ordering, path presence, and at least one placeholder route’s translated title/body keys resolving under **`pt-BR`** and **`en`**.

## Blocked by

- **Slice 11 — Shell routing & landmarks** (shell outlet and navigation regions must exist).
