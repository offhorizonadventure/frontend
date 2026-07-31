"use client";

import * as React from "react";
import { Tag, X } from "lucide-react";

import { applyCoupon, removeCoupon, type CartActionResult } from "@/app/actions/cart";
import type { AppliedCoupon } from "@/lib/cart";

function formatMoney(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function CouponForm({ coupon }: { coupon: AppliedCoupon | null }) {
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function onApply(formData: FormData) {
    startTransition(async () => {
      const result: CartActionResult = await applyCoupon(null, formData);
      setError(result.ok ? null : result.error);
    });
  }

  function onRemove() {
    startTransition(async () => {
      const result = await removeCoupon();
      setError(result.ok ? null : result.error);
    });
  }

  if (coupon) {
    return (
      <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
        <div className="flex items-center gap-2.5">
          <Tag className="size-4 shrink-0 text-emerald-600" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-emerald-900">
              {coupon.code}
            </p>
            <p className="text-xs text-emerald-700">
              {coupon.discountType === "Percentage"
                ? `${coupon.discountValue}% off`
                : `${formatMoney(coupon.discountValue)} off`}
              {" — you save "}
              {formatMoney(coupon.discount)}
            </p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            disabled={pending}
            aria-label={`Remove coupon ${coupon.code}`}
            className="shrink-0 rounded-md p-1 text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={onApply} className="mt-4">
      <label
        htmlFor="coupon-code"
        className="text-xs font-semibold text-neutral-950"
      >
        Have a coupon?
      </label>
      <div className="mt-1.5 flex items-center gap-2">
        <input
          id="coupon-code"
          name="code"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          placeholder="Enter code"
          className="w-full min-w-0 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm uppercase focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-lg border border-neutral-950 px-4 py-2.5 text-xs font-bold tracking-wide text-neutral-950 uppercase transition-colors hover:bg-neutral-950 hover:text-white disabled:opacity-50"
        >
          {pending ? "…" : "Apply"}
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
