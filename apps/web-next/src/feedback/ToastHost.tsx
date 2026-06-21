import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  createToastOrchestrator,
  getAppToastOrchestrator,
} from './toastOrchestrator';

type ToastApi = ReturnType<typeof createToastOrchestrator>;

const ToastContext = createContext<ToastApi | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const orchestrator = getAppToastOrchestrator();
  const [, setTick] = useState(0);

  useEffect(() => {
    return orchestrator.subscribe(() => setTick((value) => value + 1));
  }, [orchestrator]);

  return (
    <ToastContext.Provider value={orchestrator}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2"
      >
        {orchestrator.visible().map((toast) => (
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
