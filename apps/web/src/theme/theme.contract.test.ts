import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { REQUIRED_THEME_CSS_VARIABLES } from './tokens';

const globalsCss = readFileSync(
  join(process.cwd(), 'src/styles/globals.css'),
  'utf8',
);

describe('theme CSS variable contract', () => {
  it('defines ADR semantic variables for light-first theming', () => {
    for (const name of REQUIRED_THEME_CSS_VARIABLES) {
      expect(globalsCss, `missing ${name}`).toContain(`${name}:`);
    }
  });

  it('locks ink primary and warm destructive anchors in :root', () => {
    expect(globalsCss).toMatch(/--primary:\s*0\s+0%\s+0%/);
    expect(globalsCss).toMatch(/--destructive:\s*14\s+90%\s+48%/);
  });
});
