"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";

import { confirmPayment, startCheckout } from "@/app/actions/checkout";

const SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

type RazorpayHandlerResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayInstance = { open: () => void };

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

/** Loads Razorpay's checkout script once, on demand. */
function loadRazorpay(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SCRIPT_SRC}"]`
    );

    if (existing) {
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Pay button.
 *
 * Deliberately holds no price of its own: it asks the server to price the cart
 * and open an order, and the amount is whatever that order says. Nothing here
 * could change what the rider is charged even if the page were tampered with.
 */
export function RazorpayCheckout({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onPay() {
    setBusy(true);
    setError(null);

    const scriptReady = await loadRazorpay();
    if (!scriptReady) {
      setError("Could not reach the payment provider. Please try again.");
      setBusy(false);
      return;
    }

    const session = await startCheckout();
    if (!session.ok) {
      setError(session.error);
      setBusy(false);
      return;
    }

    if (!session.keyId) {
      setError("Payments aren't configured yet. Please call us to book.");
      setBusy(false);
      return;
    }

    const Razorpay = window.Razorpay;
    if (!Razorpay) {
      setError("Could not reach the payment provider. Please try again.");
      setBusy(false);
      return;
    }

    const checkout = new Razorpay({
      key: session.keyId,
      order_id: session.razorpayOrderId,
      amount: session.amountInPaise,
      currency: "INR",
      name: "BRB Expeditions",
      description: "Vehicle rental booking",
      prefill: {
        name: session.customerName,
        contact: session.customerPhone,
      },
      theme: { color: "#F15A24" },
      handler: async (response: RazorpayHandlerResponse) => {
        // The server re-verifies all of this against Razorpay's signature —
        // a forged response here gets rejected.
        const result = await confirmPayment({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });

        if (!result.ok) {
          setError(result.error);
          setBusy(false);
          return;
        }

        router.push("/my-bookings?booked=1");
        router.refresh();
      },
      modal: {
        // Reaching here means the rider backed out. The order stays unpaid and
        // the pending bookings are simply never confirmed.
        ondismiss: () => setBusy(false),
      },
    });

    checkout.open();
  }

  return (
    <div>
      <button
        type="button"
        onClick={onPay}
        disabled={busy || disabled}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {busy && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {busy ? "Opening payment…" : "Pay Securely"}
      </button>

      <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
        <ShieldCheck className="size-3.5 text-brand" aria-hidden="true" />
        Payments secured by Razorpay
      </p>

      {error && (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
