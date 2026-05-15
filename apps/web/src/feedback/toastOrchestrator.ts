export type ToastKind = 'success' | 'info' | 'error';

export type ToastMessage = {
  id: string;
  kind: ToastKind;
  message: string;
};

const MAX_NON_CRITICAL = 2;

export function createToastOrchestrator() {
  const queue: ToastMessage[] = [];

  return {
    push(toast: ToastMessage) {
      if (toast.kind === 'error') {
        const withoutErrors = queue.filter((item) => item.kind !== 'error');
        queue.length = 0;
        queue.push(...withoutErrors, toast);
        trimNonCritical();
        return;
      }

      queue.push(toast);
      trimNonCritical();
    },
    dismiss(id: string) {
      const index = queue.findIndex((item) => item.id === id);
      if (index >= 0) {
        queue.splice(index, 1);
      }
    },
    visible() {
      return [...queue];
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
