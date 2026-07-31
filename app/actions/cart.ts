"use server";

import { revalidatePath } from "next/cache";

import {
  LOCATIONS,
  getCartSummary,
  rentalDays,
  type Location,
} from "@/lib/cart";
import { isVehicleAvailable } from "@/lib/vehicles";
import { createClient } from "@/utils/supabase/server";

export type CartActionResult =
  | { ok: true; message?: string; redirectTo?: string }
  | { ok: false; error: string; requiresLogin?: boolean };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
/** Nobody books more than a season ahead; caps absurd ranges. */
const MAX_DAYS = 90;

function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Validates a requested rental window.
 *
 * Everything arriving from a form is treated as hostile: dates must be real
 * ISO dates, in the future, in order, and within a sane span. The vehicle id
 * is checked against the database by the caller.
 */
function validateRange(
  startDate: unknown,
  endDate: unknown
): { ok: true; startDate: string; endDate: string } | { ok: false; error: string } {
  if (
    typeof startDate !== "string" ||
    typeof endDate !== "string" ||
    !ISO_DATE.test(startDate) ||
    !ISO_DATE.test(endDate)
  ) {
    return { ok: false, error: "Please choose a pickup and return date." };
  }

  if (Number.isNaN(Date.parse(startDate)) || Number.isNaN(Date.parse(endDate))) {
    return { ok: false, error: "Those dates don't look right." };
  }

  if (startDate < today()) {
    return { ok: false, error: "Pickup date can't be in the past." };
  }

  if (endDate < startDate) {
    return { ok: false, error: "Return date must be after the pickup date." };
  }

  if (rentalDays(startDate, endDate) > MAX_DAYS) {
    return { ok: false, error: `Rentals are limited to ${MAX_DAYS} days.` };
  }

  return { ok: true, startDate, endDate };
}

function parseLocation(value: unknown): Location | null {
  return typeof value === "string" && LOCATIONS.includes(value as Location)
    ? (value as Location)
    : null;
}

