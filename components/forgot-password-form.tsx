"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, Check, Loader2, Mail } from "lucide-react";

import { createClient } from "@/utils/supabase/client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordForm() {
  const supabase = React.useMemo(() => createClient(), []);
  const [email, setEmail] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }

    setPending(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      trimmed,
      {
        // Where the emailed link lands. Supabase appends the recovery token.
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );
    setPending(false);

    if (resetError) {
      setError("Could not send the reset email. Please try again.");
      return;
    }

    // Shown whether or not the address exists — otherwise this form becomes a
    // way to find out which emails have accounts.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-950 uppercase italic">
          Check Your <span className="text-brand">Inbox</span>
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          If an account exists for <strong>{email.trim()}</strong>, we&apos;ve
          sent a link to reset your password. It expires in an hour.
        </p>
        <p className="mt-3 text-xs text-neutral-500">
          Nothing arrived? Check your spam folder, or try again in a few
          minutes.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:border-neutral-950"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand">
          <Mail className="size-5" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-950 uppercase italic">
          Forgot <span className="text-brand">Password</span>
        </h1>
        <p className="text-sm text-neutral-500">
          Enter your email and we&apos;ll send you a link to set a new one.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-sm font-semibold text-neutral-950"
          >
            Email
          </label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
              aria-hidden="true"
            />
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={pending}
              className="w-full rounded-lg border border-neutral-300 py-2.5 pr-3 pl-10 text-sm text-neutral-950 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700"
          >
            <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Send Reset Link
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-neutral-600">
        Remembered it?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
