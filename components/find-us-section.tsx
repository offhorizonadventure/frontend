import Link from "next/link";
import { MapPin } from "lucide-react";

import { LocationSlideshow } from "@/components/location-slideshow";
import { OFFICES } from "@/lib/locations";

export function FindUsSection() {
  return (
    <section
      id="find-us"
      className="mx-auto max-w-7xl scroll-mt-28 px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      aria-labelledby="find-us-heading"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
          <MapPin className="size-3.5" aria-hidden="true" />
          {OFFICES.length} Pickup Points
        </span>
        <h2
          id="find-us-heading"
          className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl"
        >
          Find Us In The <span className="text-brand">Valley</span>
        </h2>
        <p className="text-sm text-neutral-500 sm:text-base">
          Drive and ride at your own pace. No drivers. No restrictions. Just the
          open Himalayas.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {OFFICES.map((office) => (
          <Link
            key={`${office.city}-${office.branch}`}
            href={office.cityHref}
            className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-shadow hover:shadow-lg"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
              <LocationSlideshow slides={office.slides} />
              <div
                className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                aria-hidden="true"
              />
              <div className="absolute bottom-4 left-5 z-10">
                <h3 className="text-2xl font-bold text-white drop-shadow">
                  {office.city}
                </h3>
                <p className="text-xs font-medium text-white/85">
                  {office.branch}
                </p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 p-5">
              <p className="text-xs font-semibold tracking-wide text-brand uppercase">
                {office.tagline}
              </p>
              <p className="text-sm leading-relaxed text-neutral-600">
                {office.description}
              </p>

              <address className="mt-auto flex items-start gap-2 pt-1 text-sm not-italic text-neutral-500">
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-neutral-400"
                  aria-hidden="true"
                />
                {office.address}
              </address>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
