import { existsSync, readFileSync, readdirSync } from 'node:fs';
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

  it('locks official BrandBook anchors in :root', () => {
    expect(globalsCss).toMatch(/--background:\s*oklch\(0\.9472\s+0\.0093\s+106\.58\)/);
    expect(globalsCss).toMatch(/--foreground:\s*oklch\(0\.2779\s+0\.1141\s+272\.4\)/);
    expect(globalsCss).toMatch(/--primary:\s*oklch\(0\.4601\s+0\.2464\s+267\.96\)/);
    expect(globalsCss).toMatch(/--primary-hover:\s*oklch\(0\.4176\s+0\.233\s+268\.04\)/);
    expect(globalsCss).toMatch(/--border:\s*oklch\(0\.8088\s+0\.0613\s+238\.02\)/);
    expect(globalsCss).toMatch(/--muted:\s*oklch\(0\.959\s+0\.0209\s+236\.75\)/);
    expect(globalsCss).toMatch(/--muted-foreground:\s*oklch\(0\.45\s+0\.0834\s+257\.06\)/);
    expect(globalsCss).toMatch(/--shadow-card:/);
    expect(globalsCss).toMatch(/--radius:\s*0\.5rem/);
  });

  it('uses Space Grotesk for UI typography', () => {
    expect(globalsCss).toContain("@import '@fontsource/space-grotesk/400.css';");
    expect(globalsCss).toMatch(/--font-sans:\s*'Space Grotesk'/);
    expect(globalsCss).not.toMatch(/montserrat|Montserrat/i);
  });

  it('self-hosts Right Grotesk without Lovable CDN URLs', () => {
    expect(globalsCss).toContain("url('../assets/fonts/RightGrotesk-Bold.otf')");
    expect(globalsCss).toContain("url('../assets/fonts/RightGrotesk-Dark.otf')");
    expect(globalsCss).toContain("url('../assets/fonts/RightGrotesk-TightDark.otf')");
    expect(globalsCss).not.toMatch(/__l5e\/assets/);

    for (const file of [
      'RightGrotesk-Bold.otf',
      'RightGrotesk-Dark.otf',
      'RightGrotesk-TightDark.otf',
    ]) {
      expect(
        existsSync(join(process.cwd(), 'src/assets/fonts', file)),
        `missing font binary ${file}`,
      ).toBe(true);
    }
  });

  it('defines shadcn semantic variables aliased to Onda palette', () => {
    for (const name of REQUIRED_SHADCN_THEME_CSS_VARIABLES) {
      expect(globalsCss, `missing ${name}`).toContain(`${name}:`);
    }
    for (const name of REQUIRED_SHADCN_THEME_COLOR_KEYS) {
      expect(globalsCss, `missing ${name}`).toContain(`${name}:`);
    }
    expect(globalsCss).toMatch(/--card:\s*oklch\(1\s+0\s+0\)/);
    expect(globalsCss).toMatch(/--input:\s*oklch\(0\.8088\s+0\.0613\s+238\.02\)/);
  });

  it('does not import SF Pro or other BrandBook print-only fonts', () => {
    expect(globalsCss).not.toMatch(/sf[\s-]?pro/i);
    expect(globalsCss).not.toMatch(/SFPro/i);
    expect(globalsCss).not.toMatch(/SF-Pro/i);

    const fontsDir = join(process.cwd(), 'src/assets/fonts');
    if (existsSync(fontsDir)) {
      for (const file of readdirSync(fontsDir)) {
        expect(String(file), 'SF Pro must not be vendored in web-onda').not.toMatch(
          /sf[\s-]?pro/i,
        );
      }
    }
  });

  it('vendors official BrandBook logo and grafismo assets', () => {
    for (const file of [
      'logo-igreja-onda-preto.png',
      'logo-igreja-onda-branco.png',
      'grafismo-ondas-filled.png',
      'grafismo-ondas-line.png',
    ]) {
      expect(
        existsSync(join(process.cwd(), 'src/assets/brand', file)),
        `missing brand asset ${file}`,
      ).toBe(true);
    }
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
