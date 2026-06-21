import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FORBIDDEN_HOPE_CSS_VARIABLES,
  REQUIRED_SHADCN_THEME_COLOR_KEYS,
  REQUIRED_SHADCN_THEME_CSS_VARIABLES,
  REQUIRED_THEME_CSS_VARIABLES,
} from './tokens';

const globalsCss = readFileSync(
  join(process.cwd(), 'src/styles/globals.css'),
  'utf8',
);

describe('theme CSS variable contract (Onda)', () => {
  it('defines all required Onda semantic variables', () => {
    for (const name of REQUIRED_THEME_CSS_VARIABLES) {
      expect(globalsCss, `missing ${name}`).toContain(`${name}:`);
    }
  });

  it('locks Onda brand anchors in :root', () => {
    expect(globalsCss).toMatch(/--primary:\s*oklch\(0\.4455\s+0\.241\s+267\.39\)/);
    expect(globalsCss).toMatch(/--background:\s*oklch\(0\.9851\s+0\s+0\)/);
    expect(globalsCss).toMatch(/--shadow-card:/);
    expect(globalsCss).toMatch(/--radius:\s*0\.5rem/);
    expect(globalsCss).toMatch(/--primary-hover:\s*oklch\(0\.3743/);
  });

  it('uses Space Grotesk for UI typography', () => {
    expect(globalsCss).toContain("@import '@fontsource/space-grotesk/400.css';");
    expect(globalsCss).toMatch(/--font-sans:\s*'Space Grotesk'/);
    expect(globalsCss).not.toMatch(/montserrat|Montserrat/i);
  });

  it('defines shadcn semantic variables aliased to Onda palette', () => {
    for (const name of REQUIRED_SHADCN_THEME_CSS_VARIABLES) {
      expect(globalsCss, `missing ${name}`).toContain(`${name}:`);
    }
    for (const name of REQUIRED_SHADCN_THEME_COLOR_KEYS) {
      expect(globalsCss, `missing ${name}`).toContain(`${name}:`);
    }
    expect(globalsCss).toMatch(/--card:\s*oklch\(1\s+0\s+0\)/);
    expect(globalsCss).toMatch(/--input:\s*oklch\(0\.89\s+0\.01\s+250\)/);
  });

  it('does not define HOPE structural tokens', () => {
    for (const name of FORBIDDEN_HOPE_CSS_VARIABLES) {
      expect(globalsCss, `forbidden HOPE var ${name}`).not.toContain(
        `${name}:`,
      );
    }
    expect(globalsCss).not.toMatch(/--radius:\s*0px/);
    expect(globalsCss).not.toMatch(/--shadow-offset-/);
  });
});
