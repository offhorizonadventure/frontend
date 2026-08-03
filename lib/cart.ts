import "server-only";

import { rentalDays, type Location } from "@/lib/cart-constants";
import { createClient } from "@/utils/supabase/server";

export { LOCATIONS, rentalDays, type Location } from "@/lib/cart-constants";

export type CartItem = {
  id: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  location: Location | null;
  name: string;
  slug: string;
  pricePerDay: number;
  imageUrl: string | null;
  subcategoryName: string | null;
  /** Whole days, minimum 1 — a same-day return still counts as a day. */
  days: number;
  subtotal: number;
  /**
   * Refundable deposit for this vehicle on the chosen route. Null when no
   * route is picked yet, or when we haven't priced that combination.
   */
  securityDeposit: number | null;
};

export type CartGearItem = {
  id: string;
  gearId: string;
  name: string;
  pricePerDay: number;
  quantity: number;
  /** Charged for the longest hire in the cart — gear goes out with the trip. */
  days: number;
  subtotal: number;
};

export type GearOption = {
  id: string;
  name: string;
  pricePerDay: number;
};

export type AppliedCoupon = {
  code: string;
  discountType: "Percentage" | "Flat";
  discountValue: number;
  discount: number;
};

export type CartSummary = {
  items: CartItem[];
  gear: CartGearItem[];
  coupon: AppliedCoupon | null;
  /** Vehicle hire before any discount. */
  vehicleTotal: number;
  gearTotal: number;
  discount: number;
  /** Deposits for the lines that have a route chosen. */
  depositTotal: number;
  /** Lines still missing a route, so the deposit shown is incomplete. */
  depositPending: number;
  /** Hire + gear + deposit, less any discount. The whole cost of the trip. */
  total: number;
  /** Taken online now to hold the booking. */
  advanceAmount: number;
  /** The rest, collected when the vehicle is handed over. */
  dueAmount: number;
};

/**
 * Share of the total taken up front. The balance is collected at pickup, so a
 * rider isn't asked for the full amount weeks before their trip.
 */
export const ADVANCE_RATE = 0.1;

/** Rounded to whole rupees — Razorpay works in paise and rejects fractions. */
export function advanceFor(total: number) {
  return Math.round(total * ADVANCE_RATE);
}

type CartRow = {
  id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  location: Location | null;
  vehicles: {
    name: string;
    slug: string;
    price_per_day: number;
    bike_photo_url: string | null;
    vehicle_subcategories: { name: string } | null;
  } | null;
};

type GearRow = {
  id: string;
  gear_id: string;
  quantity: number;
  gears: { name: string; price_per_day: number } | null;
};

/**
 * The signed-in rider's cart, priced from scratch.
 *
 * Every amount here is recomputed server-side from the current
 * `price_per_day`, the deposit table and the coupon rules — the browser never
 * gets to tell us what something costs. Returns an empty cart when signed out.
 */
