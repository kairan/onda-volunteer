import { execSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { REQUIRED_SHADCN_THEME_COLOR_KEYS } from './tokens';

function readBuiltCss(): string {
  execSync('pnpm exec vite build', {
    cwd: process.cwd(),
    stdio: 'pipe',
  });
  const assetsDir = join(process.cwd(), 'dist/assets');
  const cssFile = readdirSync(assetsDir).find((name) => name.endsWith('.css'));
  if (!cssFile) {
    throw new Error('vite build did not emit CSS');
  }
  return readFileSync(join(assetsDir, cssFile), 'utf8');
}

describe('theme Tailwind build output', () => {
  it('emits shadcn semantic utilities wired to Onda CSS variables', () => {
    const builtCss = readBuiltCss();

    for (const key of REQUIRED_SHADCN_THEME_COLOR_KEYS) {
      expect(builtCss, `missing theme key ${key}`).toContain(`${key}:`);
    }

    expect(builtCss).toContain('.bg-card');
    expect(builtCss).toContain('.bg-secondary');
    expect(builtCss).toContain('.bg-muted');
    expect(builtCss).toContain('.bg-accent');
    expect(builtCss).toContain('.border-input');
    expect(builtCss).toMatch(/\.bg-card\{[^}]*hsl\(var\(--card\)\)/);
    expect(builtCss).toMatch(/\.bg-secondary\{[^}]*hsl\(var\(--secondary\)\)/);
    expect(builtCss).toMatch(/\.border-input\{[^}]*hsl\(var\(--input\)\)/);
  });
});
