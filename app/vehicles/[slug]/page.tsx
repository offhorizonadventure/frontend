import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  Clock3,
  Fuel,
  Gauge,
  Headset,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";

import { BookingPanel } from "@/components/booking-panel";
import { VehicleCard } from "@/components/vehicle-card";
import { VehicleGallery, type GalleryImage } from "@/components/vehicle-gallery";
import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/locations";
import {
  getRelatedVehicles,
  getVehicleBySlug,
  isVehicleAvailable,
} from "@/lib/vehicles";

const GOOGLE_RATING = 4.8;

const TRUST_POINTS = [
  { icon: ShieldCheck, title: "Verified Vehicle", description: "Quality checked" },
  { icon: Zap, title: "Instant Booking", description: "Book in 2 minutes" },
  { icon: Clock3, title: "Flexible Cancellation", description: "Cancel anytime" },
  { icon: ReceiptText, title: "No Hidden Charges", description: "Transparent pricing" },
  { icon: Headset, title: "Local Support", description: "Manali & Bhuntar" },
] as const;

const INCLUSIONS = [
  "Helmet for the rider",
  "Vehicle documents and insurance papers",
  "Basic tool kit and puncture guidance",
  "24/7 phone support through your trip",
] as const;

const POLICIES = [
  "A valid driving licence and a government photo ID are required at pickup.",
  "A refundable security deposit is collected at pickup and depends on your route.",
  "Fuel is not included and the vehicle is handed over and returned at the same level.",
  "Late returns are charged pro rata at the daily rate.",
] as const;

function formatMoney(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

type Params = Promise<{ slug: string }>;
type Search = Promise<{ from?: string; to?: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) {
    return { title: "Vehicle not found | BRB Expeditions" };
  }

  const description = `Rent the ${vehicle.name} in Manali and Bhuntar from ${formatMoney(
    vehicle.pricePerDay
  )} per day. Well-maintained, fully insured and ready for the Himalayas. Book online with BRB Expeditions.`;

  return {
    title: `${vehicle.name} on Rent in Manali | BRB Expeditions`,
    description,
    alternates: { canonical: `/vehicles/${vehicle.slug}` },
    openGraph: {
      title: `${vehicle.name} on Rent | BRB Expeditions`,
      description,
      url: `/vehicles/${vehicle.slug}`,
      images: vehicle.imageUrl ? [{ url: vehicle.imageUrl }] : undefined,
    },
  };
}

