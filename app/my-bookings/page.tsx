import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Check,
  ImageIcon,
  MapPin,
  ReceiptText,
} from "lucide-react";

import { AccountNav } from "@/components/account-nav";
import { getMyBookings, type Booking, type BookingStatus } from "@/lib/bookings";
import { requireCompleteProfile } from "@/utils/supabase/require-user";

export const metadata: Metadata = {
  title: "My Bookings | BRB Expeditions",
  robots: { index: false, follow: false },
};

// Data changes as soon as a payment settles, so never serve this from cache.
export const dynamic = "force-dynamic";

function formatMoney(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const STATUS_STYLES: Record<BookingStatus, { label: string; className: string }> =
  {
    pending: {
      label: "Awaiting payment",
      className: "bg-amber-50 text-amber-800",
    },
    confirmed: { label: "Confirmed", className: "bg-emerald-50 text-emerald-700" },
    ongoing: { label: "On the road", className: "bg-blue-50 text-blue-700" },
    completed: { label: "Completed", className: "bg-neutral-100 text-neutral-600" },
    cancelled: { label: "Cancelled", className: "bg-red-50 text-red-700" },
  };

function BookingCard({ booking }: { booking: Booking }) {
  const status = STATUS_STYLES[booking.status];
  const deposit = booking.vehicles.reduce(
    (sum, vehicle) => sum + vehicle.securityDeposit,
    0
  );

  return (
    <li className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}
          >
            {status.label}
          </span>
          {booking.paymentStatus === "paid" && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
              <Check className="size-3.5" aria-hidden="true" />
              Paid
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-neutral-400">
          #{booking.id.slice(0, 8).toUpperCase()}
        </span>
      </div>

      <div className="flex flex-col gap-4 p-5">
        {booking.vehicles.map((vehicle) => {
          // The vehicle may since have been removed from the catalogue, in
          // which case there's no page left to link to — the booking still
          // shows the name it was made under.
          const thumbClass =
            "relative size-20 shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-50";
          const thumb = vehicle.imageUrl ? (
            <Image
              src={vehicle.imageUrl}
              alt={vehicle.name}
              fill
              sizes="80px"
              unoptimized
              className="object-contain p-2"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center text-neutral-300">
              <ImageIcon className="size-6" aria-hidden="true" />
            </span>
          );

          return (
            <div key={vehicle.id} className="flex gap-4">
              {vehicle.slug ? (
                <Link href={`/vehicles/${vehicle.slug}`} className={thumbClass}>
                  {thumb}
                </Link>
              ) : (
                <div className={thumbClass}>{thumb}</div>
              )}

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                {vehicle.slug ? (
                  <Link
                    href={`/vehicles/${vehicle.slug}`}
                    className="text-sm font-semibold text-neutral-950 transition-colors hover:text-brand sm:text-base"
                  >
                    {vehicle.name}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-neutral-950 sm:text-base">
                    {vehicle.name}
                  </span>
                )}
                <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  {formatDate(booking.startDate)} – {formatDate(booking.endDate)}
                </p>
                {booking.location && (
                  <p className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <MapPin className="size-3.5" aria-hidden="true" />
                    {booking.location}
                  </p>
                )}
              </div>
            </div>
          );
        })}

        {booking.gear.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-t border-neutral-100 pt-3">
            {booking.gear.map((gear) => (
              <span
                key={gear.id}
                className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-600"
              >
                {gear.name} × {gear.quantity}
              </span>
            ))}
          </div>
        )}

        <dl className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3 text-sm">
          <div className="flex items-center gap-1.5 text-neutral-500">
            <ReceiptText className="size-3.5 text-brand" aria-hidden="true" />
            <dt>Total paid</dt>
          </div>
          <dd className="font-bold text-neutral-950">
            {formatMoney(booking.amountPaid || booking.totalAmount)}
          </dd>
        </dl>

        {deposit > 0 && (
          <p className="-mt-2 text-xs text-neutral-500">
            Includes {formatMoney(deposit)} refundable deposit, returned after
            the vehicle is handed back.
          </p>
        )}

        {booking.refundAmount > 0 && (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            {formatMoney(booking.refundAmount)} refunded
            {booking.refundStatus === "processed" ? "" : ` (${booking.refundStatus})`}
            .
          </p>
        )}
      </div>
    </li>
  );
}

export default async function MyBookingsPage() {
  const { user } = await requireCompleteProfile("/my-bookings");
  const bookings = await getMyBookings(user.id);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl">
            My <span className="text-brand">Bookings</span>
          </h1>
          <p className="text-sm text-neutral-600">
            Track your upcoming and past rides with BRB Expeditions.
          </p>
        </header>

        <div className="mt-6">
          <AccountNav />
        </div>

        <section aria-labelledby="bookings-heading" className="mt-8">
          <h2 id="bookings-heading" className="sr-only">
            Your bookings
          </h2>

          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-10 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <CalendarCheck className="size-7" aria-hidden="true" />
              </span>

              <p className="mt-4 text-base font-semibold text-neutral-950">
                No bookings to show yet
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
                Once you book a ride, it will appear here with its dates,
                vehicle and payment status.
              </p>

              <Link
                href="/vehicles"
                className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Book Your Ride
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {bookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
