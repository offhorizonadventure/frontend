"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";

import type { FilterOption } from "@/lib/vehicles";

/**
 * Filters live in the URL rather than component state: results stay
 * shareable/bookmarkable, the page is server-rendered for crawlers, and the
 * back button behaves as people expect.
 */
export function VehicleFilters({
  categories,
  subcategories,
  priceRange,
}: {
  categories: FilterOption[];
  subcategories: FilterOption[];
  priceRange: { min: number; max: number };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const selectedCategories = (searchParams.get("category") ?? "")
    .split(",")
    .filter(Boolean);
  const selectedSubcategories = (searchParams.get("subcategory") ?? "")
    .split(",")
    .filter(Boolean);

  const [search, setSearch] = React.useState(searchParams.get("q") ?? "");

  function apply(next: URLSearchParams) {
    // Any filter change invalidates the current page number.
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function toggleValue(key: "category" | "subcategory", id: string) {
    const next = new URLSearchParams(searchParams.toString());
    const current = (next.get(key) ?? "").split(",").filter(Boolean);
    const updated = current.includes(id)
      ? current.filter((value) => value !== id)
      : [...current, id];

    if (updated.length > 0) next.set(key, updated.join(","));
    else next.delete(key);
    apply(next);
  }

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    apply(next);
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setParam("q", search.trim());
  }

  function reset() {
    setSearch("");
    router.push(pathname, { scroll: false });
  }

  const hasFilters = Array.from(searchParams.keys()).some(
    (key) => !["sort", "view", "page"].includes(key)
  );

  // Subcategories narrow to the chosen categories, so the list stays relevant.
  const visibleSubcategories =
    selectedCategories.length > 0
      ? subcategories.filter(
          (sub) => sub.categoryId && selectedCategories.includes(sub.categoryId)
        )
      : subcategories;

  const panel = (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wide text-neutral-950 uppercase">
          Filters
        </h2>
        {hasFilters && (
          <button
            type="button"
            onClick={reset}
            className="text-xs font-semibold text-brand transition-colors hover:text-brand-dark"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search */}
      <form onSubmit={submitSearch} className="flex flex-col gap-2">
        <label
          htmlFor="vehicle-search"
          className="text-sm font-semibold text-neutral-950"
        >
          Search
        </label>
        <div className="relative">
          <input
            id="vehicle-search"
            type="search"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-md border border-neutral-300 py-2.5 pr-9 pl-3 text-sm focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
          />
          <button
            type="submit"
            aria-label="Search vehicles"
            className="absolute top-1/2 right-2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-950"
          >
            <Search className="size-4" aria-hidden="true" />
          </button>
        </div>
      </form>

      {/* Categories */}
      {categories.length > 0 && (
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-1 text-sm font-semibold text-neutral-950">
            Categories
          </legend>
          {categories.map((category) => (
            <label
              key={category.id}
              // Categories with nothing listed today still show, just muted.
              className={`flex cursor-pointer items-center gap-2.5 text-sm ${
                category.count === 0 ? "text-neutral-400" : "text-neutral-700"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.id)}
                onChange={() => toggleValue("category", category.id)}
                className="size-4 rounded border-neutral-300 text-brand accent-brand focus:ring-brand"
              />
              <span className="flex-1">{category.name}</span>
              <span className="text-xs text-neutral-400">{category.count}</span>
            </label>
          ))}
        </fieldset>
      )}

      {/* Subcategories */}
      {visibleSubcategories.length > 0 && (
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-1 text-sm font-semibold text-neutral-950">
            Models
          </legend>
          {visibleSubcategories.map((sub) => (
            <label
              key={sub.id}
              className={`flex cursor-pointer items-center gap-2.5 text-sm ${
                sub.count === 0 ? "text-neutral-400" : "text-neutral-700"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSubcategories.includes(sub.id)}
                onChange={() => toggleValue("subcategory", sub.id)}
                className="size-4 rounded border-neutral-300 accent-brand focus:ring-brand"
              />
              <span className="flex-1">{sub.name}</span>
              <span className="text-xs text-neutral-400">{sub.count}</span>
            </label>
          ))}
        </fieldset>
      )}

      {/* Price */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-neutral-950">
          Price Range (per day)
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={priceRange.min}
            max={priceRange.max}
            placeholder={`₹${priceRange.min}`}
            defaultValue={searchParams.get("min") ?? ""}
            onBlur={(e) => setParam("min", e.target.value)}
            aria-label="Minimum price per day"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
          />
          <span className="text-neutral-400">–</span>
          <input
            type="number"
            inputMode="numeric"
            min={priceRange.min}
            max={priceRange.max}
            placeholder={`₹${priceRange.max}`}
            defaultValue={searchParams.get("max") ?? ""}
            onBlur={(e) => setParam("max", e.target.value)}
            aria-label="Maximum price per day"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-neutral-950">Availability</h3>
        <p className="-mt-1 text-xs text-neutral-500">
          Pick your dates to see only vehicles that are free.
        </p>
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            From
            <input
              type="date"
              value={searchParams.get("from") ?? ""}
              onChange={(e) => setParam("from", e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-600">
            To
            <input
              type="date"
              min={searchParams.get("from") ?? undefined}
              value={searchParams.get("to") ?? ""}
              onChange={(e) => setParam("to", e.target.value)}
              className="rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-brand focus:ring-1 focus:ring-brand focus:outline-none"
            />
          </label>
        </div>
      </div>

      <button
        type="button"
        onClick={reset}
        className="rounded-md border border-brand px-4 py-2.5 text-sm font-semibold text-brand transition-colors hover:bg-brand hover:text-white"
      >
        Reset Filters
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-950 lg:hidden"
      >
        <SlidersHorizontal className="size-4" aria-hidden="true" />
        Filters
        {hasFilters && (
          <span className="size-1.5 rounded-full bg-brand" aria-hidden="true" />
        )}
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 rounded-2xl border border-neutral-200 bg-white p-5 lg:block">
        {panel}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col overflow-y-auto bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-neutral-950 uppercase">
                Filters
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="text-neutral-500 hover:text-neutral-950"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            {panel}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 rounded-md bg-brand px-4 py-3 text-sm font-semibold text-white"
            >
              Show Results
            </button>
          </div>
        </div>
      )}
    </>
  );
}
