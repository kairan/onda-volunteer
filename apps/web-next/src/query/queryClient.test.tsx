import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useMutation } from '@tanstack/react-query';
import { beforeEach, describe, expect, it } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { ToastProvider } from '@/feedback/ToastHost';
import { getAppToastOrchestrator } from '@/feedback/toastOrchestrator';
import { createAppQueryClient } from './queryClient';
import { QueryProvider } from './QueryProvider';

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
    render(
      <QueryProvider>
        <span>child</span>
      </QueryProvider>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });
});

describe('mutation onError toast', () => {
  beforeEach(() => {
    const orchestrator = getAppToastOrchestrator();
    for (const toast of orchestrator.visible()) {
      orchestrator.dismiss(toast.id);
    }
  });

  it('shows a toast when a mutation fails under ToastProvider', async () => {
    const user = userEvent.setup();

    render(
      <QueryProvider>
        <ToastProvider>
          <FailingMutationTrigger />
        </ToastProvider>
      </QueryProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'trigger failure' }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Mutation failed');
    });
  });
});
