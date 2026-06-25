import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from './ui/button';

describe('Button (design foundation)', () => {
  it('renders default action with HOPE accent and hard offset interaction classes', () => {
    render(<Button>Confirmar</Button>);
    const button = screen.getByRole('button', { name: 'Confirmar' });
    expect(button.className).toContain('bg-foreground');
    expect(button.className).toContain('text-surface');
    expect(button.className).toContain('hover:bg-primary');
    expect(button.className).toContain('border-2');
    expect(button.className).toContain('border-border');
    expect(button.className).toContain('shadow-[4px_4px_0_0_hsl(var(--border))]');
    expect(button.className).toContain('hover:-translate-x-0.5');
    expect(button.className).toContain('hover:-translate-y-0.5');
    expect(button.className).toContain('uppercase');
  });

  it('renders destructive actions with warm destructive semantic classes', () => {
    render(<Button variant="destructive">Remover</Button>);
    const button = screen.getByRole('button', { name: 'Remover' });
    expect(button.className).toContain('bg-destructive');
    expect(button.className).not.toContain('bg-primary');
  });

  it('renders HOPE variants with visible border-driven states', () => {
    render(
      <>
        <Button variant="accent">Destacar</Button>
        <Button variant="outline">Filtrar</Button>
        <Button variant="ghost">Navegar</Button>
      </>,
    );

    expect(screen.getByRole('button', { name: 'Destacar' }).className).toContain(
      'bg-brand',
    );
    expect(screen.getByRole('button', { name: 'Destacar' }).className).toContain(
      'hover:bg-foreground',
    );
    const outline = screen.getByRole('button', { name: 'Filtrar' });
    expect(outline.className).toContain('bg-transparent');
    expect(outline.className).toContain('hover:bg-foreground');
    expect(screen.getByRole('button', { name: 'Navegar' }).className).toContain(
      'shadow-none',
    );
  });
});
