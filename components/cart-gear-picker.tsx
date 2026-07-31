"use client";

import * as React from "react";
import { Check, Minus, Plus, ShieldCheck } from "lucide-react";

import { setCartGear, type CartActionResult } from "@/app/actions/cart";
import type { CartGearItem, GearOption } from "@/lib/cart";

function formatMoney(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * One row per piece of gear we rent.
 *
 * The quantity is submitted to the server on every change rather than kept in
 * component state and reconciled later — the cart total is computed from the
 * database, so the database is the only state worth trusting.
 */
function GearRow({
  gear,
  quantity,
  onError,
}: {
  gear: GearOption;
  quantity: number;
  onError: (message: string | null) => void;
}) {
  const [pending, startTransition] = React.useTransition();

  function submit(next: number) {
    const data = new FormData();
    data.set("gearId", gear.id);
    data.set("quantity", String(next));

    startTransition(async () => {
      const result: CartActionResult = await setCartGear(null, data);
      onError(result.ok ? null : result.error);
    });
  }

  const inCart = quantity > 0;

  return (
    <li
      className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
        inCart ? "border-brand/40 bg-brand/5" : "border-neutral-200 bg-white"
      }`}
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
          inCart ? "bg-brand text-white" : "bg-neutral-100 text-neutral-400"
        }`}
        aria-hidden="true"
      >
        {inCart ? (
          <Check className="size-4" />
        ) : (
          <ShieldCheck className="size-4" />
        )}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-neutral-950">
          {gear.name}
        </p>
        <p className="text-xs text-neutral-500">
          {formatMoney(gear.pricePerDay)}
          <span className="text-neutral-400"> /day</span>
        </p>
      </div>

      {inCart ? (
        <div className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white">
          <button
            type="button"
            onClick={() => submit(quantity - 1)}
            disabled={pending}
            aria-label={`Reduce ${gear.name}`}
            className="flex size-8 items-center justify-center text-neutral-600 transition-colors hover:text-neutral-950 disabled:opacity-40"
          >
            <Minus className="size-3.5" aria-hidden="true" />
          </button>
          <span
            className="w-6 text-center text-sm font-semibold text-neutral-950"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => submit(quantity + 1)}
            disabled={pending || quantity >= 10}
            aria-label={`Add another ${gear.name}`}
            className="flex size-8 items-center justify-center text-neutral-600 transition-colors hover:text-neutral-950 disabled:opacity-40"
          >
            <Plus className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => submit(1)}
          disabled={pending}
          className="shrink-0 rounded-lg border border-brand px-3 py-1.5 text-xs font-bold tracking-wide text-brand uppercase transition-colors hover:bg-brand hover:text-white disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      )}
    </li>
  );
}

export function CartGearPicker({
  options,
  selected,
}: {
  options: GearOption[];
  selected: CartGearItem[];
}) {
  const [error, setError] = React.useState<string | null>(null);

  if (options.length === 0) return null;

  const quantities = new Map(selected.map((item) => [item.gearId, item.quantity]));

  return (
    <section
      aria-labelledby="cart-gear-heading"
      className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2
          id="cart-gear-heading"
          className="text-sm font-bold tracking-wide text-neutral-950 uppercase"
        >
          Add <span className="text-brand">Riding Gear</span>
        </h2>
        <p className="text-xs text-neutral-500">
          Charged per day of your longest hire
        </p>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {options.map((gear) => (
          <GearRow
            key={gear.id}
            gear={gear}
            quantity={quantities.get(gear.id) ?? 0}
            onError={setError}
          />
        ))}
      </ul>

      {error && (
        <p role="alert" className="mt-3 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </section>
  );
}
