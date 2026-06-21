import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  createToastOrchestrator,
  type ToastMessage,
} from './toastOrchestrator';

type ToastApi = ReturnType<typeof createToastOrchestrator>;

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const orchestrator = useMemo(() => createToastOrchestrator(), []);
  const [, setTick] = useState(0);

  const api = useMemo<ToastApi>(() => {
    const base = orchestrator;
    return {
      push(toast: ToastMessage) {
        base.push(toast);
        setTick((value) => value + 1);
      },
      dismiss(id: string) {
        base.dismiss(id);
        setTick((value) => value + 1);
      },
      visible() {
        return base.visible();
      },
    };
  }, [orchestrator]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2"
      >
        {api.visible().map((toast) => (
          <div
            key={toast.id}
            role={toast.kind === 'error' ? 'alert' : 'status'}
            className="pointer-events-auto rounded-md border border-border bg-surface px-3 py-2 text-sm shadow-[var(--shadow-subtle)]"
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToasts(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToasts must be used within ToastProvider');
  }
  return ctx;
}
