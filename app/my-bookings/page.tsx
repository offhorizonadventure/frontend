import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck } from "lucide-react";

import { AccountNav } from "@/components/account-nav";
import { requireCompleteProfile } from "@/utils/supabase/require-user";

export const metadata: Metadata = {
  title: "My Bookings | BRB Expeditions",
  robots: { index: false, follow: false },
};

/**
 * Booking history screen — layout only for now. Fetching the signed-in user's
 * bookings and rendering their status is a separate piece of work.
 */
export default async function MyBookingsPage() {
  await requireCompleteProfile("/my-bookings");

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

        <section
          aria-labelledby="bookings-heading"
          className="mt-8 rounded-2xl border border-neutral-200 bg-white p-10 text-center"
        >
          <h2 id="bookings-heading" className="sr-only">
            Your bookings
          </h2>

          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
            <CalendarCheck className="size-7" aria-hidden="true" />
          </span>

          <p className="mt-4 text-base font-semibold text-neutral-950">
            No bookings to show yet
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
            Once you book a ride, it will appear here with its dates, vehicle
            and payment status.
          </p>

          <Link
            href="/vehicles"
            className="mt-6 inline-flex items-center gap-1.5 rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Book Your Ride
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}
