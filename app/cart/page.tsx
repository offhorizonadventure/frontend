import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Headset,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";

import { CartGearPicker } from "@/components/cart-gear-picker";
import { CartItemRow } from "@/components/cart-item-row";
import { CouponForm } from "@/components/coupon-form";
import { getCartSummary, getGearOptions } from "@/lib/cart";
import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/locations";
import { requireUser } from "@/utils/supabase/require-user";

export const metadata: Metadata = {
  title: "Your Cart | BRB Expeditions",
  description:
    "Review the vehicles you've saved, add riding gear, apply a coupon and continue to booking.",
  // A personal page — keep it out of the index.
  robots: { index: false, follow: false },
};

function formatMoney(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default async function CartPage() {
  // Carts are per-rider and live in the database, so this page always
  // requires a verified session — middleware alone is not enough.
  await requireUser("/cart");

  const [cart, gearOptions] = await Promise.all([
    getCartSummary(),
    getGearOptions(),
  ]);

  const { items, gear, coupon } = cart;
  const isEmpty = items.length === 0 && gear.length === 0;

  return (
    <main className="flex-1 bg-neutral-50">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
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
            <li className="font-medium text-neutral-950">Cart</li>
          </ol>
        </nav>

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-3xl">
          Your <span className="text-brand">Cart</span>
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          {isEmpty
            ? "Nothing saved yet."
            : `${items.length} vehicle${items.length === 1 ? "" : "s"} saved for your trip.`}
        </p>

        {isEmpty ? (
          <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-10 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-neutral-50 text-neutral-400">
              <ShoppingCart className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-4 text-base font-semibold text-neutral-950">
              Your cart is empty
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
              Browse the fleet and add the vehicles you want and you can hold more
              than one and sort out the dates here.
            </p>
            <Link
              href="/vehicles"
              className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Explore Vehicles
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] lg:gap-8">
            <div className="flex flex-col gap-5">
              {items.length > 0 && (
                <ul className="flex flex-col gap-4">
                  {items.map((item) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </ul>
              )}

              <CartGearPicker options={gearOptions} selected={gear} />
            </div>

            <aside className="lg:sticky lg:top-28 lg:h-fit">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
                <h2 className="text-sm font-bold tracking-wide text-neutral-950 uppercase">
                  Order <span className="text-brand">Summary</span>
                </h2>

                <dl className="mt-4 flex flex-col gap-2.5 text-sm">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 text-neutral-600"
                    >
                      <dt className="min-w-0 truncate">
                        {item.name}
                        <span className="text-neutral-400"> × {item.days}d</span>
                      </dt>
                      <dd className="whitespace-nowrap">
                        {formatMoney(item.subtotal)}
                      </dd>
                    </div>
                  ))}

                  {gear.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 text-neutral-600"
                    >
                      <dt className="min-w-0 truncate">
                        {item.name}
                        <span className="text-neutral-400">
                          {" "}
                          × {item.quantity} × {item.days}d
                        </span>
                      </dt>
                      <dd className="whitespace-nowrap">
                        {formatMoney(item.subtotal)}
                      </dd>
                    </div>
                  ))}

                  {cart.discount > 0 && coupon && (
                    <div className="flex items-center justify-between border-t border-neutral-200 pt-3 font-semibold text-emerald-700">
                      <dt>Discount ({coupon.code})</dt>
                      <dd>−{formatMoney(cart.discount)}</dd>
                    </div>
                  )}

                  <div
                    className={`flex items-center justify-between text-neutral-600 ${
                      cart.discount > 0 ? "" : "border-t border-neutral-200 pt-3"
                    }`}
                  >
                    <dt>Security deposit</dt>
                    <dd>
                      {cart.depositTotal > 0
                        ? formatMoney(cart.depositTotal)
                        : "—"}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between border-t border-neutral-200 pt-3 text-lg font-extrabold text-neutral-950">
                    <dt>Total</dt>
                    <dd>{formatMoney(cart.total)}</dd>
                  </div>
                </dl>

                <CouponForm coupon={coupon} />

                <p className="mt-4 flex items-start gap-2 rounded-lg bg-neutral-50 px-3 py-2.5 text-xs text-neutral-500">
                  <ReceiptText
                    className="mt-px size-3.5 shrink-0 text-brand"
                    aria-hidden="true"
                  />
                  {cart.depositPending > 0
                    ? "Pick a route on each vehicle to see its refundable deposit. It's collected with the booking and returned after the trip."
                    : "The security deposit is collected with the booking and refunded after the vehicle is returned."}
                </p>

                <Link
                  href="/checkout"
                  className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark"
                >
                  Proceed To Booking
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>

                <Link
                  href="/vehicles"
                  className="mt-2.5 flex items-center justify-center rounded-lg border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:border-neutral-950"
                >
                  Continue Browsing
                </Link>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-neutral-500">
                  <ShieldCheck className="size-3.5 text-brand" aria-hidden="true" />
                  Payments secured by Razorpay
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
                <h2 className="text-sm font-bold text-neutral-950">
                  Questions about your trip?
                </h2>
                <a
                  href={SUPPORT_PHONE_HREF}
                  className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:border-neutral-950"
                >
                  <Headset className="size-4 text-brand" aria-hidden="true" />
                  {SUPPORT_PHONE}
                </a>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
