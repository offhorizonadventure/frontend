import { createClient } from "@/utils/supabase/server";
import { CollectionCard } from "@/components/collection-card";
import { Carousel } from "@/components/ui/carousel";

export type Category = {
  id: string;
  name: string;
  image_url: string | null;
  subcategoryCount: number;
};

async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicle_categories")
    .select("id, name, image_url, vehicle_subcategories(id)")
    .order("name", { ascending: true });

  if (error) {
    console.error("Failed to load vehicle categories:", error.message);
    return [];
  }

  return (
    data as unknown as Array<{
      id: string;
      name: string;
      image_url: string | null;
      vehicle_subcategories: { id: string }[];
    }>
  ).map((row) => ({
    id: row.id,
    name: row.name,
    image_url: row.image_url,
    subcategoryCount: row.vehicle_subcategories?.length ?? 0,
  }));
}

// Server Component: categories are fetched at request time so the cards are in
// the initial HTML for crawlers. There are only a handful of categories, so
// they render as a plain responsive grid rather than a carousel.
export async function CategorySection() {
  const categories = await getCategories();

  if (categories.length === 0) {
    return null;
  }

  return (
    <section
      id="categories"
      className="mx-auto max-w-7xl scroll-mt-28 px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      aria-labelledby="shop-by-category-heading"
    >
      <div className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center">
        <span className="inline-flex items-center rounded-md bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
          Our Fleet
        </span>
        <h2
          id="shop-by-category-heading"
          className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl"
        >
          Shop By <span className="text-brand">Category</span>
        </h2>
        <p className="text-sm text-neutral-500 sm:text-base">
          Find the perfect ride for your journey
        </p>
      </div>

      <div className="mt-10">
        <Carousel ariaLabel="Vehicle categories" itemsLabel="categories">
          {/* Exact fractions of the row (minus the shared 1.5rem gaps) so a
              page scroll always lands on a clean card edge: 1 / 2 / 3 per view. */}
          {categories.map((category) => (
            <li
              key={category.id}
              className="w-full shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
            >
              <CollectionCard
                href={`/category/${category.id}`}
                title={category.name}
                subtitle={
                  category.subcategoryCount > 0
                    ? `${category.subcategoryCount} model${
                        category.subcategoryCount === 1 ? "" : "s"
                      } available`
                    : null
                }
                imageUrl={category.image_url}
                imageAlt={`${category.name} available to rent at BRB Expeditions`}
              />
            </li>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
