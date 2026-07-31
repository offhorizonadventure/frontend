import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronRight,
  MapPin,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";

import { RazorpayCheckout } from "@/components/razorpay-checkout";
import { getCartSummary } from "@/lib/cart";
import { requireCompleteProfile } from "@/utils/supabase/require-user";

export const metadata: Metadata = {
  title: "Checkout | BRB Expeditions",
  description: "Review your booking and pay securely.",
  robots: { index: false, follow: false },
};

function formatMoney(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function CheckoutPage() {
  // A name is needed on the Razorpay order and the booking, so an incomplete
  // profile is sent to finish signing up rather than failing at payment.
  const { profile } = await requireCompleteProfile("/checkout");
  const cart = await getCartSummary();

  if (cart.items.length === 0) {
    redirect("/cart");
  }

  const needsRoute = cart.depositPending > 0;

  return (
    <main className="flex-1 bg-neutral-50">
      <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-xs text-neutral-500 sm:text-sm">
            <li>
              <Link href="/" className="transition-colors hover:text-brand">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li>
              <Link href="/cart" className="transition-colors hover:text-brand">
                Cart
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li className="font-medium text-neutral-950">Checkout</li>
          </ol>
        </nav>

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-3xl">
          Secure <span className="text-brand">Checkout</span>
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Booking as {profile.name} · {profile.mobile}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-8">
          {/* Review */}
          <section
            aria-labelledby="review-heading"
            className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6"
          >
            <h2
              id="review-heading"
              className="text-sm font-bold tracking-wide text-neutral-950 uppercase"
            >
              Your <span className="text-brand">Booking</span>
            </h2>

            <ul className="mt-4 flex flex-col divide-y divide-neutral-100">
              {cart.items.map((item) => (
                <li key={item.id} className="flex flex-col gap-1 py-4 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-neutral-950">
                      {item.name}
                    </p>
                    <p className="text-sm font-bold whitespace-nowrap text-neutral-950">
                      {formatMoney(item.subtotal)}
                    </p>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {formatDate(item.startDate)} – {formatDate(item.endDate)} ·{" "}
                    {item.days} {item.days === 1 ? "day" : "days"}
                  </p>
                  <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <MapPin className="size-3.5 text-brand" aria-hidden="true" />
                    {item.location ?? "Route not chosen"}
                    {item.securityDeposit !== null && (
                      <span className="text-neutral-400">
                        · {formatMoney(item.securityDeposit)} deposit
                      </span>
                    )}
                  </p>
                </li>
              ))}

              {cart.gear.map((gear) => (
                <li
                  key={gear.id}
                  className="flex items-start justify-between gap-3 py-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-neutral-950">
                      {gear.name}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {gear.quantity} × {gear.days}{" "}
                      {gear.days === 1 ? "day" : "days"}
                    </p>
                  </div>
                  <p className="text-sm font-bold whitespace-nowrap text-neutral-950">
                    {formatMoney(gear.subtotal)}
                  </p>
                </li>
              ))}
            </ul>

            <Link
              href="/cart"
              className="mt-2 inline-flex text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
            >
              Edit cart
            </Link>
          </section>

          {/* Pay */}
          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
              <h2 className="text-sm font-bold tracking-wide text-neutral-950 uppercase">
                Amount <span className="text-brand">Payable</span>
              </h2>

              <dl className="mt-4 flex flex-col gap-2.5 text-sm">
                <div className="flex items-center justify-between text-neutral-600">
                  <dt>Vehicle hire</dt>
                  <dd>{formatMoney(cart.vehicleTotal)}</dd>
                </div>

                {cart.gearTotal > 0 && (
                  <div className="flex items-center justify-between text-neutral-600">
                    <dt>Riding gear</dt>
                    <dd>{formatMoney(cart.gearTotal)}</dd>
                  </div>
                )}

                {cart.discount > 0 && cart.coupon && (
                  <div className="flex items-center justify-between font-semibold text-emerald-700">
                    <dt>Discount ({cart.coupon.code})</dt>
                    <dd>−{formatMoney(cart.discount)}</dd>
                  </div>
                )}

                <div className="flex items-center justify-between text-neutral-600">
                  <dt>Security deposit</dt>
                  <dd>{formatMoney(cart.depositTotal)}</dd>
                </div>

                <div className="mt-1 flex items-center justify-between border-t border-neutral-200 pt-3 text-lg font-extrabold text-neutral-950">
                  <dt>Total</dt>
                  <dd>{formatMoney(cart.total)}</dd>
                </div>
              </dl>

              <p className="mt-3 flex items-start gap-2 rounded-lg bg-neutral-50 px-3 py-2.5 text-xs text-neutral-500">
                <ReceiptText
                  className="mt-px size-3.5 shrink-0 text-brand"
                  aria-hidden="true"
                />
                The security deposit is refundable and returned after the
                vehicle is handed back.
              </p>

              {needsRoute ? (
                <div className="mt-5">
                  <p
                    role="alert"
                    className="rounded-lg bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-800"
                  >
                    Choose a route for every vehicle in your cart so we can
                    price the deposit.
                  </p>
                  <Link
                    href="/cart"
                    className="mt-3 flex items-center justify-center rounded-lg border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:border-neutral-950"
                  >
                    Back To Cart
                  </Link>
                </div>
              ) : (
                <div className="mt-5">
                  <RazorpayCheckout />
                </div>
              )}
            </div>

            <p className="mt-4 flex items-start gap-2 px-1 text-xs text-neutral-500">
              <ShieldCheck
                className="mt-px size-3.5 shrink-0 text-brand"
                aria-hidden="true"
              />
              Your card and UPI details go straight to Razorpay. They never
              touch our servers.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
