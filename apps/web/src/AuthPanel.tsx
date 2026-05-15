import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getSupabaseClient } from './supabaseClient';

type AuthPanelProps = {
  variant?: 'legacy' | 'gate';
  /** When variant is gate, set false to omit the title block (e.g. profile-not-linked page). */
  gateShowChrome?: boolean;
  /** After successful OTP verify — e.g. refresh app auth state. */
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
      <aside
        style={{
          marginBottom: 24,
          padding: 16,
          border: '1px solid #fde68a',
          borderRadius: 8,
          background: '#fffbeb',
          fontSize: 14,
        }}
      >
        <strong>Supabase not configured.</strong> Copy{' '}
        <code>apps/web/.env.example</code> → <code>apps/web/.env</code> and set{' '}
        <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code>{' '}
        from your Supabase project (see{' '}
        <code>docs/runbooks/supabase-auth-local.md</code>).
      </aside>
    );
  }

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
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
    await supabase.auth.signOut();
    setMessage(null);
    setError(null);
  }

  if (userId) {
    return (
      <aside
        style={{
          marginBottom: variant === 'legacy' ? 24 : 0,
          padding: 16,
          border: '1px solid #bbf7d0',
          borderRadius: 8,
          background: '#f0fdf4',
          fontSize: 14,
        }}
      >
        <p style={{ margin: '0 0 8px' }}>
          <strong>Signed in</strong> as {emailDisplay ?? 'user'}
        </p>
        {variant === 'legacy' ? (
          <>
            <p style={{ margin: '0 0 8px', wordBreak: 'break-all' }}>
              Auth subject (<code>sub</code>): <code>{userId}</code>
            </p>
            <p style={{ margin: '0 0 12px', color: '#166534' }}>
              Link the demo volunteer once (from repo root, with Postgres running):
            </p>
            <pre
              style={{
                margin: '0 0 12px',
                padding: 12,
                background: '#fff',
                borderRadius: 6,
                fontSize: 12,
                overflow: 'auto',
              }}
            >
              {`pnpm link:volunteer-auth ${userId}`}
            </pre>
          </>
        ) : null}
        <button
          type="button"
          onClick={() => void signOut()}
          style={{ padding: '6px 12px', cursor: 'pointer' }}
        >
          Sign out
        </button>
      </aside>
    );
  }

  return (
    <aside
      style={{
        marginBottom: variant === 'legacy' ? 24 : 0,
        padding: 16,
        border: '1px solid #e5e7eb',
        borderRadius: 8,
        background: '#f9fafb',
        fontSize: 14,
      }}
    >
      {variant === 'gate' && gateShowChrome ? (
        <>
          <h1
            className="font-display text-xl font-bold uppercase tracking-tight"
            style={{ margin: '0 0 8px' }}
          >
            {t('signInTitle')}
          </h1>
          <p style={{ margin: '0 0 12px', color: '#555' }}>{t('signInPrompt')}</p>
        </>
      ) : (
        <>
          <h2 style={{ margin: '0 0 8px', fontSize: 16 }}>Sign in (Supabase)</h2>
          <p style={{ margin: '0 0 12px', color: '#555' }}>
            Email one-time code. After sign-in, link your auth subject to the seeded
            demo volunteer (command shown above).
          </p>
        </>
      )}
      {step === 'email' ? (
        <form onSubmit={(e) => void sendOtp(e)}>
          <label style={{ display: 'block' }}>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            style={{ marginTop: 12, padding: '8px 14px', cursor: busy ? 'wait' : 'pointer' }}
          >
            {busy ? 'Sending…' : 'Send code'}
          </button>
        </form>
      ) : (
        <form onSubmit={(e) => void verifyOtp(e)}>
          <label style={{ display: 'block' }}>
            Code from email
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 4 }}
            />
          </label>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <button
              type="submit"
              disabled={busy}
              style={{ padding: '8px 14px', cursor: busy ? 'wait' : 'pointer' }}
            >
              {busy ? 'Verifying…' : 'Verify code'}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep('email');
                setOtp('');
                setMessage(null);
              }}
              style={{ padding: '8px 14px', cursor: 'pointer' }}
            >
              Use another email
            </button>
          </div>
        </form>
      )}
      {message ? (
        <p style={{ marginTop: 12, marginBottom: 0, color: '#166534' }}>{message}</p>
      ) : null}
      {error ? (
        <p role="alert" style={{ marginTop: 12, marginBottom: 0, color: '#991b1b' }}>
          {error}
        </p>
      ) : null}
    </aside>
  );
}
