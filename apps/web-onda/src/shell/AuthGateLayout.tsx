import type { ReactNode } from 'react';
import { IgrejaOndaWordmark } from '@/components/brand/IgrejaOndaWordmark';

export function AuthGateLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="auth-brand-gradient min-h-screen text-foreground"
      data-testid="auth-gate-layout"
    >
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 px-4 py-12">
        <div>
          <IgrejaOndaWordmark variant="branco" className="max-h-7" />
          <div className="mt-3 h-1 w-12 rounded-full bg-primary-foreground/80" aria-hidden />
        </div>
        {children}
      </div>
    </div>
  );
}
