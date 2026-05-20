# 33 — Doc cleanup — archive Lamborghini refs

**Type:** AFK  
**Label when unblocked:** `ready-for-agent`  
**Normative refs:** `docs/adr/0003-hope-design-system-replaces-lamborghini.md`

## Parent

- PRD: `docs/prd/hope-design-system-migration.md`
- GH: [#26](https://github.com/kairan/onda-volunteer/issues/26)

## What to build

Clean up documentation references from the Lamborghini visual direction superseded by ADR 0003. Ensure all pointers reference the correct authoritative visual spec.

**Changes:**
- Archive or remove `DESIGN.md` (Lamborghini analysis at repo root)
- Verify ADR 0002 has "Superseded by ADR 0003" status
- Verify ADR 0003 exists and is well-formed
- Add a note to `docs/prd/web-client-design-system-shell-i18n.md` noting visual direction superseded by ADR 0003 (do not rewrite the PRD)
- Ensure `DESIGN_SYSTEM.md` (HOPE spec) is referenced as the authoritative visual guide

**What NOT to change:**
- ADR 0001 structural decisions remain normative
- `CONTEXT.md` domain glossary unaffected
- Existing issue specs in `docs/issues/` not modified

## Acceptance criteria

- [ ] `DESIGN.md` removed or moved to archive location
- [ ] ADR 0002 includes "Superseded by ADR 0003" status header
- [ ] ADR 0003 exists at `docs/adr/0003-hope-design-system-replaces-lamborghini.md`
- [ ] No broken cross-references in `docs/` directory
- [ ] `DESIGN_SYSTEM.md` remains at repo root as the visual reference

## Blocked by

None — can start immediately.
