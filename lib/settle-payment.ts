import "server-only";

import { fetchRazorpayPayment } from "@/lib/razorpay";
import type { Location } from "@/lib/cart-constants";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * What the rider is paying for, priced by the server at checkout.
 *
 * Held on the order rather than written as bookings up front, so abandoning a
 * payment leaves no reservation behind. Prices are captured here so the
 * booking that gets created later matches what was actually charged.
 */
export type CartSnapshot = {
  /** Booking total across every line, before the advance split. */
  total?: number;
  /** What was actually charged online. The rest is due at pickup. */
  advance?: number;
  items: {
    vehicleId: string;
    startDate: string;
    endDate: string;
    location: Location | null;
    pricePerDay: number;
    deposit: number;
    total: number;
  }[];
  gear: {
    gearId: string;
    quantity: number;
    pricePerDay: number;
  }[];
};

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
    .select(
      "id, customer_id, amount, status, razorpay_payment_id, cart_snapshot"
    )
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

  // The bookings are created here, not at checkout — this is the first point
  // at which we know the rider actually paid.
  const snapshot = order.cart_snapshot as CartSnapshot | null;

  if (!snapshot || snapshot.items.length === 0) {
    console.error("settlePayment: order has no cart snapshot", order.id);
    // The payment is real, so the order stays marked paid and this is left for
    // an admin rather than silently discarded.
    return { ok: false, error: "We couldn't rebuild your booking." };
  }

  let firstBookingId: string | null = null;

  // Only an advance was charged, so each booking is marked part-paid for its
  // share of it. The share is proportional to the line's own total, and the
  // rounding remainder goes on the last line so the parts always add back up
  // to exactly what Razorpay captured.
  const snapshotTotal =
    snapshot.total ?? snapshot.items.reduce((sum, item) => sum + item.total, 0);
  const advanceTaken = snapshot.advance ?? Number(order.amount);

  const advanceShares = snapshot.items.map((item) =>
    snapshotTotal > 0
      ? Math.round((item.total / snapshotTotal) * advanceTaken)
      : 0
  );
  const allocated = advanceShares.reduce((sum, share) => sum + share, 0);
  if (advanceShares.length > 0) {
    advanceShares[advanceShares.length - 1] += advanceTaken - allocated;
  }

  // Names for the booking-line snapshots, so a line still reads correctly if
  // the vehicle or gear is later removed from the catalogue.
  const [{ data: vehicleRows }, { data: gearRows }] = await Promise.all([
    supabase
      .from("vehicles")
      .select("id, name")
      .in(
        "id",
        snapshot.items.map((item) => item.vehicleId)
      ),
    snapshot.gear.length > 0
      ? supabase
          .from("gears")
          .select("id, name")
          .in(
            "id",
            snapshot.gear.map((gear) => gear.gearId)
          )
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
  ]);

  const vehicleNames = new Map(
    ((vehicleRows ?? []) as { id: string; name: string }[]).map((row) => [
      row.id,
      row.name,
    ])
  );
  const gearNames = new Map(
    ((gearRows ?? []) as { id: string; name: string }[]).map((row) => [
      row.id,
      row.name,
    ])
  );

  for (const [index, item] of snapshot.items.entries()) {
    const paid = advanceShares[index] ?? 0;

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        customer_id: order.customer_id,
        status: "confirmed",
        // 'partial' unless the advance happens to cover the whole line —
        // the balance is collected when the vehicle is handed over.
        payment_status: paid >= item.total ? "paid" : "partial",
        start_date: item.startDate,
        end_date: item.endDate,
        location: item.location,
        total_amount: item.total,
        amount_paid: paid,
        razorpay_payment_id: razorpayPaymentId,
        payment_order_id: order.id,
        created_by: order.customer_id,
      })
      .select("id")
      .single();

    if (bookingError || !booking) {
      console.error(
        "settlePayment: could not create booking",
        order.id,
        bookingError?.message
      );
      continue;
    }

    firstBookingId ??= booking.id;

    // Prices come from the snapshot, so a vehicle repriced mid-payment can't
    // make the booking disagree with what was charged.
    const { error: vehicleError } = await supabase
      .from("booking_vehicles")
      .insert({
        booking_id: booking.id,
        vehicle_id: item.vehicleId,
        vehicle_name: vehicleNames.get(item.vehicleId) ?? null,
        price_per_day: item.pricePerDay,
        security_deposit: item.deposit,
        tax: 0,
      });

    if (vehicleError) {
      console.error(
        "settlePayment: could not attach vehicle",
        booking.id,
        vehicleError.message
      );
    }
  }

  // Gear is hired for the trip rather than per bike, so it hangs off the
  // first booking.
  if (firstBookingId && snapshot.gear.length > 0) {
    for (const gear of snapshot.gear) {
      const { error: gearError } = await supabase.from("booking_gears").insert({
        booking_id: firstBookingId,
        gear_id: gear.gearId,
        gear_name: gearNames.get(gear.gearId) ?? null,
        // booking_gears caps quantity at 2; clamp rather than lose the whole
        // settlement over an add-on.
        quantity: Math.min(gear.quantity, 2),
        price_per_day: gear.pricePerDay,
      });

      if (gearError) {
        console.error("settlePayment: could not attach gear", gearError.message);
      }
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
