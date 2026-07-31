"use server";

import { revalidatePath } from "next/cache";

import { getCartSummary } from "@/lib/cart";
import { getOwnProfile } from "@/lib/profile";
import { createRazorpayOrder, verifyCheckoutSignature } from "@/lib/razorpay";
import { settlePayment } from "@/lib/settle-payment";
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

  let order;
  try {
    order = await createRazorpayOrder({
      amountInRupees: cart.total,
      // Razorpay caps receipts at 40 characters.
      receipt: `cart_${user.id.slice(0, 8)}_${Date.now()}`.slice(0, 40),
      notes: { customer_id: user.id },
    });
  } catch (error) {
    console.error("startCheckout: order creation failed", error);
    return { ok: false, error: "Could not start the payment. Please try again." };
  }

  // Written as the signed-in user, so RLS pins customer_id to them.
  const { data: paymentOrder, error: orderError } = await supabase
    .from("payment_orders")
    .insert({
      customer_id: user.id,
      razorpay_order_id: order.id,
      amount: cart.total,
      coupon_id: null,
      discount: cart.discount,
      deposit_total: cart.depositTotal,
    })
    .select("id")
    .single();

  if (orderError || !paymentOrder) {
    console.error("startCheckout: could not save order", orderError?.message);
    return { ok: false, error: "Could not start the payment. Please try again." };
  }

  // One booking per cart line: each keeps its own dates and route, and they
  // all point at the single payment. Created as pending/unpaid — only a
  // verified payment moves them to confirmed.
  for (const item of cart.items) {
    const deposit = item.securityDeposit ?? 0;
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        customer_id: user.id,
        status: "pending",
        payment_status: "unpaid",
        start_date: item.startDate,
        end_date: item.endDate,
        location: item.location,
        total_amount: item.subtotal + deposit,
        discount_amount: 0,
        payment_order_id: paymentOrder.id,
        created_by: user.id,
      })
      .select("id")
      .single();

    if (bookingError || !booking) {
      console.error("startCheckout: booking failed", bookingError?.message);
      return { ok: false, error: "Could not create your booking." };
    }

    // Snapshot the price so later edits to the vehicle don't rewrite history.
    const { error: vehicleError } = await supabase
      .from("booking_vehicles")
      .insert({
        booking_id: booking.id,
        vehicle_id: item.vehicleId,
        price_per_day: item.pricePerDay,
        security_deposit: deposit,
        tax: 0,
      });

    if (vehicleError) {
      console.error("startCheckout: booking vehicle failed", vehicleError.message);
      return { ok: false, error: "Could not create your booking." };
    }
  }

  // Gear rides on the first booking — it's hired for the trip, not per bike.
  if (cart.gear.length > 0) {
    const { data: firstBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("payment_order_id", paymentOrder.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (firstBooking) {
      for (const gear of cart.gear) {
        const { error: gearError } = await supabase
          .from("booking_gears")
          .insert({
            booking_id: firstBooking.id,
            gear_id: gear.gearId,
            // booking_gears caps quantity at 2; clamp rather than fail the
            // whole checkout over an add-on.
            quantity: Math.min(gear.quantity, 2),
            price_per_day: gear.pricePerDay,
          });

        if (gearError) {
          console.error("startCheckout: gear failed", gearError.message);
        }
      }
    }
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
