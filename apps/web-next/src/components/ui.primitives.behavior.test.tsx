import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Avatar, AvatarFallback } from './ui/avatar';
import { getAvatarInitials } from './ui/avatarInitials';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

describe('shadcn primitives on Onda tokens', () => {
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
});
