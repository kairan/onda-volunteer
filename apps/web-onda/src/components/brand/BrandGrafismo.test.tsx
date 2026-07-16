import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { BrandGrafismo } from './BrandGrafismo';

afterEach(() => {
  cleanup();
});

describe('BrandGrafismo', () => {
  it('renders filled variant with decorative aria-hidden by default', () => {
    render(<BrandGrafismo variant="filled" className="h-12 w-12" />);

    const grafismo = screen.getByTestId('brand-grafismo');
    expect(grafismo).toHaveAttribute('aria-hidden', 'true');
    expect(grafismo).toHaveAttribute('alt', '');
    expect(grafismo.getAttribute('src')).toMatch(/grafismo-ondas-filled/);
    expect(grafismo).toHaveAttribute('data-variant', 'filled');
  });

  it('renders line variant', () => {
    render(<BrandGrafismo variant="line" />);

    const grafismo = screen.getByTestId('brand-grafismo');
    expect(grafismo.getAttribute('src')).toMatch(/grafismo-ondas-line/);
    expect(grafismo).toHaveAttribute('data-variant', 'line');
  });

  it('applies custom opacity when provided', () => {
    render(<BrandGrafismo variant="line" opacity={0.1} />);

    expect(screen.getByTestId('brand-grafismo')).toHaveStyle({ opacity: 0.1 });
  });

  it('exposes accessible name when decorative is false', () => {
    render(<BrandGrafismo variant="filled" decorative={false} />);

    const grafismo = screen.getByTestId('brand-grafismo');
    expect(grafismo).not.toHaveAttribute('aria-hidden');
    expect(grafismo).toHaveAttribute('alt', 'ondas grafismo');
  });
});
