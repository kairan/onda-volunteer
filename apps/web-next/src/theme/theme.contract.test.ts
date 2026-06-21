import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  FORBIDDEN_HOPE_CSS_VARIABLES,
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
    expect(globalsCss).toMatch(/--primary:\s*231\s+74%\s+48%/);
    expect(globalsCss).toMatch(/--background:\s*204\s+56%\s+93%/);
    expect(globalsCss).toMatch(/--border:\s*206\s+38%\s+74%/);
    expect(globalsCss).toMatch(/--radius:\s*6px/);
    expect(globalsCss).toMatch(/--primary-hover:\s*234\s+79%\s+40%/);
  });

  it('uses Space Grotesk for UI typography', () => {
    expect(globalsCss).toContain("@import '@fontsource/space-grotesk/400.css';");
    expect(globalsCss).toMatch(/--font-sans:\s*'Space Grotesk'/);
    expect(globalsCss).not.toMatch(/montserrat|Montserrat/i);
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
