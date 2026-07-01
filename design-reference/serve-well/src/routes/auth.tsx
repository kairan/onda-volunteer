import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Loader2, CheckCircle2, FlaskConical } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ensureTestUser, TEST_USER_EMAIL, TEST_USER_PASSWORD } from "@/lib/seed-test-user.functions";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [testing, setTesting] = useState(false);

  async function handleTestLogin() {
    setTesting(true);
    try {
      await ensureTestUser();
      const { error } = await supabase.auth.signInWithPassword({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      });
      if (error) throw error;
      toast.success("Signed in as test user");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test login failed");
    } finally {
      setTesting(false);
    }
  }

  useEffect(() => {
    if (!loading && session) navigate({ to: "/" });
  }, [loading, session, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSent(true);
    toast.success("Magic link sent — check your inbox.");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 font-sans">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Onda</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with your email — we'll send you a secure link to access your account.
          </p>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We've sent a magic link to <span className="font-medium text-foreground">{email}</span>.
              Click the link in the email to sign in.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="you@church.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={sending}>
              {sending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending link…
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send magic link
                </>
              )}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              No passwords. We'll email you a single-use sign-in link.
            </p>
          </form>
        )}

        <div className="mt-6 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleTestLogin}
            disabled={testing}
          >
            {testing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FlaskConical className="mr-2 h-4 w-4" />
            )}
            Sign in as test user
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {TEST_USER_EMAIL} · for development only
          </p>
        </div>
      </div>
    </div>
  );
}
