import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Card, CardTitle } from './ui/card';

describe('Card (design foundation)', () => {
  it('renders HOPE surfaces with heavy borders and hard shadow', () => {
    render(
      <Card aria-label="Resumo">
        <CardTitle>Escalas</CardTitle>
      </Card>,
    );

    const card = screen.getByLabelText('Resumo');
    expect(card.className).toContain('border-2');
    expect(card.className).toContain('border-border');
    expect(card.className).toContain('bg-surface');
    expect(card.className).toContain('shadow-[6px_6px_0_0_hsl(var(--border))]');
    expect(card.className).toContain('hover:-translate-x-0.5');

    expect(screen.getByRole('heading', { name: 'Escalas' }).className).toContain(
      'font-display',
    );
  });
});
