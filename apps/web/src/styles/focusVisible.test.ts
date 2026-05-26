import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('HOPE accessibility baseline', () => {
  // Baseline guard only: ensures global tokens exist; contrast and component focus
  // behavior are covered by Playwright keyboard smoke and follow-up #49 work.
  it('defines focus-visible and reduced-motion rules in globals.css', () => {
    const css = readFileSync(
      resolve(__dirname, 'globals.css'),
      'utf8',
    );
    expect(css).toContain(':focus-visible');
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain('outline: 2px solid');
  });
});
