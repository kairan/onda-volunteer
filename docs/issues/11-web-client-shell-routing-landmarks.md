# 11 — Web client: shell routing, landmarks, `/dashboard`, preserve legacy routes

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** PRD user stories **5**, **6** (hit targets), **31** (structure), **42–44**, **43**, **50**; ADR 0001 (shell, skip link, sidebar width, sticky mobile top bar, Help/account placement)  
**Parent:** Epic **`08-web-client-design-system-shell-i18n.md`**

## Parent

- Epic: `docs/issues/08-web-client-design-system-shell-i18n.md`
- PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Introduce the **responsive hybrid shell**: **desktop** fixed **~260px** sidebar, **mobile** **sticky** top bar + **sheet/drawer** navigation pattern. Add the first-focusable **skip to `main`** link targeting the primary **`main`** landmark. Land **`/dashboard`** inside the shell as the signed-in home. Wire **Help** in the **sidebar footer** on desktop and **account** surfaces on mobile (duplicate Help in account on desktop if following the ADR optional). Ensure **mobile** icon-only chrome controls meet the **~44×44** hit target with **~36px** visual icons. **Critical regression guard:** existing **`/`** and **`/events/$eventId`** behaviors remain intact (loaders succeed as today); do not redesign or remove the legacy **`/`** page in this slice.

## Acceptance criteria

- [ ] Navigating to **`/dashboard`** renders inside the new shell with **`main`** landmark and working skip-link focus order.
- [ ] **`/`** still renders the legacy demo experience without broken links or loaders.
- [ ] **`/events/$eventId`** still loads **Event** detail successfully (same data contract as before this slice).
- [ ] **Desktop** shows the sidebar width near **260px**; **mobile** shows top bar + sheet navigation without layout dead-ends.
- [ ] **Help** is discoverable per ADR placement rules; **account** entry exists on **mobile** top bar and **desktop** sidebar footer region.
- [ ] **Mobile** primary chrome icons meet the **44×44** hit region rule with visually smaller centered icons.
- [ ] Automated tests cover route layout wiring for **`/dashboard`** and the **skip link** / **`main`** relationship; include a regression assertion that the **event** route still mounts or coexists per the chosen router tree.

## Blocked by

- **Slice 09 — Design foundation**
- **Slice 10 — i18n controller** (shell chrome strings must not hardcode mixed-language literals).
