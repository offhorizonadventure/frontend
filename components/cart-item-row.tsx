"use client";

import * as React from "react";
import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertCircle,
  ImageIcon,
  Loader2,
  ShieldCheck,
  Trash2,
} from "lucide-react";

import {
  removeCartItem,
  updateCartItem,
  type CartActionResult,
} from "@/app/actions/cart";
import { LOCATIONS, rentalDays } from "@/lib/cart-constants";
import type { CartItem } from "@/lib/cart";

function formatMoney(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function CartItemRow({ item }: { item: CartItem }) {
  const [updateState, updateAction, updating] = useActionState<
    CartActionResult | null,
    FormData
  >(updateCartItem, null);
  const [removeState, removeAction, removing] = useActionState<
    CartActionResult | null,
    FormData
  >(removeCartItem, null);

  const today = React.useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [from, setFrom] = React.useState(item.startDate);
  const [to, setTo] = React.useState(item.endDate);
  const [location, setLocation] = React.useState(item.location ?? LOCATIONS[0]);

  // Optimistic total so the line reacts as dates change; the server recomputes
  // the authoritative figure from the vehicle's current price on submit.
  const days = rentalDays(from, to);
  const subtotal = item.pricePerDay * days;
  const dirty =
    from !== item.startDate ||
    to !== item.endDate ||
    location !== (item.location ?? LOCATIONS[0]);

  const field =
    "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-950 focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none";

  const error =
    (updateState && !updateState.ok && updateState.error) ||
    (removeState && !removeState.ok && removeState.error) ||
    null;

  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5">
      <div className="flex gap-4">
        <Link
          href={`/vehicles/${item.slug}`}
          className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50 sm:size-28"
        >
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="112px"
              unoptimized
              className="object-contain p-2"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-neutral-300">
              <ImageIcon className="size-6" aria-hidden="true" />
            </span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Link
            href={`/vehicles/${item.slug}`}
            className="truncate text-sm font-semibold text-neutral-950 transition-colors hover:text-brand sm:text-base"
          >
            {item.name}
          </Link>
          {item.subcategoryName && (
            <span className="w-fit rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
              {item.subcategoryName}
            </span>
          )}
          <p className="mt-auto text-xs text-neutral-500">
            {formatMoney(item.pricePerDay)} / day × {days}{" "}
            {days === 1 ? "day" : "days"}
          </p>
        </div>

        <div className="flex flex-col items-end justify-between">
          <p className="text-base font-bold whitespace-nowrap text-neutral-950">
            {formatMoney(subtotal)}
          </p>
          <form action={removeAction}>
            <input type="hidden" name="itemId" value={item.id} />
            <button
              type="submit"
              disabled={removing}
              aria-label={`Remove ${item.name} from cart`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-400 transition-colors hover:text-red-600 disabled:opacity-60"
            >
              {removing ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Trash2 className="size-3.5" aria-hidden="true" />
              )}
              Remove
            </button>
          </form>
        </div>
      </div>

      <form
        action={updateAction}
        className="grid grid-cols-1 gap-3 border-t border-neutral-200 pt-4 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
      >
        <input type="hidden" name="itemId" value={item.id} />

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-500">Pickup</span>
          <input
            type="date"
            name="startDate"
            required
            min={today}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={field}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-neutral-500">Return</span>
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
          <span className="text-xs font-medium text-neutral-500">Route</span>
          <select
            name="location"
            value={location}
            onChange={(e) => setLocation(e.target.value as typeof location)}
            className={field}
          >
            {LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>

        <button
          type="submit"
          disabled={updating || !dirty}
          className="inline-flex h-[38px] items-center justify-center gap-1.5 rounded-lg border border-neutral-300 px-4 text-sm font-semibold text-neutral-950 transition-colors hover:border-neutral-950 disabled:opacity-40"
        >
          {updating && (
            <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          )}
          Update
        </button>
      </form>

      {/* The deposit is refundable and route-dependent, so it's stated on the
          line rather than buried in the summary. */}
      <p className="flex flex-wrap items-center gap-x-1.5 rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-600">
        <ShieldCheck className="size-3.5 shrink-0 text-brand" aria-hidden="true" />
        {item.securityDeposit !== null ? (
          <>
            <span className="font-semibold text-neutral-950">
              {formatMoney(item.securityDeposit)}
            </span>
            refundable deposit for {item.location}
          </>
        ) : (
          <>Pick a route and update to see the refundable deposit.</>
        )}
      </p>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </li>
  );
}
