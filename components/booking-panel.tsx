"use client";

import * as React from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CalendarDays,
  Check,
  Loader2,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";

import { addToCart, type CartActionResult } from "@/app/actions/cart";
import { LOCATIONS } from "@/lib/cart-constants";

const ASSURANCES = [
  {
    icon: RefreshCcw,
    title: "Cancellations",
    description: "Call our team and we'll sort it",
  },
  {
    icon: ReceiptText,
    title: "No Hidden Charges",
    description: "Transparent daily pricing",
  },
  {
    icon: ShieldCheck,
    title: "Papers & Insurance",
    description: "Every vehicle road-legal",
  },
] as const;

function formatMoney(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function addDays(iso: string, days: number) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function dayCount(start: string, end: string) {
  const from = Date.parse(`${start}T00:00:00Z`);
  const to = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return 1;
  return Math.max(1, Math.round((to - from) / 86_400_000));
}

export function BookingPanel({
  vehicleId,
  vehicleSlug,
  pricePerDay,
  defaultFrom,
  defaultTo,
}: {
  vehicleId: string;
  vehicleSlug: string;
  pricePerDay: number;
  defaultFrom?: string;
  defaultTo?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    CartActionResult | null,
    FormData
  >(addToCart, null);

  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [from, setFrom] = React.useState(defaultFrom ?? today);
  const [to, setTo] = React.useState(defaultTo ?? addDays(today, 1));

  // Moving the pickup date drags the return date along so the range can never
  // invert. Handled in the change handler rather than an effect.
  function changeFrom(next: string) {
    setFrom(next);
    if (to < next) setTo(addDays(next, 1));
  }

  React.useEffect(() => {
    if (state?.ok && state.redirectTo) router.push(state.redirectTo);
    if (state && !state.ok && state.requiresLogin) {
      router.push(`/login?next=${encodeURIComponent(`/vehicles/${vehicleSlug}`)}`);
    }
  }, [state, router, vehicleSlug]);

  const days = dayCount(from, to);
  const total = pricePerDay * days;

  const field =
    "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm text-neutral-950 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none";

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="vehicleId" value={vehicleId} />

      <div className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-950">
          <CalendarDays className="size-4 text-brand" aria-hidden="true" />
          Choose Your Dates
        </h2>

        <div className="mt-4 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-500">
              Pickup date
            </span>
            <input
              type="date"
              name="startDate"
              required
              min={today}
              value={from}
              onChange={(e) => changeFrom(e.target.value)}
              className={field}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-500">
              Return date
            </span>
            <input
              type="date"
              name="endDate"
              required
              min={from}
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className={field}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-neutral-500">
              Where are you riding?
            </span>
            <select name="location" defaultValue={LOCATIONS[0]} className={field}>
              {LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Live total — the server recomputes this from the database on submit. */}
        <dl className="mt-5 flex flex-col gap-2 border-t border-neutral-200 pt-4 text-sm">
          <div className="flex items-center justify-between text-neutral-600">
            <dt>
              {formatMoney(pricePerDay)} × {days} {days === 1 ? "day" : "days"}
            </dt>
            <dd>{formatMoney(total)}</dd>
          </div>
          <div className="flex items-center justify-between text-base font-bold text-neutral-950">
            <dt>Rental total</dt>
            <dd>{formatMoney(total)}</dd>
          </div>
          <p className="text-xs text-neutral-500">
            A refundable security deposit is collected at pickup and depends on
            your route.
          </p>
        </dl>

        <ul className="mt-5 flex flex-col gap-3 border-t border-neutral-200 pt-4">
          {ASSURANCES.map((item) => (
            <li key={item.title} className="flex items-start gap-2.5">
              <item.icon
                className="mt-0.5 size-4 shrink-0 text-brand"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-neutral-950">
                  {item.title}
                </span>
                <span className="text-xs text-neutral-500">
                  {item.description}
                </span>
              </div>
            </li>
          ))}
        </ul>

        {state && !state.ok && (
          <p
            role="alert"
            className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700"
          >
            <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {state.error}
          </p>
        )}

        {state?.ok && state.message && (
          <p
            role="status"
            className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700"
          >
            <Check className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {state.message}
          </p>
        )}

        {/* One action only: everything is booked through the cart, so a rider
            can hold more than one vehicle for the same trip. */}
        <div className="mt-5">
          <button
            type="submit"
            name="intent"
            value="cart"
            disabled={pending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ShoppingCart className="size-4" aria-hidden="true" />
            )}
            Add To Cart
          </button>
        </div>
      </div>
    </form>
  );
}
