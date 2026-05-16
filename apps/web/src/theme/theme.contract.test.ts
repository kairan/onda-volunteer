import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { REQUIRED_THEME_CSS_VARIABLES } from './tokens';

const globalsCss = readFileSync(
  join(process.cwd(), 'src/styles/globals.css'),
  'utf8',
);

describe('theme CSS variable contract', () => {
  it('defines ADR semantic variables for the brand layer', () => {
    for (const name of REQUIRED_THEME_CSS_VARIABLES) {
      expect(globalsCss, `missing ${name}`).toContain(`${name}:`);
    }
  });

  it('locks gold primary and warm destructive anchors in :root', () => {
    expect(globalsCss).toMatch(/--primary:\s*45\s+100%\s+50%/);
    expect(globalsCss).toMatch(/--brand:\s*45\s+100%\s+50%/);
    expect(globalsCss).toMatch(/--destructive:\s*14\s+90%\s+48%/);
    expect(globalsCss).toMatch(/--radius:\s*0px/);
  });
});
