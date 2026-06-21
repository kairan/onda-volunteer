import { Link, useNavigate } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthSession } from '@/auth/AuthSessionProvider';
import { demoVolunteerId, devUserSelectAvailable } from '@/auth/authSession';
import { DEV_SEED_PERSONAS } from '@/auth/devSeedPersonas';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function UserSelectPage() {
  const { t } = useTranslation('shell');
  const auth = useAuthSession();
  const navigate = useNavigate();
  const activeId =
    auth.status === 'dev-bypass'
      ? auth.volunteerId
      : auth.status === 'authenticated'
        ? auth.volunteerId
        : demoVolunteerId();

  if (!devUserSelectAvailable()) {
    return (
      <DevPickerLayout>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('devPersona.unavailableTitle')}
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {t('devPersona.unavailableBody')}
        </p>
        <Button asChild className="w-fit">
          <Link to="/dashboard">{t('devPersona.goDashboard')}</Link>
        </Button>
      </DevPickerLayout>
    );
  }

  function handleSelect(volunteerId: string) {
    auth.selectDevVolunteer(volunteerId);
    void navigate({ to: '/dashboard' });
  }

  return (
    <DevPickerLayout>
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t('devPersona.eyebrow')}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('devPersona.title')}
        </h1>
        <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
          {t('devPersona.subtitle')}
        </p>
      </header>

      <ul className="flex flex-col gap-3" aria-label={t('devPersona.listLabel')}>
        {DEV_SEED_PERSONAS.map((persona) => {
          const selected = persona.id === activeId;
          return (
            <li key={persona.id}>
              <button
                type="button"
                className={cn(
                  'w-full rounded-lg border border-border bg-card p-4 text-left shadow-[var(--shadow-card)] transition-colors hover:bg-muted/40',
                  selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                )}
                aria-pressed={selected}
                onClick={() => handleSelect(persona.id)}
              >
                <p className="text-lg font-semibold tracking-tight">
                  {persona.displayName}
                </p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">
                  {persona.id}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {persona.capabilityKeys.map((key) => t(key)).join(' · ')}
                </p>
                {selected ? (
                  <p className="mt-2 text-xs font-medium uppercase tracking-wide text-primary">
                    {t('devPersona.current')}
                  </p>
                ) : null}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap gap-3 border-t border-border pt-4">
        <Button variant="outline" asChild>
          <Link to="/dashboard">{t('devPersona.goDashboard')}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/system-admin">{t('devPersona.goSystemAdmin')}</Link>
        </Button>
      </div>
    </DevPickerLayout>
  );
}

function DevPickerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-lg flex-col gap-8 px-4 py-12">
        {children}
      </div>
    </div>
  );
}
