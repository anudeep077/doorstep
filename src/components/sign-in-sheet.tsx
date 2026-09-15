"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { PhoneIcon } from "./icons";
import { Wordmark } from "./logo";
import { Sheet } from "./sheet";

type Channel = "email" | "phone";
type Step = "choose" | "sent" | "code";

/**
 * Sign in with Google (OAuth redirect), a magic link by email, or a
 * one-time code by SMS.
 *
 * Email uses a *link* rather than a code because Supabase's default email
 * template only contains a link (editing templates needs custom SMTP).
 * The link returns to /auth/callback which completes the session. A code
 * entry is still offered ("I have a code") for projects that do configure
 * SMTP with a `{{ .Token }}` template. Phone always uses a code and needs
 * an SMS provider configured in Supabase.
 */
export function SignInSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [channel, setChannel] = useState<Channel>("email");
  const [step, setStep] = useState<Step>("choose");
  const [identity, setIdentity] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const configured = hasSupabaseEnv();

  const reset = () => {
    setStep("choose");
    setCode("");
    setError(null);
    setBusy(false);
  };
  const close = () => {
    reset();
    onClose();
  };

  const google = async () => {
    setBusy(true);
    setError(null);
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}` },
    });
    if (error) {
      setError(error.message);
      setBusy(false);
    }
  };

  const normalisedPhone = () => {
    const d = identity.replace(/[^\d+]/g, "");
    // Default to India when no country code was typed.
    return d.startsWith("+") ? d : `+91${d}`;
  };

  const sendCode = async () => {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } =
      channel === "email"
        ? await supabase.auth.signInWithOtp({
            email: identity.trim(),
            options: {
              shouldCreateUser: true,
              // The magic link comes back here; the callback exchanges it
              // for a session and returns the user to this page.
              emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(window.location.pathname)}`,
            },
          })
        : await supabase.auth.signInWithOtp({ phone: normalisedPhone() });
    setBusy(false);
    if (error) return setError(error.message);
    setStep(channel === "email" ? "sent" : "code");
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } =
      channel === "email"
        ? await supabase.auth.verifyOtp({ email: identity.trim(), token: code.trim(), type: "email" })
        : await supabase.auth.verifyOtp({ phone: normalisedPhone(), token: code.trim(), type: "sms" });
    setBusy(false);
    if (error) return setError(error.message);
    close();
  };

  const identityValid =
    channel === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity.trim()) : identity.replace(/\D/g, "").length >= 10;

  return (
    <Sheet open={open} onClose={close} title={step === "code" ? "Enter the code" : step === "sent" ? "Check your email" : "Sign in"}>
      {!configured && (
        <p className="mb-4 rounded-xl bg-brand/10 px-3 py-2 text-sm">
          Sign-in needs Supabase credentials in <code>.env.local</code>. Everything else works in guest mode.
        </p>
      )}

      {step === "choose" ? (
        <div className="space-y-4">
          <div className="flex justify-center py-1">
            <Wordmark size={32} />
          </div>
          <button
            type="button"
            onClick={google}
            disabled={!configured || busy}
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-line bg-surface py-3 font-semibold hover:bg-line/40 disabled:opacity-50"
          >
            <GoogleMark />
            Continue with Google
          </button>

          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-line" />
            or
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="grid grid-cols-2 rounded-xl bg-line/60 p-1 text-sm font-medium" role="tablist">
            {(["email", "phone"] as const).map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={channel === c}
                onClick={() => {
                  setChannel(c);
                  setIdentity("");
                  setError(null);
                }}
                className={`rounded-lg py-1.5 capitalize ${channel === c ? "bg-surface shadow-sm" : "text-muted"}`}
              >
                {c}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">{channel === "email" ? "Email address" : "Phone number"}</span>
            <div className="relative">
              {channel === "phone" && <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" width={18} height={18} />}
              <input
                type={channel === "email" ? "email" : "tel"}
                inputMode={channel === "email" ? "email" : "tel"}
                autoComplete={channel === "email" ? "email" : "tel"}
                placeholder={channel === "email" ? "you@example.com" : "+91 98765 43210"}
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && identityValid && sendCode()}
                className={`w-full rounded-2xl border border-line bg-background py-3 pr-3 outline-none focus:border-brand ${channel === "phone" ? "pl-10" : "pl-3"}`}
              />
            </div>
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="button"
            onClick={sendCode}
            disabled={!configured || busy || !identityValid}
            className="w-full rounded-2xl bg-brand py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Sending…" : "Send code"}
          </button>
          <p className="text-center text-[11px] text-muted">
            {channel === "email" ? "We'll email you a sign-in link. No password needed." : "We'll text you a one-time code. No password needed."}
          </p>
        </div>
      ) : step === "sent" ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-veg/10 p-4 text-sm">
            <p>
              We sent a sign-in link to <span className="font-semibold">{identity.trim()}</span>. Open it on this device and you&apos;ll be
              signed in automatically.
            </p>
            <p className="mt-2 text-xs text-muted">Not there? Check spam. The link expires after a while and works once.</p>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="button" onClick={sendCode} disabled={busy} className="w-full rounded-2xl border border-line py-3 font-semibold hover:bg-line/40 disabled:opacity-50">
            {busy ? "Sending…" : "Resend link"}
          </button>
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={reset} className="font-medium text-brand">
              Use a different email
            </button>
            <button type="button" onClick={() => setStep("code")} className="font-medium text-muted hover:text-foreground">
              I have a code instead
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Sent to <span className="font-semibold text-foreground">{channel === "email" ? identity.trim() : normalisedPhone()}</span>.{" "}
            <button type="button" onClick={reset} className="font-medium text-brand">
              Change
            </button>
          </p>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={8}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            onKeyDown={(e) => e.key === "Enter" && code.length >= 6 && verify()}
            autoFocus
            className="w-full rounded-2xl border border-line bg-background py-3 text-center text-2xl font-bold tracking-[0.4em] outline-none focus:border-brand"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="button"
            onClick={verify}
            disabled={busy || code.length < 6}
            className="w-full rounded-2xl bg-brand py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "Checking…" : "Verify & sign in"}
          </button>
          <button type="button" onClick={sendCode} disabled={busy} className="w-full py-2 text-sm font-medium text-muted">
            Resend code
          </button>
        </div>
      )}
    </Sheet>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.85.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.29-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.59-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
