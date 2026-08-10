import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Bike, Headset, Home, Newspaper } from "lucide-react";

import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/locations";

export const metadata: Metadata = {
  title: "Page Not Found | BRB Expeditions",
  description:
    "That page doesn't exist. Browse our self-drive bikes, cars and scooters in Manali and Bhuntar instead.",
  // A 404 should never be indexed, but it must stay crawlable so search
  // engines can see the status and drop the old URL.
  robots: { index: false, follow: true },
};

const LINKS = [
  {
    href: "/vehicles",
    icon: Bike,
    title: "Browse the fleet",
    description: "Bikes, cars and scooters ready to book",
  },
  {
    href: "/manali",
    icon: Home,
    title: "Rentals in Manali",
    description: "Pickup near Mall Road and Bajhogi Road",
  },
  {
    href: "/bhuntar",
    icon: Home,
    title: "Rentals in Bhuntar",
    description: "Minutes from Kullu–Manali Airport",
  },
  {
    href: "/blog",
    icon: Newspaper,
    title: "Travel guides",
    description: "Routes, tips and advice for the Himalayas",
  },
] as const;

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:py-24">
      <div className="w-full max-w-2xl text-center">
        <p className="text-6xl font-extrabold tracking-tight text-brand italic sm:text-7xl">
          404
        </p>

        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-3xl">
          Page <span className="text-brand">Not Found</span>
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm text-neutral-600 sm:text-base">
          The page you were after has moved or never existed. Here&apos;s where
          most people are heading.
        </p>

        <ul className="mt-8 grid grid-cols-1 gap-3 text-left sm:grid-cols-2">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex h-full items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
              >
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white"
                  aria-hidden="true"
                >
                  <link.icon className="size-5" strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-neutral-950">
                    {link.title}
                  </span>
                  <span className="block text-xs text-neutral-600">
                    {link.description}
                  </span>
                </span>
                <ArrowRight
                  className="ml-auto size-4 shrink-0 text-brand transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark"
          >
            Back Home
          </Link>
          <a
            href={SUPPORT_PHONE_HREF}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-950 transition-colors hover:border-neutral-950"
          >
            <Headset className="size-4 text-brand" aria-hidden="true" />
            {SUPPORT_PHONE}
          </a>
        </div>
      </div>
    </main>
  );
}
