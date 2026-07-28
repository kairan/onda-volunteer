import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { getSupabaseClient } from '@/supabaseClient';

type AuthPanelProps = {
  variant?: 'legacy' | 'gate';
  gateShowChrome?: boolean;
  onSignedIn?: () => void | Promise<void>;
};

function formatAuthError(message: string): string {
  if (/rate limit/i.test(message)) {
    return 'Limite de e-mails do Supabase atingido. Aguarde cerca de 1 hora ou use o bypass local (veja o runbook).';
  }
  return message;
}

export function AuthPanel({
  variant = 'legacy',
  gateShowChrome = true,
  onSignedIn,
}: AuthPanelProps) {
  const { t } = useTranslation('shell');
  const supabase = getSupabaseClient();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [userId, setUserId] = useState<string | null>(null);
  const [emailDisplay, setEmailDisplay] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    void supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setEmailDisplay(data.session?.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
      setEmailDisplay(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  if (!supabase) {
    return (
      <aside className="mb-6 rounded-md border border-border bg-surface p-4 text-sm text-surface-foreground">
        <strong>Supabase not configured.</strong> Copy{' '}
        <code>apps/web-onda/.env.example</code> → <code>apps/web-onda/.env</code> and set{' '}
        <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>{' '}
        from your Supabase project (see{' '}
        <code>docs/runbooks/supabase-auth-local.md</code>).
      </aside>
    );
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      return;
    }
    setBusy(true);
    setError(null);
    setMessage(null);
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setBusy(false);
    if (err) {
      setError(formatAuthError(err.message));
      return;
    }
    setStep('otp');
    setMessage(`Check your email for a one-time code sent to ${email.trim()}.`);
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otp.trim(),
      type: 'email',
    });
    setBusy(false);
    if (err) {
      setError(formatAuthError(err.message));
      return;
    }
    await supabase.auth.getSession();
    await onSignedIn?.();
    setMessage('Signed in. Protected API calls will use your access token.');
    setStep('email');
    setOtp('');
  }

  async function signOut() {
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
    setMessage(null);
    setError(null);
  }

  if (userId) {
    return (
      <aside
        className={
          variant === 'legacy'
            ? 'mb-6 rounded-md border border-border bg-surface p-4 text-sm text-surface-foreground'
            : 'rounded-md border border-border bg-surface p-4 text-sm text-surface-foreground'
        }
      >
        <p className="mb-2">
          <strong>Signed in</strong> as {emailDisplay ?? 'user'}
        </p>
        {variant === 'legacy' ? (
          <>
            <p className="mb-2 break-all">
              Auth subject (<code>sub</code>): <code>{userId}</code>
            </p>
            <p className="mb-3 text-muted-foreground">
              Link the demo volunteer once (from repo root, with Postgres running):
            </p>
            <pre className="mb-3 overflow-auto rounded-md border border-border bg-background p-3 text-xs">
              {`pnpm link:volunteer-auth ${userId}`}
            </pre>
          </>
        ) : null}
        <Button type="button" onClick={() => void signOut()} size="sm">
          Sign out
        </Button>
      </aside>
    );
  }

  return (
    <aside
      className={
        variant === 'legacy'
          ? 'mb-6 rounded-md border border-border bg-surface p-4 text-sm text-surface-foreground'
          : 'rounded-md border border-border bg-surface p-5 text-sm text-surface-foreground'
      }
    >
      {variant === 'gate' && gateShowChrome ? (
        <>
          <h1 className="mb-2 text-2xl font-semibold leading-tight">
            {t('signInTitle')}
          </h1>
          <p className="mb-4 text-muted-foreground">{t('signInPrompt')}</p>
        </>
      ) : (
        <>
          <h2 className="mb-2 text-xl font-semibold leading-tight">
            Sign in (Supabase)
          </h2>
          <p className="mb-4 text-muted-foreground">
            Email one-time code. After sign-in, link your auth subject to the seeded
            demo volunteer (command shown above).
          </p>
        </>
      )}
      {step === 'email' ? (
        <form className="flex flex-col gap-3" onSubmit={(e) => void sendOtp(e)}>
          <label className="block text-xs font-medium text-muted-foreground">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <Button type="submit" disabled={busy}>
            {busy ? 'Sending…' : 'Send code'}
          </Button>
        </form>
      ) : (
        <form className="flex flex-col gap-3" onSubmit={(e) => void verifyOtp(e)}>
          <label className="block text-xs font-medium text-muted-foreground">
            Code from email
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="mt-1 block w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? 'Verifying…' : 'Verify code'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setStep('email');
                setOtp('');
                setMessage(null);
              }}
            >
              Use another email
            </Button>
          </div>
        </form>
      )}
      {message ? (
        <p className="mt-3 text-sm text-muted-foreground">{message}</p>
      ) : null}
      {error ? (
        <p role="alert" className="mt-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </aside>
  );
}
