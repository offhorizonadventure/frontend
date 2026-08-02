import type * as React from "react";

import { CollectionCard } from "@/components/collection-card";
import { Carousel } from "@/components/ui/carousel";
import { CITY_CATEGORIES, categoryPath } from "@/lib/city-content";
import { createClient } from "@/utils/supabase/server";

type CategoryRow = {
  id: string;
  name: string;
  image_url: string | null;
};

/**
 * Categories for a city page, using the same cards as the homepage.
 *
 * Only the three rental categories are shown, matched to the database rows by
 * name so the real photo is used. Each links to that city's category page
 * rather than the generic /category/[id] route.
 */
async function getCityCategories(citySlug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicle_categories")
    .select("id, name, image_url");

  if (error) {
    console.error("Failed to load categories:", error.message);
    return [];
  }

  const rows = (data ?? []) as CategoryRow[];

  // Driven by CITY_CATEGORIES rather than by the query, so the order on the
  // page is always Bike, Car, Scooter regardless of how the rows come back.
  return CITY_CATEGORIES.map((category) => {
    const row = rows.find(
      (r) => r.name.toLowerCase() === category.categoryName.toLowerCase()
    );

    return {
      key: category.key,
      label: category.label,
      blurb: category.blurb,
      imageUrl: row?.image_url ?? null,
      href: categoryPath(citySlug, category.key),
    };
  });
}

export async function CityCategorySection({
  citySlug,
  city,
  /** Hides one category — used on a category page to cross-link the others. */
  excludeKey,
  eyebrow = "Our Fleet",
  heading,
  subheading,
}: {
  citySlug: string;
  city: string;
  excludeKey?: string;
  eyebrow?: string;
  heading?: React.ReactNode;
  subheading?: string;
}) {
  const all = await getCityCategories(citySlug);
  const categories = excludeKey
    ? all.filter((category) => category.key !== excludeKey)
    : all;

  if (categories.length === 0) return null;

  return (
    <section
      id="categories"
      className="scroll-mt-28"
      aria-labelledby="city-categories-heading"
    >
      <div className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center">
        <span className="inline-flex items-center rounded-md bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
          {eyebrow}
        </span>
        <h2
          id="city-categories-heading"
          className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl"
        >
          {heading ?? (
            <>
              Shop By <span className="text-brand">Category</span>
            </>
          )}
        </h2>
        <p className="text-sm text-neutral-500 sm:text-base">
          {subheading ?? `Find the perfect ride for your journey in ${city}`}
        </p>
      </div>

      <div className="mt-10">
        <Carousel ariaLabel={`${city} vehicle categories`} itemsLabel="categories">
          {/* Exact fractions of the row (minus the shared 1.5rem gaps) so a
              page scroll always lands on a clean card edge: 1 / 2 / 3 per view. */}
          {categories.map((category) => (
            <li
              key={category.key}
              className="w-full shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            >
              <CollectionCard
                href={category.href}
                title={`${category.label} in ${city}`}
                subtitle={category.blurb}
                imageUrl={category.imageUrl}
                imageAlt={`${category.label} in ${city} from BRB Expeditions`}
              />
            </li>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
