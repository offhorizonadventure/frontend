"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, Check, Loader2, LockKeyhole } from "lucide-react";

import { PasswordForm } from "@/components/password-form";
import { createClient } from "@/utils/supabase/client";

type State = "checking" | "ready" | "invalid" | "done";

/**
 * Landing screen for the emailed recovery link.
 *
 * Supabase turns the link's token into a session on the client, so the page
 * waits for that before showing the form — otherwise the update would fail
 * with a confusing error. A link that's expired or already used leaves no
 * session, which is what the invalid state covers.
 */
export function ResetPasswordScreen() {
  const supabase = React.useMemo(() => createClient(), []);
  const [state, setState] = React.useState<State>("checking");

  React.useEffect(() => {
    let cancelled = false;

    // Fires once the recovery token in the URL has been exchanged.
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setState("ready");
      }
    });

    // Covers the case where the exchange finished before the listener
    // attached — common on a fast connection.
    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setState(data.session ? "ready" : "invalid");
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  if (state === "checking") {
    return (
      <div className="flex items-center gap-2 text-sm text-neutral-500">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Checking your link…
      </div>
    );
  }

  if (state === "invalid") {
    return (
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertCircle className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-950 uppercase italic">
          Link <span className="text-brand">Expired</span>
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          This reset link has already been used or has expired. Request a fresh
          one and it&apos;ll arrive in a moment.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Send a new link
        </Link>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Check className="size-5" aria-hidden="true" />
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-950 uppercase italic">
          Password <span className="text-brand">Updated</span>
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          You&apos;re signed in with your new password.
        </p>
        <Link
          href="/profile"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
        >
          Go to my account
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-brand/10 text-brand">
          <LockKeyhole className="size-5" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-950 uppercase italic">
          Set a New <span className="text-brand">Password</span>
        </h1>
        <p className="text-sm text-neutral-500">
          Choose something you haven&apos;t used before.
        </p>
      </div>

      <div className="mt-6">
        <PasswordForm
          submitLabel="Set Password"
          onDone={() => setState("done")}
        />
      </div>
    </div>
  );
}
