"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { createClient } from "@/utils/supabase/client";

export function ProfileForm({
  userId,
  initialName,
  initialMobile,
  email,
  redirectTo = "/profile",
  submitLabel = "Save changes",
  onCancel = true,
}: {
  userId: string;
  initialName: string;
  initialMobile: string;
  /** Shown read-only: it's the login identity, changed via account settings. */
  email: string;
  redirectTo?: string;
  submitLabel?: string;
  onCancel?: boolean;
}) {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [name, setName] = React.useState(initialName);
  const [mobile, setMobile] = React.useState(initialMobile);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (mobile.replace(/\D/g, "").length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    setPending(true);
    // upsert, not update: an UPDATE against a missing row affects zero rows and
    // still reports success, which silently loses the name. Only `name` and
    // `mobile` are sent — role/verified/blocked are forced server-side by the
    // protect_profile_columns trigger.
    const { data, error: saveError } = await supabase
      .from("profiles")
      .upsert(
        { id: userId, name: trimmed, mobile: mobile.trim() },
        { onConflict: "id" }
      )
      .select("id")
      .maybeSingle();
    setPending(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }
    // Belt and braces: if RLS filtered the write, nothing comes back.
    if (!data) {
      setError("Could not save your details. Please try again.");
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="text-sm font-medium text-neutral-800">
          Full name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="e.g. Niteesh Bharadwaj"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={pending}
          autoFocus
          className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
        />
        <p className="text-xs text-neutral-500">
          This appears on your rental agreement, so use the name on your ID.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="mobile" className="text-sm font-medium text-neutral-800">
          Phone number
        </label>
        <input
          id="mobile"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+91 98765 43210"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          disabled={pending}
          required
          className="rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
        />
        <p className="text-xs text-neutral-500">
          How we reach you about a booking. You sign in with your email.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-neutral-800">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          readOnly
          disabled
          className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm text-neutral-500"
        />
        <p className="text-xs text-neutral-500">
          This is your sign-in address. Contact us if you need it changed.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
        >
          {pending && <Loader2 className="size-4 animate-spin" />}
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={() => router.push("/profile")}
            disabled={pending}
            className="rounded-md border border-neutral-300 px-6 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-950 hover:text-neutral-950"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
