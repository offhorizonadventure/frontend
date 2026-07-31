import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { createClient } from "@/utils/supabase/server";

type Gear = {
  id: string;
  name: string;
  price_per_day: number;
};

async function getGears(): Promise<Gear[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gears")
    .select("id, name, price_per_day")
    .order("price_per_day", { ascending: true });

  if (error) {
    console.error("Failed to load gears:", error.message);
    return [];
  }

  return data ?? [];
}

function formatMoney(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

// Server Component: fetches gear pricing at request time so the rates are in
// the initial HTML (SEO-friendly, indexable), and needs no client JS.
export async function GearsSection() {
  const gears = await getGears();

  if (gears.length === 0) {
    return null;
  }

  const lowestPrice = Math.min(...gears.map((gear) => gear.price_per_day));

  return (
    <section className="bg-neutral-50 py-14 lg:py-20" aria-labelledby="gear-heading">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16 lg:px-8">
        {/* Left: pitch */}
        <div className="flex flex-col items-start gap-5">
          <span className="inline-flex items-center rounded-md bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
            Riding Gear
          </span>

          <h2
            id="gear-heading"
            className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl"
          >
            Gear Up From
            <span className="text-brand"> {formatMoney(lowestPrice)}/day</span>
          </h2>

          <p className="max-w-md text-sm text-neutral-600 sm:text-base">
            Riding the Himalayas needs more than a bike. Add tested, well-kept
            gear to any rental no deposits, no bundles, just honest daily
            rates.
          </p>

          <ul className="flex flex-col gap-2.5">
            {[
              "Sanitised and inspected before every ride",
              "Add to any booking and pay only for days you ride",
              "Sizes for every rider, pillion included",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2.5 text-sm text-neutral-700">
                <Check
                  className="mt-0.5 size-4 shrink-0 text-brand"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                {point}
              </li>
            ))}
          </ul>

          <Link
            href="/vehicles"
            className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-neutral-950 px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
          >
            Add Gear To Your Ride
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        {/* Right: price list */}
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
          <div className="flex items-baseline justify-between border-b border-neutral-200 px-6 py-4">
            <h3 className="text-sm font-semibold tracking-wide text-neutral-950 uppercase">
              Gear Rates
            </h3>
            <span className="text-xs font-medium text-neutral-500">
              Per day, taxes included
            </span>
          </div>

          <ul className="divide-y divide-neutral-100">
            {gears.map((gear) => (
              <li
                key={gear.id}
                className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-neutral-50"
              >
                <span className="text-sm font-medium text-neutral-800">
                  {gear.name}
                </span>
                <span className="flex shrink-0 items-baseline gap-1">
                  <span className="text-base font-bold text-neutral-950 tabular-nums">
                    {formatMoney(gear.price_per_day)}
                  </span>
                  <span className="text-xs text-neutral-500">/day</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