export default async function VehicleDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const { slug } = await params;
  const { from, to } = await searchParams;

  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  // Availability is only meaningful with both ends of a range, and is always
  // resolved on the server — never inferred in the browser.
  const hasRange = Boolean(from && to && to >= from);
  const [available, related] = await Promise.all([
    hasRange ? isVehicleAvailable(vehicle.id, from!, to!) : Promise.resolve(null),
    getRelatedVehicles(vehicle),
  ]);

  const images: GalleryImage[] = [
    vehicle.imageUrl && { url: vehicle.imageUrl, caption: "vehicle photo" },
    vehicle.conditionPhotoUrl && {
      url: vehicle.conditionPhotoUrl,
      caption: "current condition",
    },
  ].filter(Boolean) as GalleryImage[];

  const specs = [
    { icon: Gauge, label: "Category", value: vehicle.categoryName ?? "—" },
    { icon: Star, label: "Model", value: vehicle.subcategoryName ?? "—" },
    { icon: Fuel, label: "Fuel at pickup", value: vehicle.fuelLevel },
    {
      icon: ShieldCheck,
      label: "Documents",
      value: vehicle.papersValid ? "All valid" : "Ask our team",
    },
  ];

  // Structured data so the listing can surface as a rich result.
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: vehicle.name,
    image: images.map((image) => image.url),
    category: vehicle.categoryName ?? undefined,
    brand: vehicle.subcategoryName
      ? { "@type": "Brand", name: vehicle.subcategoryName }
      : undefined,
    offers: {
      "@type": "Offer",
      price: vehicle.pricePerDay,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `/vehicles/${vehicle.slug}`,
    },
  };

  return (
    <main className="flex-1 bg-neutral-50">
      <script
        type="application/ld+json"
        // Server-rendered from our own database, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* Breadcrumb */}
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
                href="/vehicles"
                className="transition-colors hover:text-brand"
              >
                Vehicles
              </Link>
            </li>
            {vehicle.subcategoryId && (
              <>
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
                <li>
                  <Link
                    href={`/vehicles?subcategory=${vehicle.subcategoryId}`}
                    className="transition-colors hover:text-brand"
                  >
                    {vehicle.subcategoryName}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden="true">
              <ChevronRight className="size-3.5" />
            </li>
            <li className="font-medium text-neutral-950">{vehicle.name}</li>
          </ol>
        </nav>

        {/* Gallery + booking panel. Single column on mobile, split from lg. */}
        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-8">
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-neutral-200 bg-white p-3 sm:p-4">
              <VehicleGallery
                images={images}
                vehicleName={vehicle.name}
                available={available}
              />
            </div>

            {/* Title block — first in the DOM order that matters for mobile,
                repeated compactly here for desktop reading flow. */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
              <h1 className="text-2xl font-extrabold tracking-tight text-neutral-950 sm:text-3xl">
                {vehicle.name}
              </h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-500">
                {vehicle.subcategoryName && <span>{vehicle.subcategoryName}</span>}
                <span className="flex items-center gap-1">
                  <Star
                    className="size-4 fill-brand text-brand"
                    aria-hidden="true"
                  />
                  <span className="font-semibold text-neutral-950">
                    {GOOGLE_RATING}
                  </span>
                  rated on Google
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-4 text-brand" aria-hidden="true" />
                  Manali &amp; Bhuntar
                </span>
              </p>

              <p className="mt-4 flex items-baseline gap-1.5">
                <span className="text-3xl font-extrabold text-neutral-950">
                  {formatMoney(vehicle.pricePerDay)}
                </span>
                <span className="text-sm text-neutral-500">/ day</span>
              </p>

              {/* Specs */}
              <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-neutral-200 pt-5 sm:grid-cols-4">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-center gap-2.5 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5"
                  >
                    <spec.icon
                      className="size-4 shrink-0 text-brand"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                    <div className="flex min-w-0 flex-col">
                      <dt className="text-[11px] text-neutral-500">
                        {spec.label}
                      </dt>
                      <dd className="truncate text-xs font-semibold text-neutral-950">
                        {spec.value}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>

              {vehicle.note && (
                <p className="mt-5 rounded-xl bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-600">
                  {vehicle.note}
                </p>
              )}
            </section>

            {/* What's included / good to know */}
            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
                <h2 className="text-sm font-bold tracking-wide text-neutral-950 uppercase">
                  What&apos;s Included
                </h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {INCLUSIONS.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-neutral-600"
                    >
                      <ShieldCheck
                        className="mt-0.5 size-4 shrink-0 text-brand"
                        strokeWidth={1.75}
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
                <h2 className="text-sm font-bold tracking-wide text-neutral-950 uppercase">
                  Good To Know
                </h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {POLICIES.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm text-neutral-600"
                    >
                      <span
                        className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          {/* Booking panel — sticky alongside the gallery on desktop. */}
          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <BookingPanel
              vehicleId={vehicle.id}
              vehicleSlug={vehicle.slug}
              pricePerDay={vehicle.pricePerDay}
              defaultFrom={from}
              defaultTo={to}
            />

            <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
              <h2 className="text-sm font-bold text-neutral-950">Need Help?</h2>
              <p className="mt-1 text-xs text-neutral-500">
                Our team rides these roads every week call us and we&apos;ll
                match you to the right vehicle.
              </p>
              <a
                href={SUPPORT_PHONE_HREF}
                className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:border-neutral-950"
              >
                <Headset className="size-4 text-brand" aria-hidden="true" />
                {SUPPORT_PHONE}
              </a>
            </div>
          </aside>
        </div>

        {/* Related vehicles */}
        {related.length > 0 && (
          <section className="mt-10" aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="text-sm font-bold tracking-wide text-neutral-950 uppercase"
            >
              You May Also Like
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.slice(0, 4).map((item) => (
                <li key={item.id}>
                  <VehicleCard vehicle={item} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Trust bar */}
        <ul className="mt-10 grid grid-cols-1 rounded-2xl border border-neutral-200 bg-white p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-5">
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
      </div>
    </main>
  );
}
