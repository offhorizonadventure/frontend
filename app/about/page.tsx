import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bike,
  ChevronRight,
  Headset,
  MapPin,
  ReceiptText,
  ShieldCheck,
  Smile,
  Sparkles,
  Users,
} from "lucide-react";

import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/locations";
import { TEAM, WHY_CHOOSE_US } from "@/lib/team";

export const metadata: Metadata = {
  title: "About Us | BRB Expeditions — Bike & Car Rentals in Himachal",
  description:
    "Leading the motorbike and car adventure in Himachal since 2014. Self-drive 4x4 cars, bikes and scooties in Manali and Bhuntar, with a team that keeps every ride safe and hassle-free.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    title: "About BRB Expeditions",
    description:
      "Leading the motorbike and car adventure in Himachal since 2014. Self-drive cars, bikes and scooties in Manali and Bhuntar.",
    url: "/about",
  },
};

// Paired with WHY_CHOOSE_US by index.
const WHY_ICONS = [
  BadgeCheck,
  Bike,
  Sparkles,
  Users,
  MapPin,
  ShieldCheck,
  Smile,
  ReceiptText,
] as const;

const STATS = [
  { value: "2014", label: "Serving since" },
  { value: "4.8", label: "Rated on Google" },
  { value: "2", label: "Pickup cities" },
  { value: "1000+", label: "Happy riders" },
] as const;

