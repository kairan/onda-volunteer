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

const AA_NORMAL_TEXT = 4.5;
const AA_UI_COMPONENT = 3;

type Rgb = { r: number; g: number; b: number };

function srgbFromLinear(channel: number): number {
  const abs = Math.abs(channel);
  if (channel <= 0.0031308) {
    return 12.92 * channel;
  }
  return 1.055 * abs ** (1 / 2.4) * Math.sign(channel) - 0.055;
}

function oklchToRgb(l: number, c: number, hDeg: number): Rgb {
  const hRad = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  const l3 = l_ ** 3;
  const m3 = m_ ** 3;
  const s3 = s_ ** 3;

  return {
    r: srgbFromLinear(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3),
    g: srgbFromLinear(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3),
    b: srgbFromLinear(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3),
  };
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const linearize = (value: number) =>
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  return (
    0.2126 * linearize(r) + 0.7152 * linearize(g) + 0.0722 * linearize(b)
  );
}

function contrastRatio(foreground: Rgb, background: Rgb): number {
  const fg = relativeLuminance(foreground);
  const bg = relativeLuminance(background);
  const lighter = Math.max(fg, bg);
  const darker = Math.min(fg, bg);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseOklchToken(
  css: string,
  variableName: string,
  scope: ':root' | '.dark',
): Rgb {
  const block =
    scope === ':root'
      ? (css.match(/:root\s*\{([^}]+)\}/s)?.[1] ?? '')
      : (css.match(/\.dark\s*\{([^}]+)\}/s)?.[1] ?? '');
  const match = block.match(
    new RegExp(
      `${variableName.replace(/-/g, '\\-')}:\\s*oklch\\(([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)\\)`,
    ),
  );
  if (!match) {
    throw new Error(`missing oklch token ${variableName} in ${scope}`);
  }
  return oklchToRgb(
    Number.parseFloat(match[1]),
    Number.parseFloat(match[2]),
    Number.parseFloat(match[3]),
  );
}

describe('theme CSS variable contract (Onda)', () => {
  it('defines all required Onda semantic variables', () => {
    for (const name of REQUIRED_THEME_CSS_VARIABLES) {
      expect(globalsCss, `missing ${name}`).toContain(`${name}:`);
    }
  });

  it('locks official BrandBook anchors in :root', () => {
    // App canvas #f4f4f2 (site oficial); BrandBook #eeeee7 stays on auth-brand-gradient only.
    expect(globalsCss).toMatch(
      /--background:\s*oklch\(0\.9666\s+0\.0026\s+106\.45\)/,
    );
    expect(globalsCss).toMatch(
      /auth-brand-gradient[\s\S]*#eeeee7/,
    );
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

  it('uppercases Right Grotesk display utility (BB-TYPE-01 AC2)', () => {
    expect(globalsCss).toMatch(
      /@utility font-display\s*\{[^}]*text-transform:\s*uppercase/s,
    );
    // ≤2 display headlines per screen is a product convention (ADR 0006); not unit-enforced.
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

  it('locks BrandBook blue family in .dark', () => {
    const darkBlock = globalsCss.match(/\.dark\s*\{([^}]+)\}/s)?.[1] ?? '';
    expect(darkBlock).toMatch(/--primary:\s*oklch\(0\.6053\s+0\.1677\s+266\.4\)/);
    expect(darkBlock).toMatch(/--ring:\s*oklch\(0\.6053\s+0\.1677\s+266\.4\)/);
    expect(darkBlock).toMatch(/--background:\s*oklch\(0\.2576\s+0\.1224\s+270\.1\)/);
    expect(darkBlock).toMatch(/--card:\s*oklch\(0\.2779\s+0\.1141\s+272\.4\)/);
    // Critical chrome: light foreground on dark surfaces (measured ~12.5:1 at lock values).
    expect(darkBlock).toMatch(/--foreground:\s*oklch\(0\.95\s+0\.005\s+250\)/);
  });

  it('locks warm destructive tokens for scheduling semantics (BB-TOK-01 AC5)', () => {
    expect(globalsCss).toMatch(
      /--destructive:\s*oklch\(0\.6\s+0\.22\s+27\)/,
    );
    const darkBlock = globalsCss.match(/\.dark\s*\{([^}]+)\}/s)?.[1] ?? '';
    expect(darkBlock).toMatch(/--destructive:\s*oklch\(0\.7\s+0\.19\s+22\)/);

    const destructive = parseOklchToken(globalsCss, '--destructive', ':root');
    const background = parseOklchToken(globalsCss, '--background', ':root');
    const card = parseOklchToken(globalsCss, '--card', ':root');

    // Measured contrast at lock values (warm red retained from BrandBook):
    // destructive on #f4f4f2 canvas ≈ AA UI; on white card ≈ 4.4:1.
    expect(contrastRatio(destructive, background)).toBeGreaterThanOrEqual(AA_UI_COMPONENT);
    expect(contrastRatio(destructive, card)).toBeGreaterThanOrEqual(AA_UI_COMPONENT);
  });

  it('meets WCAG 2.2 AA for dark critical chrome (BB-DARK-01 AC2)', () => {
    const foreground = parseOklchToken(globalsCss, '--foreground', '.dark');
    const background = parseOklchToken(globalsCss, '--background', '.dark');
    const primary = parseOklchToken(globalsCss, '--primary', '.dark');
    const primaryForeground = parseOklchToken(
      globalsCss,
      '--primary-foreground',
      '.dark',
    );

    // Body text on dark wash (~12.5:1) and label text on primary buttons (~5.8:1).
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(
      AA_NORMAL_TEXT,
    );
    expect(contrastRatio(primaryForeground, primary)).toBeGreaterThanOrEqual(
      AA_UI_COMPONENT,
    );
  });

  it('hides decorative flourishes when printing', () => {
    expect(globalsCss).toMatch(
      /@media print[\s\S]*\.auth-brand-gradient[\s\S]*background:\s*var\(--background\)/,
    );
    expect(globalsCss).toMatch(
      /@media print[\s\S]*\.sidebar-brand-watermark[\s\S]*display:\s*none/,
    );
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
