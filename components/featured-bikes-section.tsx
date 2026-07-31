import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";

import { createClient } from "@/utils/supabase/server";
import { Carousel } from "@/components/ui/carousel";

type FeaturedBike = {
  id: string;
  name: string;
  slug: string;
  pricePerDay: number;
  imageUrl: string | null;
  fuelLevel: string;
  subcategoryName: string | null;
  categoryName: string | null;
};

type VehicleRow = {
  id: string;
  name: string;
  slug: string;
  price_per_day: number;
  bike_photo_url: string | null;
  fuel_level: string;
  vehicle_subcategories: {
    name: string;
    vehicle_categories: { name: string } | null;
  } | null;
};

/**
 * Vehicles an admin has flagged as featured, cheapest first. Which bikes appear
 * here is curated from the dashboard rather than inferred, so the section can be
 * changed without a deploy.
 */
async function getFeaturedBikes(): Promise<FeaturedBike[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select(
      `id, name, slug, price_per_day, bike_photo_url, fuel_level,
       vehicle_subcategories(name, vehicle_categories(name))`
    )
    .eq("is_featured", true)
    .order("price_per_day", { ascending: true });

  if (error) {
    console.error("Failed to load featured bikes:", error.message);
    return [];
  }

  return ((data ?? []) as unknown as VehicleRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    pricePerDay: row.price_per_day,
    imageUrl: row.bike_photo_url,
    fuelLevel: row.fuel_level,
    subcategoryName: row.vehicle_subcategories?.name ?? null,
    categoryName:
      row.vehicle_subcategories?.vehicle_categories?.name ?? null,
  }));
}

function formatMoney(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export async function FeaturedBikesSection() {
  const bikes = await getFeaturedBikes();

  if (bikes.length === 0) {
    return null;
  }

  return (
    <section
      id="bikes"
      className="scroll-mt-28 bg-neutral-50 py-14 lg:py-20"
      aria-labelledby="featured-bikes-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center">
          <span className="inline-flex items-center rounded-md bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
            Ready To Ride
          </span>
          <h2
            id="featured-bikes-heading"
            className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl"
          >
            Our <span className="text-brand">Rides</span>
          </h2>
          <p className="text-sm text-neutral-500 sm:text-base">
            A pick from every model in our fleet
          </p>
          <Link
            href="/vehicles"
            className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
          >
            View all vehicles
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10">
          <Carousel ariaLabel="Featured vehicles" itemsLabel="vehicles">
            {/* Exact fractions of the row (minus the shared 1.5rem gaps) so a
                page scroll always lands on a clean card edge: 2 / 3 / 4 per view. */}
            {bikes.map((bike) => (
              <li
                key={bike.id}
                className="w-full shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)] xl:w-[calc((100%-4.5rem)/4)]"
              >
                <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">
                  <div className="relative aspect-[4/3] overflow-hidden bg-white">
                    {bike.imageUrl ? (
                      <Image
                        src={bike.imageUrl}
                        alt={`${bike.name} available to rent at BRB Expeditions`}
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                        // Straight from Supabase's CDN — see collection-card.
                        unoptimized
                        // contain, not cover: product shots are framed with the
                        // whole vehicle in view, so cropping to fill lops off
                        // wheels and handlebars.
                        className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
                        <ImageIcon className="size-7" aria-hidden="true" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <h3 className="truncate text-sm font-semibold text-neutral-950">
                      {bike.name}
                    </h3>

                    {/* One quiet, consistent pill style — the card's colour
                        should come from the photo and the CTA, not the tags. */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {bike.categoryName && (
                        <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                          {bike.categoryName}
                        </span>
                      )}
                      {bike.subcategoryName && (
                        <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                          {bike.subcategoryName}
                        </span>
                      )}
                      <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
                        Fuel {bike.fuelLevel}
                      </span>
                    </div>

                    <p className="flex items-baseline gap-1">
                      <span className="text-base font-bold text-neutral-950">
                        {formatMoney(bike.pricePerDay)}
                      </span>
                      <span className="text-xs text-neutral-500">/day</span>
                    </p>

                    <Link
                      href={`/vehicles/${bike.slug}`}
                      className="mt-auto inline-flex items-center justify-center rounded-md bg-brand px-3 py-2 text-xs font-semibold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark"
                    >
                      View Details
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
