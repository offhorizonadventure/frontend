"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";

import { createClient } from "@/utils/supabase/client";

const MIN_PASSWORD = 8;

/**
 * Sets a new password.
 *
 * Used both by the emailed recovery link (where Supabase has already put a
 * temporary session in place) and by a signed-in rider changing their
 * password. Either way the update goes through the current session, so a
 * recovery link can only ever change the account it was issued for.
 */
export function PasswordForm({
  redirectTo,
  submitLabel = "Update Password",
  onDone,
}: {
  redirectTo?: string;
  submitLabel?: string;
  onDone?: () => void;
}) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`);
      return;
    }

    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }

    setPending(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateError) {
      // Supabase enforces its own strength rules, so its message is more
      // useful here than anything generic we'd write.
      setError(updateError.message);
      return;
    }

    if (onDone) onDone();
    if (redirectTo) {
      router.push(redirectTo);
      router.refresh();
    }
  }

  const field =
    "w-full rounded-lg border border-neutral-300 py-2.5 pr-10 pl-10 text-sm text-neutral-950 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="new-password"
          className="text-sm font-semibold text-neutral-950"
        >
          New password
        </label>
        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            id="new-password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={pending}
            className={field}
          />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-950"
          >
            {show ? (
              <EyeOff className="size-4" aria-hidden="true" />
            ) : (
              <Eye className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
        <p className="text-xs text-neutral-500">
          At least {MIN_PASSWORD} characters.
        </p>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="confirm-password"
          className="text-sm font-semibold text-neutral-950"
        >
          Confirm password
        </label>
        <div className="relative">
          <LockKeyhole
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-neutral-400"
            aria-hidden="true"
          />
          <input
            id="confirm-password"
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            disabled={pending}
            className={field}
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
        {submitLabel}
      </button>
    </form>
  );
}
