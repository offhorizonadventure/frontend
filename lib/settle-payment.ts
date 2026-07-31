import "server-only";

import { fetchRazorpayPayment } from "@/lib/razorpay";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Confirms a paid order.
 *
 * Both the browser callback and the Razorpay webhook land here, because a
 * rider can close the tab before the callback fires and the webhook can
 * arrive first — whichever gets here first wins and the other is a no-op.
 *
 * Callers MUST have verified a Razorpay signature before calling this. It
 * runs with the service role and does not re-check who is asking.
 */
export async function settlePayment({
  razorpayOrderId,
  razorpayPaymentId,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
}): Promise<
  | { ok: true; orderId: string; alreadySettled: boolean }
  | { ok: false; error: string }
> {
  const supabase = createAdminClient();

  const { data: order, error } = await supabase
    .from("payment_orders")
    .select("id, customer_id, amount, status, razorpay_payment_id")
    .eq("razorpay_order_id", razorpayOrderId)
    .maybeSingle();

  if (error || !order) {
    console.error("settlePayment: unknown order", razorpayOrderId, error?.message);
    return { ok: false, error: "We couldn't find that payment." };
  }

  // Idempotent: a repeated webhook or a callback racing the webhook must not
  // confirm twice or clear a cart the rider has since refilled.
  if (order.status === "paid") {
    return { ok: true, orderId: order.id, alreadySettled: true };
  }

  // Ask Razorpay what actually happened rather than believing the caller. A
  // valid signature proves the message came from Razorpay; this proves the
  // money was captured and that it was the amount we asked for.
  const payment = await fetchRazorpayPayment(razorpayPaymentId);

  if (!payment) {
    return { ok: false, error: "We couldn't confirm that payment." };
  }

  if (payment.order_id !== razorpayOrderId) {
    console.error(
      "settlePayment: payment/order mismatch",
      payment.order_id,
      razorpayOrderId
    );
    return { ok: false, error: "That payment doesn't match this order." };
  }

  if (payment.status !== "captured") {
    return { ok: false, error: "That payment hasn't completed yet." };
  }

  const expectedPaise = Math.round(Number(order.amount) * 100);
  if (payment.amount !== expectedPaise) {
    console.error(
      "settlePayment: amount mismatch",
      payment.amount,
      expectedPaise
    );
    return { ok: false, error: "The paid amount doesn't match this order." };
  }

  // Guarded on status so two concurrent callers can't both pass the check
  // above and both run the writes below — the loser updates zero rows.
  //
  // 'failed' is accepted as well as 'created': an order the cleanup job aged
  // out can still be paid if the rider had Razorpay open past the hold window.
  // The money is real, so it settles — refusing here would take payment and
  // confirm nothing.
  if (order.status === "failed") {
    console.warn(
      "settlePayment: settling an expired order, check for a clash",
      razorpayOrderId
    );
  }

  const { data: claimed } = await supabase
    .from("payment_orders")
    .update({
      status: "paid",
      razorpay_payment_id: razorpayPaymentId,
      paid_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .in("status", ["created", "failed"])
    .select("id")
    .maybeSingle();

  if (!claimed) {
    return { ok: true, orderId: order.id, alreadySettled: true };
  }

  // Includes any the cleanup job cancelled — a late but genuine payment
  // should revive its own bookings, not leave the rider paid and unbooked.
  const { data: bookings, error: bookingError } = await supabase
    .from("bookings")
    .select("id, total_amount")
    .eq("payment_order_id", order.id);

  if (bookingError) {
    console.error("settlePayment: booking lookup failed", bookingError.message);
  }

  // Each booking is marked paid for its own total, so the per-booking figures
  // the dashboard shows stay correct across a multi-vehicle checkout.
  for (const booking of bookings ?? []) {
    const { error: updateError } = await supabase
      .from("bookings")
      .update({
        status: "confirmed",
        payment_status: "paid",
        amount_paid: booking.total_amount,
        razorpay_payment_id: razorpayPaymentId,
      })
      .eq("id", booking.id);

    if (updateError) {
      console.error(
        "settlePayment: could not confirm booking",
        booking.id,
        updateError.message
      );
    }
  }

  // The cart has become bookings, so empty it. Failures here are logged but
  // not fatal — the rider has paid and a stale cart is a nuisance, not a loss.
  await Promise.all([
    supabase.from("cart_items").delete().eq("customer_id", order.customer_id),
    supabase
      .from("cart_gear_items")
      .delete()
      .eq("customer_id", order.customer_id),
    supabase.from("cart_coupons").delete().eq("customer_id", order.customer_id),
  ]);

  return { ok: true, orderId: order.id, alreadySettled: false };
}
