import Image from "next/image";
import Link from "next/link";
import { ImageIcon } from "lucide-react";

import type { VehicleListItem } from "@/lib/vehicles";

function formatMoney(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function Tags({ vehicle }: { vehicle: VehicleListItem }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {vehicle.categoryName && (
        <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
          {vehicle.categoryName}
        </span>
      )}
      {vehicle.subcategoryName && (
        <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
          {vehicle.subcategoryName}
        </span>
      )}
      <span className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-600">
        Fuel {vehicle.fuelLevel}
      </span>
    </div>
  );
}

function VehicleImage({ vehicle }: { vehicle: VehicleListItem }) {
  if (!vehicle.imageUrl) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-neutral-300">
        <ImageIcon className="size-7" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={vehicle.imageUrl}
      alt={`${vehicle.name} available to rent at BRB Expeditions`}
      fill
      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      // Served straight from Supabase's CDN — routing full-size uploads through
      // Next's optimizer trips its 7s fetch timeout.
      unoptimized
      className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
    />
  );
}

export function VehicleCard({
  vehicle,
  /** Only shown when the visitor has filtered by a date range. */
  showAvailable = false,
  view = "grid",
}: {
  vehicle: VehicleListItem;
  showAvailable?: boolean;
  view?: "grid" | "list";
}) {
  const href = `/vehicles/${vehicle.slug}`;

  if (view === "list") {
    return (
      <article className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:border-neutral-300 hover:shadow-md sm:flex-row">
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-white sm:aspect-square sm:w-48">
          <VehicleImage vehicle={vehicle} />
          {showAvailable && (
            <span className="absolute top-3 left-3 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              Available
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <h3 className="text-base font-semibold text-neutral-950">
            {vehicle.name}
          </h3>
          <Tags vehicle={vehicle} />
          <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-neutral-950">
                {formatMoney(vehicle.pricePerDay)}
              </span>
              <span className="text-xs text-neutral-500">/day</span>
            </p>
            <Link
              href={href}
              className="inline-flex items-center justify-center rounded-md bg-brand px-5 py-2 text-xs font-semibold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark"
            >
              View Details
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">
      <div className="relative aspect-[4/3] overflow-hidden bg-white">
        <VehicleImage vehicle={vehicle} />
        {showAvailable && (
          <span className="absolute top-3 left-3 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            Available
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="truncate text-sm font-semibold text-neutral-950">
          {vehicle.name}
        </h3>
        <Tags vehicle={vehicle} />
        <p className="flex items-baseline gap-1">
          <span className="text-base font-bold text-neutral-950">
            {formatMoney(vehicle.pricePerDay)}
          </span>
          <span className="text-xs text-neutral-500">/day</span>
        </p>
        <Link
          href={href}
          className="mt-auto inline-flex items-center justify-center rounded-md bg-brand px-3 py-2 text-xs font-semibold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