export default function AboutPage() {
  const organisationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BRB Expeditions",
    url: "https://www.bikerentalsbhuntar.com/about",
    foundingDate: "2014",
    telephone: SUPPORT_PHONE,
    areaServed: ["Manali", "Bhuntar", "Kullu", "Himachal Pradesh"],
    employee: TEAM.flatMap((group) =>
      group.members.map((member) => ({
        "@type": "Person",
        name: member.name,
        jobTitle: group.role,
      }))
    ),
  };

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        // Our own copy, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organisationJsonLd) }}
      />

      {/* Hero — same washed background treatment as the vehicles page */}
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
            <ol className="flex items-center gap-1.5 text-xs text-neutral-500 sm:text-sm">
              <li>
                <Link href="/" className="transition-colors hover:text-brand">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li className="font-medium text-neutral-950">About Us</li>
            </ol>
          </nav>

          <h1 className="mt-3 max-w-4xl text-2xl leading-tight font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-3xl lg:text-4xl">
            BRB Expeditions — Leading the Motorbike and Car Adventure in{" "}
            <span className="text-brand">Himachal Since 2014</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
            Drive with confidence. Travel with freedom. Adventure with us.
          </p>

          <dl className="mt-6 grid grid-cols-2 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 lg:grid-cols-4">
            {STATS.map((stat, index) => (
              <div
                key={stat.label}
                className={`flex flex-col py-2.5 lg:py-0 lg:px-5 ${
                  index % 2 === 1 ? "border-l border-neutral-200 pl-4" : ""
                } ${index > 1 ? "border-t border-neutral-200 lg:border-t-0" : ""} ${
                  index > 0 ? "lg:border-l lg:border-neutral-200" : ""
                } ${index === 0 ? "lg:pl-0" : ""}`}
              >
                <dd className="text-lg font-extrabold text-neutral-950 sm:text-xl">
                  {stat.value}
                </dd>
                <dt className="text-[11px] text-neutral-500">{stat.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-10 sm:px-6 lg:gap-20 lg:px-8 lg:py-14">
        {/* Story */}
        <section aria-labelledby="story-heading">
          <h2
            id="story-heading"
            className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl"
          >
            Our <span className="text-brand">Story</span>
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
            <div className="flex flex-col gap-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
              <p>
                Founded in 2014, we began our journey with a simple goal — to
                make travel easy, comfortable, and adventurous for everyone.
                Over the years, we have grown into a trusted and reliable car
                &amp; bike rental service, known for quality vehicles and
                excellent customer support.
              </p>
              <p>
                We specialize in self-drive 4×4 cars, bikes and scooties perfect
                for mountain roads, off-road adventures, and travelers who love
                freedom and control over their journey. Whether you are planning
                a short trip or a long expedition, we ensure that every ride is
                safe, smooth, and memorable.
              </p>
              <p>
                Our dedicated and experienced team works tirelessly to provide a
                hassle-free rental experience — from quick booking to
                well-maintained vehicles and on-time support. Customer
                satisfaction is at the heart of everything we do.
              </p>
            </div>

            <div className="flex flex-col gap-4 text-sm leading-relaxed text-neutral-600 sm:text-base">
              <p>
                We currently offer our services across multiple locations
                including Manali and Bhuntar, helping travelers explore the
                beauty of the Himalayas with confidence and comfort.
              </p>
              <p>
                With years of experience and thousands of happy customers, we
                continue to expand our services while maintaining the trust and
                reliability that define our brand.
              </p>
              <p className="rounded-2xl bg-brand/5 px-5 py-4 text-base font-bold text-neutral-950 sm:text-lg">
                Drive with confidence. Travel with freedom. Adventure with us.
              </p>
            </div>
          </div>
        </section>

        {/* Why choose us */}
        <section aria-labelledby="why-heading">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
            <h2
              id="why-heading"
              className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl"
            >
              Why Choose <span className="text-brand">BRB Expeditions?</span>
            </h2>
            <p className="text-sm text-neutral-500 sm:text-base">
              At BRB Expeditions, riding is more than just transport — it&apos;s
              our passion. Our goal is to give you a seamless and memorable
              rental experience so you can explore Himachal Pradesh at your own
              pace.
            </p>
          </div>

          <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_CHOOSE_US.map((item, index) => {
              const Icon = WHY_ICONS[index] ?? ShieldCheck;
              return (
                <li
                  key={item.title}
                  className="flex flex-col gap-2.5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
                >
                  <span
                    className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand"
                    aria-hidden="true"
                  >
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <h3 className="text-base font-bold text-neutral-950">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    {item.description}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Team */}
        <section aria-labelledby="team-heading">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
              <Users className="size-3.5" aria-hidden="true" />
              The People
            </span>
            <h2
              id="team-heading"
              className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl"
            >
              Meet Our <span className="text-brand">Team</span>
            </h2>
            <p className="text-sm text-neutral-500 sm:text-base">
              The people who keep the fleet running and your trip on schedule.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-10">
            {TEAM.map((group) => (
              <div key={group.role}>
                <h3 className="flex items-center gap-3 text-xs font-bold tracking-wide text-neutral-500 uppercase">
                  {group.role}
                  <span
                    className="h-px flex-1 bg-neutral-200"
                    aria-hidden="true"
                  />
                </h3>

                <ul className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                  {group.members.map((member) => (
                    <li
                      key={member.name}
                      className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="relative aspect-square overflow-hidden bg-neutral-100">
                        <Image
                          src={member.image}
                          alt={`${member.name}, ${group.role} at BRB Expeditions`}
                          fill
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="flex flex-col gap-0.5 p-4">
                        <p className="text-sm font-bold text-neutral-950">
                          {member.name}
                        </p>
                        <p className="text-xs text-neutral-500">{group.role}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="flex flex-col items-center gap-4 rounded-2xl bg-header px-6 py-10 text-center sm:px-10">
          <h2 className="text-2xl font-extrabold tracking-tight text-white uppercase italic sm:text-3xl">
            Ready To <span className="text-brand">Ride?</span>
          </h2>
          <p className="max-w-lg text-sm text-neutral-300 sm:text-base">
            Browse the fleet, pick your dates and we&apos;ll have your vehicle
            ready.
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark"
            >
              Explore Vehicles
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href={SUPPORT_PHONE_HREF}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <Headset className="size-4 text-brand" aria-hidden="true" />
              {SUPPORT_PHONE}
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
