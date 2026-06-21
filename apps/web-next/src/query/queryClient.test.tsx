import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { createAppQueryClient } from './queryClient';
import { QueryProvider } from './QueryProvider';

describe('queryClient', () => {
  it('creates a QueryClient with 30s staleTime default', () => {
    const client = createAppQueryClient();
    expect(client).toBeInstanceOf(QueryClient);
    expect(client.getDefaultOptions().queries?.staleTime).toBe(30_000);
  });
});

describe('QueryProvider', () => {
  it('renders children', () => {
    render(
      <QueryProvider>
        <span>child</span>
      </QueryProvider>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});
