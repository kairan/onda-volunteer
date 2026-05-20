# 13 — Web client: Church & Campus context switchers + timezone cue

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** PRD user stories **13–16**; ADR 0001 (prominent **Church** dropdown, **Campus** secondary selector, timezone cue); `CONTEXT.md` (**Church**, **Campus**)  
**Parent:** Epic **`done/legacy-08-web-client-design-system-shell-i18n.md`**

## Parent

- Epic: `docs/issues/done/legacy-08-web-client-design-system-shell-i18n.md`
- PRD: `docs/prd/web-client-design-system-shell-i18n.md`

## What to build

Implement the **Organization context** controls in the shell: a **dropdown** **Church** switcher that stays visually prominent, and a **Campus** control that appears as a **secondary selector** when more than one **Campus** exists for the active **Church**. Show a **concise** default-timezone indicator beside context; expose the full **IANA** timezone id via **tooltip** or small details popover (never IANA-only chrome). Wire **accessible names** and menu item labels from **`shell`** translations. Use **hybrid** data: static/demo options until **Organization** reads exist, but keep prop shapes aligned with real **Church** / **Campus** domain objects.

## Acceptance criteria

- [ ] User can change the active **Church** from a **dropdown**; selection state is visible without opening the menu.
- [ ] When the active **Church** has **>1** **Campus**, a **secondary** control appears for **Campus** selection; when **0 or 1** campus, the UI does not imply fake multi-campus choice (explicit single-campus read-only is acceptable if clearer).
- [ ] Timezone cue matches ADR: short public label + full **IANA** on demand.
- [ ] Keyboard and screen-reader behavior is correct (`aria-expanded`, roving focus or menu patterns as appropriate).
- [ ] Automated tests cover selection callbacks and basic a11y wiring using behavioral queries (not markup snapshots).

## Blocked by

- **Slice 11 — Shell routing & landmarks**
- **Slice 12 — Navigation manifest & placeholder routes** (stable nav chrome / slots for context controls)
