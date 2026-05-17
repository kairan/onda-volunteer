import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { REQUIRED_THEME_CSS_VARIABLES } from './tokens';

const globalsCss = readFileSync(
  join(process.cwd(), 'src/styles/globals.css'),
  'utf8',
);

describe('theme CSS variable contract', () => {
  it('defines HOPE semantic variables for the brand layer', () => {
    for (const name of REQUIRED_THEME_CSS_VARIABLES) {
      expect(globalsCss, `missing ${name}`).toContain(`${name}:`);
    }
  });

  it('locks HOPE light-first brutalist anchors in :root', () => {
    expect(globalsCss).toMatch(/--background:\s*0\s+0%\s+91%/);
    expect(globalsCss).toMatch(/--foreground:\s*0\s+0%\s+0%/);
    expect(globalsCss).toMatch(/--surface:\s*0\s+0%\s+100%/);
    expect(globalsCss).toMatch(/--border:\s*0\s+0%\s+0%/);
    expect(globalsCss).toMatch(/--primary:\s*49\s+100%\s+62%/);
    expect(globalsCss).toMatch(/--brand:\s*49\s+100%\s+62%/);
    expect(globalsCss).toMatch(/--destructive:\s*14\s+90%\s+48%/);
    expect(globalsCss).toMatch(/--radius:\s*0px/);
  });

  it('defines HOPE structural border, shadow, and transition tokens', () => {
    expect(globalsCss).toMatch(/--border-weight:\s*2px/);
    expect(globalsCss).toMatch(/--shadow-offset-sm:\s*4px\s+4px\s+0/);
    expect(globalsCss).toMatch(/--shadow-offset-md:\s*6px\s+6px\s+0/);
    expect(globalsCss).toMatch(/--transition-fast:\s*120ms/);
    expect(globalsCss).toMatch(/--transition-base:\s*180ms/);
  });

  it('uses Montserrat for display typography without Archivo Narrow', () => {
    expect(globalsCss).toContain("@import '@fontsource/montserrat/400.css';");
    expect(globalsCss).toContain("@import '@fontsource/montserrat/700.css';");
    expect(globalsCss).toContain("@import '@fontsource/montserrat/800.css';");
    expect(globalsCss).toMatch(/--font-display:\s*'Montserrat'/);
    expect(globalsCss).not.toMatch(/archivo-narrow|Archivo Narrow/i);
  });
});
