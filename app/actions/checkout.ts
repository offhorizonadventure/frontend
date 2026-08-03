"use server";

import { revalidatePath } from "next/cache";

import { getCartSummary } from "@/lib/cart";
import { getOwnProfile } from "@/lib/profile";
import { createRazorpayOrder, verifyCheckoutSignature } from "@/lib/razorpay";
import { settlePayment, type CartSnapshot } from "@/lib/settle-payment";
import { isVehicleAvailable } from "@/lib/vehicles";
import { createClient } from "@/utils/supabase/server";

export type StartCheckoutResult =
  | {
      ok: true;
      razorpayOrderId: string;
      amountInPaise: number;
      keyId: string;
      customerName: string;
      customerPhone: string;
    }
  | { ok: false; error: string };

export type ConfirmPaymentResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Prepares a checkout: prices the cart, reserves it as pending bookings and
 * opens a Razorpay order.
 *
 * Nothing about the price comes from the browser. The cart is re-read and
 * re-priced here, availability is re-checked (someone else may have booked the
 * same bike since it was added), and the amount is fixed to the Razorpay
 * order — so the amount the rider is asked to pay can't be edited client-side.
 */
export async function startCheckout(): Promise<StartCheckoutResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Please sign in to continue." };
  }

  const profile = await getOwnProfile(user.id);
  if (!profile || !profile.name.trim()) {
    return { ok: false, error: "Please complete your profile first." };
  }

  const cart = await getCartSummary();

  if (cart.items.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }

  if (cart.depositPending > 0) {
    return {
      ok: false,
      error: "Choose a route for every vehicle so we can price the deposit.",
    };
  }

  if (cart.total <= 0) {
    return { ok: false, error: "This cart has nothing to pay." };
  }

  // Re-check availability at the moment of payment, not at the moment of
  // adding to cart — carts can sit for days.
  for (const item of cart.items) {
    const free = await isVehicleAvailable(
      item.vehicleId,
      item.startDate,
      item.endDate
    );
    if (!free) {
      return {
        ok: false,
        error: `${item.name} is no longer free for those dates. Please update your cart.`,
      };
    }
  }

  if (cart.advanceAmount <= 0) {
    return { ok: false, error: "This cart is too small to book online." };
  }

  // Only the advance is charged now. The balance is collected at pickup, so
  // the Razorpay order is deliberately smaller than the booking total.
  let order;
  try {
    order = await createRazorpayOrder({
      amountInRupees: cart.advanceAmount,
      // Razorpay caps receipts at 40 characters.
      receipt: `cart_${user.id.slice(0, 8)}_${Date.now()}`.slice(0, 40),
      notes: { customer_id: user.id },
    });
  } catch (error) {
    console.error("startCheckout: order creation failed", error);
    return { ok: false, error: "Could not start the payment. Please try again." };
  }

  // No bookings are written here. A rider who opens Razorpay and backs out
  // must leave nothing behind, so what they're buying is snapshotted onto the
  // order and turned into bookings only once the payment is confirmed.
  //
  // Prices are captured now rather than re-read later, so a mid-payment price
  // change can't make the rider's booking disagree with what they were
  // charged.
  const snapshot: CartSnapshot = {
    total: cart.total,
    advance: cart.advanceAmount,
    items: cart.items.map((item) => ({
      vehicleId: item.vehicleId,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location,
      pricePerDay: item.pricePerDay,
      deposit: item.securityDeposit ?? 0,
      total: item.subtotal + (item.securityDeposit ?? 0),
    })),
    gear: cart.gear.map((gear) => ({
      gearId: gear.gearId,
      quantity: gear.quantity,
      pricePerDay: gear.pricePerDay,
    })),
  };

  // Written as the signed-in user, so RLS pins customer_id to them.
  const { error: orderError } = await supabase.from("payment_orders").insert({
    customer_id: user.id,
    // What Razorpay is charging — the advance, not the booking total. The
    // settlement checks the captured amount against this, so it has to be the
    // figure that was actually asked for.
    razorpay_order_id: order.id,
    amount: cart.advanceAmount,
    coupon_id: null,
    discount: cart.discount,
    deposit_total: cart.depositTotal,
    cart_snapshot: snapshot,
  });

  if (orderError) {
    console.error("startCheckout: could not save order", orderError.message);
    return { ok: false, error: "Could not start the payment. Please try again." };
  }

  return {
    ok: true,
    razorpayOrderId: order.id,
    amountInPaise: order.amount,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
    customerName: profile.name,
    customerPhone: profile.mobile ?? "",
  };
}

/**
 * Confirms a payment reported by Razorpay Checkout in the browser.
 *
 * The signature is the gate: it's an HMAC only Razorpay could have produced.
 * Everything the browser sends is treated as a claim until it verifies, and
 * the order is additionally checked to belong to the signed-in rider so one
 * customer can't settle another's order.
 */
export async function confirmPayment(input: {
  razorpayOrderId: unknown;
  razorpayPaymentId: unknown;
  signature: unknown;
}): Promise<ConfirmPaymentResult> {
  const { razorpayOrderId, razorpayPaymentId, signature } = input;

  if (
    typeof razorpayOrderId !== "string" ||
    typeof razorpayPaymentId !== "string" ||
    typeof signature !== "string" ||
    !razorpayOrderId ||
    !razorpayPaymentId ||
    !signature
  ) {
    return { ok: false, error: "That payment couldn't be verified." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Please sign in to continue." };
  }

  if (
    !verifyCheckoutSignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature,
    })
  ) {
    console.error("confirmPayment: bad signature for", razorpayOrderId);
    return { ok: false, error: "That payment couldn't be verified." };
  }

  // RLS already limits this read to the rider's own orders, so a missing row
  // means the order isn't theirs.
  const { data: order } = await supabase
    .from("payment_orders")
    .select("id")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();

  if (!order) {
    return { ok: false, error: "We couldn't find that payment." };
  }

  const result = await settlePayment({ razorpayOrderId, razorpayPaymentId });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/cart");
  revalidatePath("/my-bookings");
  revalidatePath("/", "layout");

  return { ok: true };
}
