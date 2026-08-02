import "server-only";

import { createClient } from "@/utils/supabase/server";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "ongoing"
  | "completed"
  | "cancelled";

export type BookingVehicle = {
  id: string;
  name: string;
  /** Null once the vehicle is gone — there's nothing left to link to. */
  slug: string | null;
  imageUrl: string | null;
  pricePerDay: number;
  securityDeposit: number;
};

export type BookingGear = {
  id: string;
  name: string;
  quantity: number;
  pricePerDay: number;
};

export type Booking = {
  id: string;
  status: BookingStatus;
  paymentStatus: "unpaid" | "partial" | "paid";
  startDate: string;
  endDate: string;
  location: string | null;
  totalAmount: number;
  amountPaid: number;
  refundAmount: number;
  refundStatus: string;
  createdAt: string;
  vehicles: BookingVehicle[];
  gear: BookingGear[];
};

type Row = {
  id: string;
  status: BookingStatus;
  payment_status: "unpaid" | "partial" | "paid";
  start_date: string;
  end_date: string;
  location: string | null;
  total_amount: number;
  amount_paid: number;
  refund_amount: number;
  refund_status: string;
  created_at: string;
  booking_vehicles: {
    id: string;
    vehicle_name: string | null;
    price_per_day: number;
    security_deposit: number;
    vehicles: {
      name: string;
      slug: string;
      bike_photo_url: string | null;
    } | null;
  }[];
  booking_gears: {
    id: string;
    quantity: number;
    price_per_day: number;
    gear_name: string | null;
    gears: { name: string } | null;
  }[];
};

/**
 * The signed-in rider's bookings, newest first.
 *
 * RLS limits both the bookings and the nested rows to their own, so no
 * customer filter is needed here — but one is applied anyway so a policy
 * mistake can't turn this into everyone's booking history.
 */
export async function getMyBookings(userId: string): Promise<Booking[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("bookings")
    .select(
      `id, status, payment_status, start_date, end_date, location,
       total_amount, amount_paid, refund_amount, refund_status, created_at,
       booking_vehicles(
         id, vehicle_name, price_per_day, security_deposit,
         vehicles(name, slug, bike_photo_url)
       ),
       booking_gears(id, quantity, price_per_day, gear_name, gears(name))`
    )
    .eq("customer_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load bookings:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    status: row.status,
    paymentStatus: row.payment_status,
    startDate: row.start_date,
    endDate: row.end_date,
    location: row.location,
    totalAmount: row.total_amount,
    amountPaid: row.amount_paid,
    refundAmount: row.refund_amount,
    refundStatus: row.refund_status,
    createdAt: row.created_at,
    // A vehicle removed from the catalogue leaves the join null, so fall back
    // to the name snapshotted onto the line when the booking was made.
    vehicles: (row.booking_vehicles ?? []).map((bv) => ({
      id: bv.id,
      name: bv.vehicles?.name ?? bv.vehicle_name ?? "Vehicle",
      slug: bv.vehicles?.slug ?? null,
      imageUrl: bv.vehicles?.bike_photo_url ?? null,
      pricePerDay: bv.price_per_day,
      securityDeposit: bv.security_deposit,
    })),
    gear: (row.booking_gears ?? []).map((bg) => ({
      id: bg.id,
      name: bg.gears?.name ?? bg.gear_name ?? "Gear",
      quantity: bg.quantity,
      pricePerDay: bg.price_per_day,
    })),
  }));
}
