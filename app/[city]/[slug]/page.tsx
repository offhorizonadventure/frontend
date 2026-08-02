import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Bike,
  Car,
  ChevronRight,
  Headset,
  Zap,
} from "lucide-react";

import { CityCategorySection } from "@/components/city-category-section";
import { CityContentSections } from "@/components/city-content-sections";
import { VehicleCard } from "@/components/vehicle-card";
import {
  BHUNTAR,
  CITY_CATEGORIES,
  MANALI,
  categoryPath,
  parseCategorySlug,
  type CityContent,
} from "@/lib/city-content";
import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/locations";
import { getShowcaseVehiclesByCategory } from "@/lib/vehicles";

const SITE_URL = "https://www.bikerentalsbhuntar.com";

const CITIES: Record<string, CityContent> = {
  manali: MANALI,
  bhuntar: BHUNTAR,
};

const CATEGORY_ICONS: Record<string, typeof Bike> = {
  bike: Bike,
  car: Car,
  scooter: Zap,
};

type Params = Promise<{ city: string; slug: string }>;

/**
 * Pre-renders the six real combinations at build time.
 *
 * Everything else falls through to notFound(), so this dynamic segment can't
 * be used to mint unlimited thin pages by guessing URLs — which search
 * engines penalise and crawlers waste budget on.
 */
export function generateStaticParams() {
  return Object.keys(CITIES).flatMap((city) =>
    CITY_CATEGORIES.map((category) => ({
      city,
      slug: `${category.key}-rental-in-${city}`,
    }))
  );
}

function resolve(city: string, slug: string) {
  const content = CITIES[city];
  if (!content) return null;

  const category = parseCategorySlug(city, slug);
  if (!category) return null;

  return { content, category };
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { city, slug } = await params;
  const match = resolve(city, slug);

  if (!match) return { title: "Not found | BRB Expeditions" };

  const { content, category } = match;
  const title = `${category.label} in ${content.city} — Self Drive from BRB Expeditions`;
  const description = `${category.label} in ${content.city}. ${category.blurb} Transparent pricing, well-maintained vehicles and local support in ${content.city}.`;

  return {
    title,
    description,
    alternates: { canonical: categoryPath(city, category.key) },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "BRB Expeditions",
      title,
      description,
      url: categoryPath(city, category.key),
      images: [{ url: content.ogImage, alt: content.ogImageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [content.ogImage],
    },
  };
}

export default async function CityCategoryPage({ params }: { params: Params }) {
  const { city, slug } = await params;
  const match = resolve(city, slug);

  if (!match) notFound();

  const { content, category } = match;
  const { vehicles, curated } = await getShowcaseVehiclesByCategory(
    category.categoryName
  );
  const Icon = CATEGORY_ICONS[category.key] ?? Bike;
  const heading = `${category.label} in ${content.city}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: content.city,
          item: `${SITE_URL}/${city}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: heading,
          item: `${SITE_URL}${categoryPath(city, category.key)}`,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: content.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ];

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero — same washed background treatment as every other landing page */}
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
            <ol className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 sm:text-sm">
              <li>
                <Link href="/" className="transition-colors hover:text-brand">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li>
                <Link
                  href={`/${city}`}
                  className="transition-colors hover:text-brand"
                >
                  {content.city}
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li className="font-medium text-neutral-950">
                {category.label}
              </li>
            </ol>
          </nav>

          <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
            <Icon className="size-3.5" aria-hidden="true" />
            {content.city}
          </span>

          <h1 className="mt-2 max-w-4xl text-2xl leading-tight font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-3xl lg:text-4xl">
            {category.label} in <span className="text-brand">{content.city}</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
            {category.blurb}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              See All Vehicles
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href={SUPPORT_PHONE_HREF}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:border-neutral-950"
            >
              <Headset className="size-4 text-brand" aria-hidden="true" />
              {SUPPORT_PHONE}
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-10 sm:px-6 lg:gap-20 lg:px-8 lg:py-14">
        {/* Vehicles */}
        <section aria-labelledby="fleet-heading">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2
                id="fleet-heading"
                className="text-2xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-3xl"
              >
                {curated ? (
                  <>
                    Our <span className="text-brand">Picks</span>
                  </>
                ) : (
                  <>
                    Available <span className="text-brand">Now</span>
                  </>
                )}
              </h2>
              <p className="mt-1 max-w-xl text-sm text-neutral-600">
                {curated
                  ? `Hand-picked ${category.label.toLowerCase()} options for ${content.city}.`
                  : `Everything we currently rent in this category.`}
              </p>
            </div>
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
            >
              View all
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          {vehicles.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-10 text-center">
              <p className="text-base font-semibold text-neutral-950">
                Nothing listed here just yet
              </p>
              <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
                Give us a call and we&apos;ll tell you what&apos;s available in{" "}
                {content.city} right now.
              </p>
              <a
                href={SUPPORT_PHONE_HREF}
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                <Headset className="size-4" aria-hidden="true" />
                {SUPPORT_PHONE}
              </a>
            </div>
          ) : (
            <ul className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {vehicles.map((vehicle) => (
                <li key={vehicle.id}>
                  <VehicleCard vehicle={vehicle} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <CityContentSections content={content} />

        {/* Cross-links to the other two categories, using the same cards */}
        <CityCategorySection
          citySlug={city}
          city={content.city}
          excludeKey={category.key}
          eyebrow="Keep Looking"
          heading={
            <>
              Also In <span className="text-brand">{content.city}</span>
            </>
          }
          subheading={`Other ways to explore ${content.city}`}
        />
      </div>
    </main>
  );
}