/** The signed-in rider, or null. Never trust a customer id from the client. */
async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function addToCart(
  _prev: CartActionResult | null,
  formData: FormData
): Promise<CartActionResult> {
  const userId = await currentUserId();
  if (!userId) {
    return {
      ok: false,
      requiresLogin: true,
      error: "Please sign in to save vehicles to your cart.",
    };
  }

  const vehicleId = formData.get("vehicleId");
  if (typeof vehicleId !== "string" || !vehicleId) {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  const range = validateRange(formData.get("startDate"), formData.get("endDate"));
  if (!range.ok) return { ok: false, error: range.error };

  const supabase = await createClient();

  // Confirm the vehicle exists before writing a row for it.
  const { data: vehicle } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", vehicleId)
    .maybeSingle();

  if (!vehicle) {
    return { ok: false, error: "That vehicle is no longer listed." };
  }

  const free = await isVehicleAvailable(
    vehicleId,
    range.startDate,
    range.endDate
  );
  if (!free) {
    return {
      ok: false,
      error: "That vehicle is already booked for those dates.",
    };
  }

  // Upsert on (customer_id, vehicle_id): re-adding a bike moves its dates
  // rather than creating a duplicate line.
  const { error } = await supabase.from("cart_items").upsert(
    {
      customer_id: userId,
      vehicle_id: vehicleId,
      start_date: range.startDate,
      end_date: range.endDate,
      location: parseLocation(formData.get("location")),
    },
    { onConflict: "customer_id,vehicle_id" }
  );

  if (error) {
    console.error("Failed to add to cart:", error.message);
    return { ok: false, error: "Could not add this to your cart." };
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");

  // "Book Now" is the same write, it just carries on to checkout.
  return formData.get("intent") === "checkout"
    ? { ok: true, redirectTo: "/cart" }
    : { ok: true, message: "Added to your cart." };
}

export async function updateCartItem(
  _prev: CartActionResult | null,
  formData: FormData
): Promise<CartActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, requiresLogin: true, error: "Please sign in." };

  const itemId = formData.get("itemId");
  if (typeof itemId !== "string" || !itemId) {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  const range = validateRange(formData.get("startDate"), formData.get("endDate"));
  if (!range.ok) return { ok: false, error: range.error };

  const supabase = await createClient();

  // Scoped to the owner as well as the id — RLS enforces this too, but the
  // explicit filter means a mismatched id updates nothing instead of erroring.
  const { data, error } = await supabase
    .from("cart_items")
    .update({
      start_date: range.startDate,
      end_date: range.endDate,
      location: parseLocation(formData.get("location")),
    })
    .eq("id", itemId)
    .eq("customer_id", userId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    console.error("Failed to update cart item:", error?.message);
    return { ok: false, error: "Could not update this item." };
  }

  revalidatePath("/cart");
  return { ok: true, message: "Dates updated." };
}

export async function removeCartItem(
  _prev: CartActionResult | null,
  formData: FormData
): Promise<CartActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, requiresLogin: true, error: "Please sign in." };

  const itemId = formData.get("itemId");
  if (typeof itemId !== "string" || !itemId) {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", itemId)
    .eq("customer_id", userId);

  if (error) {
    console.error("Failed to remove cart item:", error.message);
    return { ok: false, error: "Could not remove this item." };
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { ok: true, message: "Removed from your cart." };
}

/** Quantity ceiling mirrors the check constraint on cart_gear_items. */
const MAX_GEAR_QTY = 10;

/**
 * Adds gear, or sets its quantity.
 *
 * A quantity of 0 removes the line, which lets the picker use one action for
 * add, change and remove.
 */
export async function setCartGear(
  _prev: CartActionResult | null,
  formData: FormData
): Promise<CartActionResult> {
  const userId = await currentUserId();
  if (!userId) {
    return {
      ok: false,
      requiresLogin: true,
      error: "Please sign in to add gear to your cart.",
    };
  }

  const gearId = formData.get("gearId");
  if (typeof gearId !== "string" || !gearId) {
    return { ok: false, error: "Something went wrong. Please try again." };
  }

  const raw = Number(formData.get("quantity"));
  if (!Number.isInteger(raw) || raw < 0 || raw > MAX_GEAR_QTY) {
    return { ok: false, error: `Choose between 1 and ${MAX_GEAR_QTY}.` };
  }

  const supabase = await createClient();

  if (raw === 0) {
    const { error } = await supabase
      .from("cart_gear_items")
      .delete()
      .eq("gear_id", gearId)
      .eq("customer_id", userId);

    if (error) {
      console.error("Failed to remove gear:", error.message);
      return { ok: false, error: "Could not remove this gear." };
    }

    revalidatePath("/cart");
    revalidatePath("/", "layout");
    return { ok: true, message: "Gear removed." };
  }

  // Confirm the gear exists rather than trusting the id from the form.
  const { data: gear } = await supabase
    .from("gears")
    .select("id")
    .eq("id", gearId)
    .maybeSingle();

  if (!gear) {
    return { ok: false, error: "That gear is no longer available." };
  }

  const { error } = await supabase.from("cart_gear_items").upsert(
    { customer_id: userId, gear_id: gearId, quantity: raw },
    { onConflict: "customer_id,gear_id" }
  );

  if (error) {
    console.error("Failed to add gear:", error.message);
    return { ok: false, error: "Could not add this gear." };
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  return { ok: true, message: "Gear updated." };
}

/**
 * Applies a coupon code to the cart.
 *
 * The code is checked by a SECURITY DEFINER function so the coupon table stays
 * unreadable to riders, and the order value it's checked against is computed
 * here from the database — never taken from the form.
 */
export async function applyCoupon(
  _prev: CartActionResult | null,
  formData: FormData
): Promise<CartActionResult> {
  const userId = await currentUserId();
  if (!userId) {
    return { ok: false, requiresLogin: true, error: "Please sign in." };
  }

  const code = formData.get("code");
  if (typeof code !== "string" || !code.trim()) {
    return { ok: false, error: "Enter a coupon code." };
  }

  const summary = await getCartSummary();
  const orderValue = summary.vehicleTotal + summary.gearTotal;

  if (orderValue <= 0) {
    return { ok: false, error: "Add something to your cart first." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("validate_coupon", {
    p_code: code.trim(),
    p_amount: orderValue,
  });

  const match = Array.isArray(data) ? data[0] : data;

  if (error || !match) {
    // Deliberately vague: a rider shouldn't be able to tell an expired code
    // from one that never existed, or use this to enumerate coupons.
    return { ok: false, error: "That code isn't valid for this cart." };
  }

  const { error: saveError } = await supabase
    .from("cart_coupons")
    .upsert(
      { customer_id: userId, coupon_id: match.coupon_id },
      { onConflict: "customer_id" }
    );

  if (saveError) {
    console.error("Failed to apply coupon:", saveError.message);
    return { ok: false, error: "Could not apply that code." };
  }

  revalidatePath("/cart");
  return { ok: true, message: `${match.code} applied.` };
}

export async function removeCoupon(): Promise<CartActionResult> {
  const userId = await currentUserId();
  if (!userId) {
    return { ok: false, requiresLogin: true, error: "Please sign in." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("cart_coupons")
    .delete()
    .eq("customer_id", userId);

  if (error) {
    console.error("Failed to remove coupon:", error.message);
    return { ok: false, error: "Could not remove that code." };
  }

  revalidatePath("/cart");
  return { ok: true, message: "Coupon removed." };
}
