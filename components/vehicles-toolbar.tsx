"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";

const SORT_OPTIONS = [
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A to Z" },
] as const;

export function VehiclesToolbar({ view }: { view: "grid" | "list" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "view") next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="flex items-center gap-2">
      <label className="sr-only" htmlFor="sort">
        Sort by
      </label>
      <select
        id="sort"
        value={searchParams.get("sort") ?? "price_asc"}
        onChange={(e) => setParam("sort", e.target.value)}
        className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            Sort by: {option.label}
          </option>
        ))}
      </select>

      <div
        className="hidden overflow-hidden rounded-md border border-neutral-300 sm:flex"
        role="group"
        aria-label="Layout"
      >
        <button
          type="button"
          onClick={() => setParam("view", "grid")}
          aria-label="Grid view"
          aria-pressed={view === "grid"}
          className={`flex size-9 items-center justify-center transition-colors ${
            view === "grid"
              ? "bg-brand text-white"
              : "bg-white text-neutral-500 hover:text-neutral-950"
          }`}
        >
          <LayoutGrid className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setParam("view", "list")}
          aria-label="List view"
          aria-pressed={view === "list"}
          className={`flex size-9 items-center justify-center border-l border-neutral-300 transition-colors ${
            view === "list"
              ? "bg-brand text-white"
              : "bg-white text-neutral-500 hover:text-neutral-950"
          }`}
        >
          <List className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
