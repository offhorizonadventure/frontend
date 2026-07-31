"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Phone, ShieldCheck, UserRound } from "lucide-react";

import { createClient } from "@/utils/supabase/client";
import {
  COUNTRY_CODES,
  DEFAULT_COUNTRY,
  normaliseLocalNumber,
  toE164,
} from "@/lib/country-codes";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = React.useMemo(() => createClient(), []);

  const [step, setStep] = React.useState<"phone" | "otp" | "profile">("phone");
  const [dial, setDial] = React.useState(DEFAULT_COUNTRY.dial);
  const [localNumber, setLocalNumber] = React.useState("");
  const [otp, setOtp] = React.useState("");
  const [name, setName] = React.useState("");
  const [userId, setUserId] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resendIn, setResendIn] = React.useState(0);

  const phone = toE164(dial, localNumber);
  const digits = normaliseLocalNumber(localNumber);

  // Resend cooldown
  React.useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  async function sendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (digits.length < 6) {
      setError("Enter a valid phone number.");
      return;
    }

    setPending(true);
    // Mirrors the admin createUser() call in the backend: the same metadata
    // keys feed handle_new_user(), so a rider signing up here gets the same
    // profile shape as one created from the dashboard. `data` is only applied
    // when the auth user is first created.
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone,
      options: {
        data: { mobile: phone, role: "customer" },
      },
    });
    setPending(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setStep("otp");
    setResendIn(RESEND_SECONDS);
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (otp.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code.`);
      return;
    }

    setPending(true);
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    if (verifyError) {
      setPending(false);
      setError(verifyError.message);
      return;
    }

    // First-time riders land here with an empty profile name (created by the
    // handle_new_user trigger), so ask for it before sending them on.
    const signedInId = data.user?.id ?? null;
    if (signedInId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", signedInId)
        .maybeSingle();

      if (!profile?.name) {
        setUserId(signedInId);
        setPending(false);
        setStep("profile");
        return;
      }
    }

    setPending(false);
    goNext();
  }

  function goNext() {
    const next = searchParams.get("next") || "/profile";
    router.push(next);
    router.refresh();
  }

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setError("Please enter your full name.");
      return;
    }
    if (!userId) {
      goNext();
      return;
    }

    setPending(true);
    // upsert, not update: handle_new_user() normally creates the row at signup,
    // but an UPDATE against a missing row affects zero rows and still reports
    // success — silently losing the name.
    const { data, error: saveError } = await supabase
      .from("profiles")
      .upsert({ id: userId, name: trimmed, mobile: phone }, { onConflict: "id" })
      .select("id")
      .maybeSingle();
    setPending(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }
    if (!data) {
      setError("Could not save your details. Please try again.");
      return;
    }

    goNext();
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
            {step === "phone" ? (
              <Phone className="size-5" aria-hidden="true" />
            ) : step === "otp" ? (
              <ShieldCheck className="size-5" aria-hidden="true" />
            ) : (
              <UserRound className="size-5" aria-hidden="true" />
            )}
          </span>
          <h1 className="text-2xl font-extrabold tracking-tight text-neutral-950 uppercase italic">
            {step === "phone" ? (
              <>
                Sign <span className="text-brand">In</span>
              </>
            ) : step === "otp" ? (
              <>
                Verify Your <span className="text-brand">Number</span>
              </>
            ) : (
              <>
                Almost <span className="text-brand">There</span>
              </>
            )}
          </h1>
          <p className="text-sm text-neutral-500">
            {step === "phone"
              ? "We'll text you a one-time code and no password needed."
              : step === "otp"
                ? `Enter the ${OTP_LENGTH}-digit code sent to ${phone}`
                : "Tell us your name to finish setting up your account."}
          </p>
        </div>

        {step === "phone" ? (
          <form onSubmit={sendOtp} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-neutral-800"
              >
                Phone number
              </label>
              <div className="flex gap-2">
                <select
                  aria-label="Country code"
                  value={dial}
                  onChange={(e) => setDial(e.target.value)}
                  disabled={pending}
                  className="rounded-md border border-neutral-300 bg-white px-2 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
                >
                  {COUNTRY_CODES.map((country) => (
                    <option key={country.iso} value={country.dial}>
                      {country.dial}
                    </option>
                  ))}
                </select>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="9623300012"
                  value={localNumber}
                  onChange={(e) =>
                    setLocalNumber(normaliseLocalNumber(e.target.value))
                  }
                  disabled={pending}
                  className="flex-1 rounded-md border border-neutral-300 px-3 py-2.5 text-sm focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Send Code
            </button>
          </form>
        ) : step === "profile" ? (
          <form onSubmit={saveName} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="signup-name"
                className="text-sm font-medium text-neutral-800"
              >
                Full name
              </label>
              <input
                id="signup-name"
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
                Use the name on your ID and it goes on your rental agreement.
              </p>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Finish
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="otp"
                className="text-sm font-medium text-neutral-800"
              >
                Verification code
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={OTP_LENGTH}
                placeholder="______"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH))
                }
                disabled={pending}
                autoFocus
                className="rounded-md border border-neutral-300 px-3 py-3 text-center text-lg font-semibold tracking-[0.4em] focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
            >
              {pending && <Loader2 className="size-4 animate-spin" />}
              Verify & Continue
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => {
                  setStep("phone");
                  setOtp("");
                  setError(null);
                }}
                disabled={pending}
                className="inline-flex items-center gap-1 text-neutral-500 transition-colors hover:text-neutral-950"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
                Change number
              </button>

              <button
                type="button"
                onClick={() => sendOtp()}
                disabled={pending || resendIn > 0}
                className="font-medium text-brand transition-colors hover:text-brand-dark disabled:text-neutral-400"
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-neutral-500">
        By continuing you agree to our terms and privacy policy.
      </p>
    </div>
  );
}
