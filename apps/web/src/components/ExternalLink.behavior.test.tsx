import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ExternalLink } from './ExternalLink';

describe('ExternalLink', () => {
  it('opens in a new tab with noopener noreferrer', () => {
    render(<ExternalLink href="https://example.com">Help docs</ExternalLink>);
    const link = screen.getByRole('link', { name: /help docs/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
