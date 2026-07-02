export type ToastKind = 'success' | 'info' | 'warning' | 'error';

export type ToastMessage = {
  id: string;
  kind: ToastKind;
  message: string;
};

const MAX_NON_CRITICAL = 2;

export function createToastOrchestrator() {
  const queue: ToastMessage[] = [];
  const listeners = new Set<() => void>();

  function notify() {
    for (const listener of listeners) {
      listener();
    }
  }

  return {
    push(toast: ToastMessage) {
      if (toast.kind === 'error') {
        const withoutErrors = queue.filter((item) => item.kind !== 'error');
        queue.length = 0;
        queue.push(...withoutErrors, toast);
        trimNonCritical();
        notify();
        return;
      }

      queue.push(toast);
      trimNonCritical();
      notify();
    },
    dismiss(id: string) {
      const index = queue.findIndex((item) => item.id === id);
      if (index >= 0) {
        queue.splice(index, 1);
        notify();
      }
    },
    visible() {
      return [...queue];
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };

  function trimNonCritical() {
    const errors = queue.filter((item) => item.kind === 'error');
    const nonCritical = queue.filter((item) => item.kind !== 'error');
    while (nonCritical.length > MAX_NON_CRITICAL) {
      nonCritical.shift();
    }
    queue.length = 0;
    queue.push(...errors, ...nonCritical);
  }
}

const appToastOrchestrator = createToastOrchestrator();

export function getAppToastOrchestrator() {
  return appToastOrchestrator;
}

/** Clears queued toasts between Vitest cases (singleton survives file boundaries). */
export function resetAppToastOrchestratorForTests() {
  for (const toast of appToastOrchestrator.visible()) {
    appToastOrchestrator.dismiss(toast.id);
  }
}
