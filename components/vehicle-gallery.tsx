"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

export type GalleryImage = { url: string; caption: string };

/**
 * Main image with thumbnail strip.
 *
 * `object-contain` throughout: product shots are framed with the whole vehicle
 * in view, so cropping to fill lops off wheels and handlebars.
 */
export function VehicleGallery({
  images,
  vehicleName,
  available,
}: {
  images: GalleryImage[];
  vehicleName: string;
  /** Null when no dates are selected — the badge is only shown for a real check. */
  available: boolean | null;
}) {
  const [index, setIndex] = React.useState(0);
  const current = images[index];

  const go = React.useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + images.length) % images.length);
    },
    [images.length]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 sm:aspect-[16/10]">
        {current ? (
          <Image
            key={current.url}
            src={current.url}
            alt={`${vehicleName} — ${current.caption}`}
            fill
            priority
            sizes="(min-width: 1024px) 60vw, 100vw"
            // Straight from Supabase's CDN — Next's optimizer times out on
            // full-size uploads.
            unoptimized
            className="object-contain p-4"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
            <ImageIcon className="size-10" aria-hidden="true" />
          </div>
        )}

        {available !== null && (
          <span
            className={`absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              available
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                available ? "bg-emerald-500" : "bg-red-500"
              }`}
              aria-hidden="true"
            />
            {available ? "Available Now" : "Booked For These Dates"}
          </span>
        )}

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-700 shadow-sm transition-colors hover:text-neutral-950"
            >
              <ChevronLeft className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-700 shadow-sm transition-colors hover:text-neutral-950"
            >
              <ChevronRight className="size-4" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <ul className="flex gap-3 overflow-x-auto pb-1">
          {images.map((image, i) => (
            <li key={image.url} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show ${image.caption}`}
                aria-current={i === index}
                className={`relative block size-20 overflow-hidden rounded-xl border-2 bg-neutral-50 transition-colors sm:size-24 ${
                  i === index
                    ? "border-brand"
                    : "border-neutral-200 hover:border-neutral-300"
                }`}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="96px"
                  unoptimized
                  className="object-contain p-1.5"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
