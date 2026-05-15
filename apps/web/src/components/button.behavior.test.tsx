import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './ui/button';

describe('Button (design foundation)', () => {
  it('renders default primary action with ink semantic classes', () => {
    render(<Button>Confirmar</Button>);
    const button = screen.getByRole('button', { name: 'Confirmar' });
    expect(button.className).toContain('bg-primary');
    expect(button.className).toContain('text-primary-foreground');
  });

  it('renders destructive actions with warm destructive semantic classes', () => {
    render(<Button variant="destructive">Remover</Button>);
    const button = screen.getByRole('button', { name: 'Remover' });
    expect(button.className).toContain('bg-destructive');
    expect(button.className).not.toContain('bg-primary');
  });
});