export async function getCartSummary(): Promise<CartSummary> {
  const empty: CartSummary = {
    items: [],
    gear: [],
    coupon: null,
    vehicleTotal: 0,
    gearTotal: 0,
    discount: 0,
    depositTotal: 0,
    depositPending: 0,
    total: 0,
    advanceAmount: 0,
    dueAmount: 0,
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return empty;

  const [{ data: itemRows, error }, { data: gearRows }] = await Promise.all([
    supabase
      .from("cart_items")
      .select(
        `id, vehicle_id, start_date, end_date, location,
         vehicles(name, slug, price_per_day, bike_photo_url,
                  vehicle_subcategories(name))`
      )
      .eq("customer_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("cart_gear_items")
      .select("id, gear_id, quantity, gears(name, price_per_day)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: true }),
  ]);

  if (error) {
    console.error("Failed to load cart:", error.message);
    return empty;
  }

  const rows = ((itemRows ?? []) as unknown as CartRow[]).filter(
    (row) => row.vehicles !== null
  );

  // Deposits come from an admin-only table, so they're read through a
  // SECURITY DEFINER function that returns one price at a time.
  const deposits = await Promise.all(
    rows.map(async (row) => {
      if (!row.location) return null;
      const { data } = await supabase.rpc("vehicle_security_price", {
        p_vehicle_id: row.vehicle_id,
        p_location: row.location,
      });
      return typeof data === "number" ? data : null;
    })
  );

  const items: CartItem[] = rows.map((row, index) => {
    const vehicle = row.vehicles!;
    const days = rentalDays(row.start_date, row.end_date);

    return {
      id: row.id,
      vehicleId: row.vehicle_id,
      startDate: row.start_date,
      endDate: row.end_date,
      location: row.location,
      name: vehicle.name,
      slug: vehicle.slug,
      pricePerDay: vehicle.price_per_day,
      imageUrl: vehicle.bike_photo_url,
      subcategoryName: vehicle.vehicle_subcategories?.name ?? null,
      days,
      subtotal: vehicle.price_per_day * days,
      securityDeposit: deposits[index],
    };
  });

  // Gear is hired for the trip, so it's charged across the longest booking in
  // the cart rather than per vehicle.
  const gearDays = items.reduce((max, item) => Math.max(max, item.days), 0);

  const gear: CartGearItem[] = ((gearRows ?? []) as unknown as GearRow[])
    .filter((row) => row.gears !== null)
    .map((row) => ({
      id: row.id,
      gearId: row.gear_id,
      name: row.gears!.name,
      pricePerDay: row.gears!.price_per_day,
      quantity: row.quantity,
      days: gearDays,
      subtotal: row.gears!.price_per_day * row.quantity * gearDays,
    }));

  const vehicleTotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const gearTotal = gear.reduce((sum, item) => sum + item.subtotal, 0);
  const depositTotal = items.reduce(
    (sum, item) => sum + (item.securityDeposit ?? 0),
    0
  );
  const depositPending = items.filter(
    (item) => item.securityDeposit === null
  ).length;

  // The coupon discounts the hire, not the refundable deposit.
  const coupon = await getAppliedCoupon(vehicleTotal + gearTotal);
  const discount = coupon?.discount ?? 0;

  const total =
    Math.max(0, vehicleTotal + gearTotal - discount) + depositTotal;
  const advanceAmount = advanceFor(total);

  return {
    items,
    gear,
    coupon,
    vehicleTotal,
    gearTotal,
    discount,
    depositTotal,
    depositPending,
    total,
    advanceAmount,
    dueAmount: Math.max(0, total - advanceAmount),
  };
}

/**
 * Re-checks the rider's saved coupon against the current order value.
 *
 * Revalidating on every render matters: a code that was valid when applied may
 * have expired, been deactivated, or stopped meeting its minimum after items
 * were removed. A coupon that no longer qualifies simply stops applying.
 */
async function getAppliedCoupon(amount: number): Promise<AppliedCoupon | null> {
  if (amount <= 0) return null;

  const supabase = await createClient();
  const { data: saved } = await supabase
    .from("cart_coupons")
    .select("coupon_id")
    .maybeSingle();

  if (!saved) return null;

  const { data } = await supabase.rpc("validate_coupon_by_id", {
    p_coupon_id: saved.coupon_id,
    p_amount: amount,
  });

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return null;

  return {
    code: row.code,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    discount: Number(row.discount) || 0,
  };
}

/** Gear we rent, for the cart's add-on picker. */
export async function getGearOptions(): Promise<GearOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gears")
    .select("id, name, price_per_day")
    .order("price_per_day", { ascending: true });

  if (error) {
    console.error("Failed to load gear:", error.message);
    return [];
  }

  return ((data ?? []) as { id: string; name: string; price_per_day: number }[]).map(
    (row) => ({
      id: row.id,
      name: row.name,
      pricePerDay: row.price_per_day,
    })
  );
}

/** Lines in the cart (vehicles + gear), for the header badge. */
export async function getCartCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const [{ count: vehicles }, { count: gear }] = await Promise.all([
    supabase
      .from("cart_items")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", user.id),
    supabase
      .from("cart_gear_items")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", user.id),
  ]);

  return (vehicles ?? 0) + (gear ?? 0);
}
