"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";

import { createClient } from "@/utils/supabase/client";

type Mode = "signin" | "signup";

/** Only used to catch typos early; the real check is Supabase's. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

/** Keeps the post-login redirect on this site — an open redirect otherwise. */
function safeNext(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/profile";
  }
  return value;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = React.useMemo(() => createClient(), []);

  const next = safeNext(searchParams.get("next"));
  const [mode, setMode] = React.useState<Mode>("signin");

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [mobile, setMobile] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);

  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setError(null);
    setNotice(null);
    setPassword("");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_RE.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }

      // Needed to reach the rider about a booking. Loose on format — riders
      // write numbers every which way, and this isn't a credential, so a
      // rejected sign-up over a space or a dash would be pure friction.
      const digits = mobile.replace(/\D/g, "");
      if (digits.length < 10) {
        setError("Please enter a valid phone number.");
        return;
      }
    }

    setPending(true);

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      setPending(false);

      if (signInError) {
        // Supabase returns the same message for a wrong password and an
        // unknown address, which is what we want — it stops the form being
        // used to discover which emails have accounts.
        setError("That email or password isn't right.");
        return;
      }

      router.push(next);
      router.refresh();
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        // Read by the handle_new_user trigger to fill in the profile row. The
        // phone number is contact detail for the booking, not a credential.
        data: {
          name: name.trim(),
          mobile: mobile.trim(),
          role: "customer",
        },
      },
    });

    setPending(false);

    if (signUpError) {
      setError(
        signUpError.message.toLowerCase().includes("already")
          ? "An account with that email already exists. Try signing in."
          : signUpError.message
      );
      return;
    }

    // With email confirmation switched on, Supabase returns a user but no
    // session — nothing to redirect to until they click the link.
    if (data.session) {
      router.push(next);
      router.refresh();
      return;
    }

    setNotice(
      "Check your inbox to confirm your email address, then sign in."
    );
    setMode("signin");
    setPassword("");
  }

  const field =
    "w-full rounded-lg border border-neutral-300 py-2.5 pr-3 pl-10 text-sm text-neutral-950 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none";

  return (
    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand">
          {mode === "signin" ? (
            <LockKeyhole className="size-5" aria-hidden="true" />
          ) : (
            <UserRound className="size-5" aria-hidden="true" />
          )}
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-950 uppercase italic">
          {mode === "signin" ? (
            <>
              Sign <span className="text-brand">In</span>
            </>
          ) : (
            <>
              Create <span className="text-brand">Account</span>
            </>
          )}
        </h1>
        <p className="text-sm text-neutral-500">
          {mode === "signin"
            ? "Sign in with your email to manage your bookings."
            : "A few details and you're ready to book."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        {mode === "signup" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-semibold text-neutral-950">
              Full name
            </label>
            <div className="relative">
              <UserRound
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />
              <input
                id="name"
                type="text"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Surya Thakur"
                className={field}
                disabled={pending}
              />
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-neutral-950">
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
              className={field}
              disabled={pending}
            />
          </div>
        </div>

        {mode === "signup" && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="mobile"
              className="text-sm font-semibold text-neutral-950"
            >
              Phone number
            </label>
            <div className="relative">
              <Phone
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
                aria-hidden="true"
              />
              <input
                id="mobile"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+91 98765 43210"
                className={field}
                disabled={pending}
              />
            </div>
            <p className="text-xs text-neutral-500">
              We need this to reach you about your booking. You still sign in
              with your email.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="password"
            className="text-sm font-semibold text-neutral-950"
          >
            Password
          </label>
          <div className="relative">
            <LockKeyhole
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
              aria-hidden="true"
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              required
              minLength={MIN_PASSWORD}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`${field} pr-10`}
              disabled={pending}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-950"
            >
              {showPassword ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
          {mode === "signup" && (
            <p className="text-xs text-neutral-500">
              At least {MIN_PASSWORD} characters.
            </p>
          )}
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

        {notice && (
          <p className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-800">
            <Check className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-neutral-600">
        {mode === "signin" ? (
          <>
            New here?{" "}
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className="font-semibold text-brand transition-colors hover:text-brand-dark"
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="font-semibold text-brand transition-colors hover:text-brand-dark"
            >
              Sign in
            </button>
          </>
        )}
      </p>

      <p className="mt-4 text-center text-xs text-neutral-400">
        By continuing you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-2">
          terms
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          privacy policy
        </Link>
        .
      </p>
    </div>
  );
}
