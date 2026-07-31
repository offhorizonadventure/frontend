import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { createClient } from "@/utils/supabase/server";
import { CollectionCard } from "@/components/collection-card";
import { Carousel } from "@/components/ui/carousel";

type Subcategory = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
};

type CategoryWithSubcategories = {
  id: string;
  name: string;
  subcategories: Subcategory[];
};

async function getCategory(
  id: string
): Promise<CategoryWithSubcategories | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicle_categories")
    .select(
      "id, name, vehicle_subcategories(id, name, description, image_url)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load category:", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as unknown as {
    id: string;
    name: string;
    vehicle_subcategories: Subcategory[];
  };

  return {
    id: row.id,
    name: row.name,
    subcategories: (row.vehicle_subcategories ?? []).sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    return { title: "Category not found" };
  }

  const title = `${category.name} Rentals in Manali & Bhuntar | BRB Expeditions`;
  const description = `Browse our ${category.name.toLowerCase()} rental range in the Kullu–Manali valley. Well-maintained vehicles, transparent daily rates and local support.`;

  return {
    title,
    description,
    alternates: { canonical: `/category/${category.id}` },
    openGraph: { title, description, url: `/category/${category.id}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <nav aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 text-sm text-neutral-500">
            <li>
              <Link href="/" className="transition-colors hover:text-brand">
                Home
              </Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li className="font-medium text-neutral-950">{category.name}</li>
          </ol>
        </nav>

        <header className="mt-6 flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl">
            Explore <span className="text-brand">{category.name}</span>
          </h1>
          <p className="max-w-xl text-sm text-neutral-600 sm:text-base">
            Choose a model to see availability and daily rates.
          </p>
        </header>

        {category.subcategories.length === 0 ? (
          <p className="mt-12 rounded-xl border border-neutral-200 bg-neutral-50 p-8 text-center text-sm text-neutral-500">
            No models listed under {category.name} yet. Please check back soon.
          </p>
        ) : (
          <div className="mt-8">
            <Carousel
              ariaLabel={`${category.name} models`}
              itemsLabel="models"
            >
              {category.subcategories.map((subcategory) => (
                <li
                  key={subcategory.id}
                  className="w-full shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
                >
                  <CollectionCard
                    href={`/vehicles?subcategory=${subcategory.id}`}
                    title={subcategory.name}
                    subtitle={subcategory.description}
                    imageUrl={subcategory.image_url}
                    imageAlt={`${subcategory.name} available to rent at BRB Expeditions`}
                  />
                </li>
              ))}
            </Carousel>
          </div>
        )}
      </div>
    </main>
  );
}
