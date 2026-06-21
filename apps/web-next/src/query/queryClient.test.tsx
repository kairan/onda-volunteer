import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';
import { ToastProvider } from '@/feedback/ToastHost';
import { createAppQueryClient } from './queryClient';

function FailingMutationTrigger() {
  const mutation = useMutation({
    mutationFn: async () => {
      throw new Error('Mutation failed');
    },
  });

  return (
    <button type="button" onClick={() => mutation.mutate()}>
      trigger failure
    </button>
  );
}

describe('queryClient', () => {
  it('creates a QueryClient with 30s staleTime default', () => {
    const client = createAppQueryClient();
    expect(client).toBeInstanceOf(QueryClient);
    expect(client.getDefaultOptions().queries?.staleTime).toBe(30_000);
  });
});

describe('QueryProvider', () => {
  it('renders children', () => {
    const client = new QueryClient();
    render(
      <QueryClientProvider client={client}>
        <span>child</span>
      </QueryClientProvider>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});

describe('mutation onError toast', () => {
  it('shows a toast when a mutation fails under ToastProvider', async () => {
    const user = userEvent.setup();
    const client = createAppQueryClient();

    render(
      <QueryClientProvider client={client}>
        <ToastProvider>
          <FailingMutationTrigger />
        </ToastProvider>
      </QueryClientProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'trigger failure' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Mutation failed');
    });
  });
});
