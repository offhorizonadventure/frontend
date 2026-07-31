import Image from "next/image";
import Link from "next/link";

import { createClient } from "@/utils/supabase/server";
import { ArrowRight, BadgeCheck, MapPin, Star } from "lucide-react";

const GOOGLE_RATING = 4.8;
const FOUNDED_YEAR = 2014;

/** Five stars with the row clipped to the exact rating (e.g. 4.8 → 96%). */
function StarRating({ rating }: { rating: number }) {
  const percent = (rating / 5) * 100;

  return (
    <span
      className="relative inline-flex"
      role="img"
      aria-label={`Rated ${rating} out of 5 on Google`}
    >
      <span className="flex text-neutral-300">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-4 fill-current" aria-hidden="true" />
        ))}
      </span>
      <span
        className="absolute inset-0 flex overflow-hidden text-brand"
        style={{ width: `${percent}%` }}
        aria-hidden="true"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="size-4 shrink-0 fill-current" />
        ))}
      </span>
    </span>
  );
}

/** Cheapest daily rate in the fleet, for the hero's "starting from" card. */
async function getLowestPrice(): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("price_per_day")
    .order("price_per_day", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Failed to load lowest price:", error.message);
    return null;
  }

  return data?.price_per_day ?? null;
}

export async function Hero() {
  const lowestPrice = await getLowestPrice();

  return (
    <section className="relative overflow-hidden bg-white">
      {/* Background image of a mountain road, washed out so foreground text
          keeps a strong contrast ratio. */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-white/90" />
      </div>

      {/* Soft brand glow behind the bike for depth. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-0 hidden size-[38rem] -translate-y-1/2 translate-x-1/4 rounded-full bg-brand/10 blur-3xl lg:block"
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:py-12 lg:px-8">
        <div className="flex flex-col items-start gap-5">
          <span
            className="animate-fade-up inline-flex items-center gap-2 rounded-full bg-neutral-950 py-1 pr-4 pl-1 text-xs font-semibold tracking-wide text-white sm:text-sm"
            style={{ animationDelay: "0ms" }}
          >
            <Image
              src="/rf-logo.png"
              alt="Royal Enfield"
              width={44}
              height={44}
              className="size-8 shrink-0 object-contain"
            />
            Official Partner of Royal Enfield
          </span>

          <h1
            className="animate-fade-up text-4xl leading-[0.95] font-extrabold text-neutral-950 uppercase italic sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "100ms" }}
          >
            <span className="block">Ride</span>
            <span className="text-brand block">Beyond</span>
            <span className="block">Boundaries</span>
          </h1>

          <p
            className="animate-fade-up max-w-md text-sm text-neutral-600 sm:text-base"
            style={{ animationDelay: "200ms" }}
          >
            Well-maintained bikes, honest daily rates and local riders who know
            every turn of the Himalayas.
          </p>

          <div
            className="animate-fade-up flex flex-wrap items-center gap-3"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-1.5 rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-105 hover:bg-brand-dark"
            >
              Book Your Ride
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <Link
              href="/vehicles"
              className="inline-flex items-center rounded-md border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:border-neutral-950"
            >
              Explore Vehicles
            </Link>
          </div>

          {/* Stats — stacked one per row on small screens, single line from
              sm upward. Dividers flip from horizontal to vertical to match. */}
          <dl
            className="animate-fade-up mt-2 flex w-full max-w-lg flex-col divide-y divide-neutral-200 border-t border-neutral-200 pt-4 sm:flex-row sm:items-center sm:divide-x sm:divide-y-0 sm:pt-5"
            style={{ animationDelay: "380ms" }}
          >
            <div className="flex flex-col gap-0.5 py-2.5 sm:py-0 sm:pr-5">
              <dd className="order-1 text-xl font-extrabold text-neutral-950 sm:text-2xl">
                {FOUNDED_YEAR}
              </dd>
              <dt className="order-2 text-[11px] font-medium text-neutral-500 sm:text-xs">
                Serving since
              </dt>
            </div>

            <div className="flex flex-col gap-0.5 py-2.5 sm:px-5 sm:py-0">
              <dd className="order-1 flex items-center gap-1.5">
                <span className="text-xl font-extrabold text-neutral-950 sm:text-2xl">
                  {GOOGLE_RATING}
                </span>
                <StarRating rating={GOOGLE_RATING} />
              </dd>
              <dt className="order-2 text-[11px] font-medium text-neutral-500 sm:text-xs">
                Rated on Google
              </dt>
            </div>

            <div className="flex flex-col gap-0.5 py-2.5 sm:py-0 sm:pl-5">
              <dd className="order-1 flex items-center gap-1 text-sm font-bold text-neutral-950 sm:text-base">
                <MapPin
                  className="size-3.5 shrink-0 text-brand sm:size-4"
                  aria-hidden="true"
                />
                Manali &amp; Bhuntar
              </dd>
              <dt className="order-2 text-[11px] font-medium text-neutral-500 sm:text-xs">
                Pickup points
              </dt>
            </div>
          </dl>
        </div>

        <div
          className="animate-fade-up relative mx-auto aspect-square w-full max-w-sm sm:max-w-md lg:max-w-xl"
          style={{ animationDelay: "150ms" }}
        >
          <Image
            src="/hero_vehicle.png"
            alt="Royal Enfield motorcycle available to rent at BRB Expeditions"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 90vw"
            className="object-contain drop-shadow-2xl"
          />

          {/* Floating price card — placeholder rate until real pricing is set */}
          <div className="absolute top-4 right-0 flex flex-col gap-1.5 rounded-xl border border-neutral-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur sm:top-6">
            <span className="text-[11px] font-medium tracking-wide text-neutral-500 uppercase">
              Starting From
            </span>
            <span className="text-2xl font-extrabold text-neutral-950">
              ₹{(lowestPrice ?? 0).toLocaleString("en-IN")}
              <span className="text-sm font-medium text-neutral-500">/day</span>
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <BadgeCheck className="size-3.5" aria-hidden="true" />
              Verified Bikes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
