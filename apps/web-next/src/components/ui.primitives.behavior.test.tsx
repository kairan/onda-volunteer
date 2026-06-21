import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback } from './ui/avatar';
import { getAvatarInitials } from './ui/avatarInitials';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Skeleton } from './ui/skeleton';

/** Locked Onda semantic HSL components (must match globals.css :root). */
const ONDA_SEMANTIC_HSL = {
  card: '0 0% 100%',
  secondary: '204 45% 88%',
  accent: '204 48% 85%',
  muted: '204 50% 90%',
  input: '206 38% 74%',
} as const;

function hslToRgb(hsl: string): string {
  const match = hsl.match(/([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/);
  if (!match) {
    throw new Error(`invalid hsl: ${hsl}`);
  }
  const h = Number(match[1]) / 360;
  const s = Number(match[2]) / 100;
  const l = Number(match[3]) / 100;
  const hueToRgb = (p: number, q: number, t: number) => {
    let channel = t;
    if (channel < 0) channel += 1;
    if (channel > 1) channel -= 1;
    if (channel < 1 / 6) return p + (q - p) * 6 * channel;
    if (channel < 1 / 2) return q;
    if (channel < 2 / 3) return p + (q - p) * (2 / 3 - channel) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
  const g = Math.round(hueToRgb(p, q, h) * 255);
  const b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);
  return `rgb(${r}, ${g}, ${b})`;
}

/** jsdom does not resolve hsl(var(--token)); inject resolved Onda values for computed-style checks. */
function installSemanticUtilityStyles(): void {
  const style = document.createElement('style');
  style.setAttribute('data-testid', 'onda-semantic-utilities');
  style.textContent = `
    .bg-card { background-color: hsl(${ONDA_SEMANTIC_HSL.card}); }
    .bg-secondary { background-color: hsl(${ONDA_SEMANTIC_HSL.secondary}); }
    .bg-accent { background-color: hsl(${ONDA_SEMANTIC_HSL.accent}); }
    .bg-muted { background-color: hsl(${ONDA_SEMANTIC_HSL.muted}); }
    .border-input { border-style: solid; border-width: 1px; border-color: hsl(${ONDA_SEMANTIC_HSL.input}); }
  `;
  document.head.appendChild(style);
}

describe('shadcn primitives on Onda tokens', () => {
  beforeAll(() => {
    installSemanticUtilityStyles();
  });
  it('renders button with primary background classes', () => {
    render(<Button data-testid="onda-button">Confirmar</Button>);
    const button = screen.getByTestId('onda-button');
    expect(button.className).toContain('bg-primary');
    expect(button.className).not.toContain('border-2');
    expect(button.className).not.toContain('shadow-[4px_4px');
    expect(button.className).not.toContain('uppercase');
  });

  it('renders card with rounded border styling', () => {
    render(
      <Card data-testid="onda-card">
        <CardHeader>
          <CardTitle>Evento</CardTitle>
        </CardHeader>
        <CardContent>Detalhes</CardContent>
      </Card>,
    );
    const card = screen.getByTestId('onda-card');
    expect(card.className).toMatch(/rounded/);
    expect(card.className).not.toContain('rounded-none');
    expect(screen.getByText('Evento')).toBeInTheDocument();
  });

  it('renders badge with semantic variant classes', () => {
    render(<Badge data-testid="onda-badge">Confirmado</Badge>);
    const badge = screen.getByTestId('onda-badge');
    expect(badge.className).toMatch(/rounded/);
    expect(badge).toHaveTextContent('Confirmado');
  });

  it('derives avatar initials from display name', () => {
    expect(getAvatarInitials('Maria Silva')).toBe('MS');
    render(
      <Avatar>
        <AvatarFallback>{getAvatarInitials('Maria Silva')}</AvatarFallback>
      </Avatar>,
    );
    expect(screen.getByText('MS')).toBeInTheDocument();
  });

  it('applies Onda semantic token backgrounds via computed styles', () => {
    render(
      <>
        <Card data-testid="onda-card-surface">Card</Card>
        <Button variant="secondary" data-testid="onda-button-secondary">
          Secondary
        </Button>
        <Input data-testid="onda-input" aria-label="Nome" />
        <Skeleton data-testid="onda-skeleton" className="h-4 w-24" />
        <Avatar>
          <AvatarFallback data-testid="onda-avatar-fallback">MS</AvatarFallback>
        </Avatar>
      </>,
    );

    const card = screen.getByTestId('onda-card-surface');
    const secondaryButton = screen.getByTestId('onda-button-secondary');
    const input = screen.getByTestId('onda-input');
    const skeleton = screen.getByTestId('onda-skeleton');
    const avatarFallback = screen.getByTestId('onda-avatar-fallback');

    expect(getComputedStyle(card).backgroundColor).toBe(
      hslToRgb(ONDA_SEMANTIC_HSL.card),
    );
    expect(getComputedStyle(secondaryButton).backgroundColor).toBe(
      hslToRgb(ONDA_SEMANTIC_HSL.secondary),
    );
    expect(getComputedStyle(skeleton).backgroundColor).toBe(
      hslToRgb(ONDA_SEMANTIC_HSL.accent),
    );
    expect(getComputedStyle(avatarFallback).backgroundColor).toBe(
      hslToRgb(ONDA_SEMANTIC_HSL.muted),
    );
    expect(getComputedStyle(input).borderTopColor).toBe(
      hslToRgb(ONDA_SEMANTIC_HSL.input),
    );
  });
});
