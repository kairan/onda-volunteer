# 10 — Web client: i18n controller, namespaces, language switcher

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** PRD user stories **1–3**, **40**, **45**; ADR 0001 (i18n + **Default UI language** + **Language switcher**); `CONTEXT.md`  
**Parent:** Epic **`done/08-web-client-design-system-shell-i18n.md`**

## Parent

- Epic: `docs/issues/done/08-web-client-design-system-shell-i18n.md`
- PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Integrate **`react-i18next`** with **`pt-BR`** as the **default first-use** UI language and **`en`** as a first-class alternate. Implement the **`pt-BR` → `en`** missing-key fallback chain. Create **`common`** and **`shell`** namespaces plus **stub files** for route-shaped namespaces to be filled in slice **12**. Wire a **language switcher** in **account/footer** surfaces per ADR, persisting choice in **client storage** until **Identity** can store preferences. Add thin **`Intl`** helpers (or documented conventions) so formatted numbers/dates use the **active locale** while domain times remain **UTC** instants at the API boundary.

## Acceptance criteria

- [ ] On cold load with no saved preference, the UI defaults to **`pt-BR`** strings.
- [ ] Switching to **`en`** updates visible chrome strings without a full reload (acceptable if a soft reload is used only if documented and tested).
- [ ] A missing key in **`pt-BR`** falls back to **`en`** per policy; catastrophic missing keys are visible in development diagnostics only (no silent blank labels in dev).
- [ ] Language choice persists across reloads via the agreed client persistence mechanism until **Identity** preferences exist.
- [ ] **`common`** and **`shell`** namespaces load; route namespaces can lazy-load without breaking the app shell.
- [ ] Automated tests cover **default locale**, **fallback**, and **persistence adapter** boundary (with a test double).

## Blocked by

- **Slice 09 — Web client: design foundation** (Tailwind/shadcn bootstrap and global styles entry must exist).
