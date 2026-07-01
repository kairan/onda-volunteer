import { QueryClient } from '@tanstack/react-query';
import { getAppToastOrchestrator } from '@/feedback/toastOrchestrator';

const toastOrchestrator = getAppToastOrchestrator();

/** Shared QueryClient — default staleTime 30s per ADR 0001 pessimistic data layer. */
export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 30s — list/detail queries stay fresh briefly without refetch storms.
        staleTime: 30_000,
        retry: 1,
      },
      mutations: {
        onError: (error) => {
          toastOrchestrator.push({
            id: `mutation-error-${Date.now()}`,
            kind: 'error',
            message: error instanceof Error ? error.message : 'Request failed',
          });
        },
      },
    },
  });
}

export const queryClient = createAppQueryClient();

export function getToastOrchestratorForTests() {
  return toastOrchestrator;
}
