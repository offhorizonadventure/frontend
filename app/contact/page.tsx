import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Navigation, Phone } from "lucide-react";

import {
  OFFICES,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_HREF,
} from "@/lib/locations";

export const metadata: Metadata = {
  title: "Contact Us | BRB Expeditions — Bike & Car Rentals in Manali",
  description:
    "Call, email or visit BRB Expeditions in Manali and Bhuntar. Self-drive bike and car rentals for Spiti, Ladakh and the Kullu valley.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact BRB Expeditions",
    description:
      "Call, email or visit our Manali and Bhuntar branches for self-drive bike and car rentals.",
    url: "/contact",
  },
};

export default function ContactPage() {
  // LocalBusiness markup helps the branches surface in local search results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": OFFICES.map((office) => ({
      "@type": "LocalBusiness",
      name: `BRB Expeditions — ${office.city} (${office.branch})`,
      description: office.description,
      telephone: SUPPORT_PHONE,
      email: SUPPORT_EMAIL,
      address: {
        "@type": "PostalAddress",
        streetAddress: office.address,
        addressLocality: office.city,
        addressRegion: "Himachal Pradesh",
        addressCountry: "IN",
      },
    })),
  };

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <header className="flex max-w-2xl flex-col gap-3">
          <span className="inline-flex w-fit items-center rounded-md bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
            Get In Touch
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl">
            Contact <span className="text-brand">Us</span>
          </h1>
          <p className="text-sm text-neutral-600 sm:text-base">
            Questions about a booking, documents or a route? Call us and we answer
            the phone ourselves.
          </p>
        </header>

        {/* Primary contact methods */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <a
            href={SUPPORT_PHONE_HREF}
            className="group flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-950"
          >
            <Phone className="size-5 text-brand" aria-hidden="true" />
            <span className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
              Call us
            </span>
            <span className="text-sm font-semibold text-neutral-950">
              {SUPPORT_PHONE}
            </span>
          </a>

          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="group flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-5 transition-colors hover:border-neutral-950"
          >
            <Mail className="size-5 text-brand" aria-hidden="true" />
            <span className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
              Email us
            </span>
            <span className="text-sm font-semibold break-all text-neutral-950">
              {SUPPORT_EMAIL}
            </span>
          </a>

          <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-5">
            <Clock className="size-5 text-brand" aria-hidden="true" />
            <span className="text-xs font-medium tracking-wide text-neutral-500 uppercase">
              Opening hours
            </span>
            <span className="text-sm font-semibold text-neutral-950">
              Open daily
            </span>
          </div>
        </div>

        {/* Branches */}
        <section aria-labelledby="branches-heading" className="mt-14">
          <h2
            id="branches-heading"
            className="text-xl font-bold text-neutral-950"
          >
            Our Branches
          </h2>

          <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {OFFICES.map((office) => (
              <li
                key={`${office.city}-${office.branch}`}
                className="flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-5"
              >
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-base font-bold text-neutral-950">
                    {office.city}
                  </h3>
                  <p className="text-xs font-semibold tracking-wide text-brand uppercase">
                    {office.branch}
                  </p>
                </div>

                <address className="flex items-start gap-2 text-sm not-italic text-neutral-600">
                  <MapPin
                    className="mt-0.5 size-4 shrink-0 text-neutral-400"
                    aria-hidden="true"
                  />
                  {office.address}
                </address>

                <a
                  href={office.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto inline-flex w-fit items-center gap-1.5 pt-1 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
                >
                  <Navigation className="size-3.5" aria-hidden="true" />
                  Get directions
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* Closing CTA */}
        <section className="mt-14 flex flex-col items-start gap-4 rounded-2xl bg-neutral-950 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-bold text-white sm:text-2xl">
              Ready to ride?
            </h2>
            <p className="max-w-md text-sm text-neutral-400">
              Reserve your bike or car in a couple of minutes and pay when you
              collect it.
            </p>
          </div>
          <Link
            href="/vehicles"
            className="inline-flex shrink-0 items-center rounded-md bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Book Your Ride
          </Link>
        </section>
      </div>
    </main>
  );
}
