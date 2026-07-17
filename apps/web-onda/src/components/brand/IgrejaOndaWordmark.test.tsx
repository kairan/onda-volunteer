import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { IgrejaOndaWordmark } from './IgrejaOndaWordmark';

afterEach(() => {
  cleanup();
});

describe('IgrejaOndaWordmark', () => {
  it('renders preto variant with accessible igreja onda name', () => {
    render(<IgrejaOndaWordmark variant="preto" />);

    const logo = screen.getByRole('img', { name: /igreja onda/i });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src');
    expect(logo.getAttribute('src')).toMatch(/logo-igreja-onda-preto/);
  });

  it('renders branco variant with accessible igreja onda name', () => {
    render(<IgrejaOndaWordmark variant="branco" />);

    const logo = screen.getByRole('img', { name: /igreja onda/i });
    expect(logo).toBeInTheDocument();
    expect(logo.getAttribute('src')).toMatch(/logo-igreja-onda-branco/);
  });

  it('applies compact crop classes when compact is set', () => {
    render(<IgrejaOndaWordmark variant="preto" compact />);

    const logo = screen.getByRole('img', { name: /igreja onda/i });
    expect(logo.className).toContain('object-cover');
    expect(logo.className).toContain('object-left');
  });

  it('falls back to igreja onda text when the image fails to load', () => {
    render(<IgrejaOndaWordmark variant="preto" />);

    const logo = screen.getByRole('img', { name: /igreja onda/i });
    fireEvent.error(logo);

    expect(screen.queryByRole('img', { name: /igreja onda/i })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/igreja onda/i)).toHaveTextContent('igreja onda');
    expect(screen.queryByText(/^Onda$/)).not.toBeInTheDocument();
  });
});
