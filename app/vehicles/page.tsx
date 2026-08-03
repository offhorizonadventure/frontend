import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import {
  Bike,
  ChevronRight,
  Layers,
  MapPin,
  ReceiptText,
  RefreshCcw,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";

import { Pagination } from "@/components/pagination";
import { VehicleCard } from "@/components/vehicle-card";
import { VehicleFilters } from "@/components/vehicle-filters";
import { VehiclesToolbar } from "@/components/vehicles-toolbar";
import {
  PAGE_SIZE,
  getFilterOptions,
  getFleetStats,
  getVehicles,
  type SortKey,
} from "@/lib/vehicles";

export const metadata: Metadata = {
  title: "Explore Our Vehicles | Bikes, Cars & Scooters in Manali",
  description:
    "Browse our full self-drive fleet in Manali and Bhuntar. Filter bikes, cars and scooters by category, model, price and dates to find a well-maintained vehicle for your Himalayan trip.",
  alternates: { canonical: "/vehicles" },
  openGraph: {
    title: "Explore Our Fleet | BRB Expeditions",
    description:
      "Browse self-drive bikes, cars and scooters in the Kullu–Manali valley. Filter by category, model, price and availability.",
    url: "/vehicles",
  },
};

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Verified Vehicles",
    description: "Serviced before every ride",
  },
  {
    icon: Zap,
    title: "Quick Booking",
    description: "Reserve in a few minutes",
  },
  {
    icon: RefreshCcw,
    title: "Cancellations",
    description: "Handled by our team",
  },
  {
    icon: ReceiptText,
    title: "No Hidden Charges",
    description: "Transparent daily rates",
  },
  {
    icon: MapPin,
    title: "Local Support",
    description: "Manali & Bhuntar",
  },
] as const;

function parseList(value?: string) {
  return (value ?? "").split(",").filter(Boolean);
}

function parseNumber(value?: string) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

type SearchParams = {
  q?: string;
  category?: string;
  subcategory?: string;
  min?: string;
  max?: string;
  from?: string;
  to?: string;
  sort?: string;
  page?: string;
  view?: string;
};

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const sort: SortKey =
    params.sort === "price_desc" || params.sort === "name_asc"
      ? params.sort
      : "price_asc";
  const view = params.view === "list" ? "list" : "grid";
  const page = Math.max(1, parseNumber(params.page) ?? 1);
  // Both ends are needed before an availability lookup means anything.
  const hasDateRange = Boolean(params.from && params.to);

  const [{ vehicles, total }, filterOptions, stats] = await Promise.all([
    getVehicles({
      q: params.q?.trim() || undefined,
      categoryIds: parseList(params.category),
      subcategoryIds: parseList(params.subcategory),
      minPrice: parseNumber(params.min),
      maxPrice: parseNumber(params.max),
      from: hasDateRange ? params.from : undefined,
      to: hasDateRange ? params.to : undefined,
      sort,
      page,
    }),
    getFilterOptions(),
    getFleetStats(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const firstOnPage = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const lastOnPage = Math.min(page * PAGE_SIZE, total);

  function buildHref(nextPage: number) {
    const next = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== "page") next.set(key, value);
    });
    if (nextPage > 1) next.set("page", String(nextPage));
    const query = next.toString();
    return query ? `/vehicles?${query}` : "/vehicles";
  }

  const statCards = [
    {
      icon: Bike,
      value: `${stats.vehicles}`,
      label: stats.vehicles === 1 ? "Vehicle in fleet" : "Vehicles in fleet",
    },
    {
      icon: Layers,
      value: `${stats.categories}`,
      label: "Categories",
    },
    { icon: MapPin, value: "2", label: "Pickup cities" },
    { icon: Star, value: "4.8", label: "Rated on Google" },
  ];

  return (
    <main className="flex-1">
      {/* Hero — same washed background treatment as the homepage hero */}
      <section className="relative overflow-hidden border-b border-neutral-100">
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

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
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
              <li className="font-medium text-neutral-950">Vehicles</li>
            </ol>
          </nav>

          <h1 className="mt-3 text-2xl leading-tight font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-3xl lg:text-4xl">
            Explore <span className="text-brand">Our Fleet</span>
          </h1>
          <p className="mt-1.5 max-w-lg text-sm text-neutral-600">
            Well-maintained bikes, cars and scooters for the Kullu–Manali
            valley. Filter by category, model, price or your travel dates.
          </p>

          {/* Stats */}
          <dl className="mt-6 grid grid-cols-2 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 lg:grid-cols-4">
            {statCards.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex items-center gap-2.5 py-2.5 lg:py-0 lg:px-5 ${
                  index % 2 === 1 ? "border-l border-neutral-200 pl-4" : ""
                } ${index > 1 ? "border-t border-neutral-200 lg:border-t-0" : ""} ${
                  index > 0 ? "lg:border-l lg:border-neutral-200" : ""
                } ${index === 0 ? "lg:pl-0" : ""}`}
              >
                <stat.icon
                  className="size-5 shrink-0 text-brand sm:size-6"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <div className="flex min-w-0 flex-col">
                  <dd className="text-base font-extrabold text-neutral-950 sm:text-lg">
                    {stat.value}
                  </dd>
                  <dt className="truncate text-[11px] text-neutral-500">
                    {stat.label}
                  </dt>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Listing */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <Suspense>
            <VehicleFilters
              categories={filterOptions.categories}
              subcategories={filterOptions.subcategories}
              priceRange={filterOptions.priceRange}
            />
          </Suspense>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-neutral-600">
                {total === 0
                  ? "No vehicles found"
                  : `Showing ${firstOnPage}–${lastOnPage} of ${total} vehicle${
                      total === 1 ? "" : "s"
                    }`}
              </p>
              <Suspense>
                <VehiclesToolbar view={view} />
              </Suspense>
            </div>

            {vehicles.length === 0 ? (
              <div className="mt-8 rounded-xl border border-neutral-200 bg-neutral-50 p-10 text-center">
                <p className="text-base font-semibold text-neutral-950">
                  No vehicles match these filters
                </p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
                  Try widening your price range or clearing a filter or give
                  us a call and we&apos;ll find something for you.
                </p>
                <Link
                  href="/vehicles"
                  className="mt-5 inline-flex items-center rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                >
                  Clear filters
                </Link>
              </div>
            ) : (
              <ul
                className={
                  view === "list"
                    ? "mt-6 flex flex-col gap-4"
                    : "mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                }
              >
                {vehicles.map((vehicle) => (
                  <li key={vehicle.id}>
                    <VehicleCard vehicle={vehicle} view={view} />
                  </li>
                ))}
              </ul>
            )}

            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  buildHref={buildHref}
                />
              </div>
            )}
          </div>
        </div>

        {/* Trust bar */}
        <ul className="mt-12 grid grid-cols-1 rounded-xl border border-neutral-200 bg-white p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-5">
          {TRUST_POINTS.map((point, index) => (
            <li
              key={point.title}
              className={`flex items-center gap-3 py-4 sm:px-4 lg:py-0 ${
                index > 0 ? "border-t border-neutral-200 sm:border-t-0" : ""
              } ${index % 2 === 1 ? "sm:border-l sm:border-neutral-200" : ""} ${
                index > 1 ? "sm:border-t sm:border-neutral-200" : ""
              } lg:border-t-0 ${
                index > 0 ? "lg:border-l lg:border-neutral-200" : "lg:border-l-0"
              }`}
            >
              <point.icon
                className="size-6 shrink-0 text-brand"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-neutral-950">
                  {point.title}
                </span>
                <span className="text-xs text-neutral-500">
                  {point.description}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
