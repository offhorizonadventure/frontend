import "server-only";

import { createClient } from "@/utils/supabase/server";

export const PAGE_SIZE = 12;

export type SortKey = "price_asc" | "price_desc" | "name_asc";

export type VehicleListItem = {
  id: string;
  name: string;
  slug: string;
  pricePerDay: number;
  imageUrl: string | null;
  fuelLevel: string;
  subcategoryId: string | null;
  subcategoryName: string | null;
  categoryId: string | null;
  categoryName: string | null;
};

export type FilterOption = {
  id: string;
  name: string;
  categoryId?: string | null;
  count: number;
};

export type VehicleQuery = {
  q?: string;
  categoryIds: string[];
  subcategoryIds: string[];
  minPrice?: number;
  maxPrice?: number;
  from?: string;
  to?: string;
  sort: SortKey;
  page: number;
};

type VehicleRow = {
  id: string;
  name: string;
  slug: string;
  price_per_day: number;
  bike_photo_url: string | null;
  fuel_level: string;
  subcategory_id: string | null;
  vehicle_subcategories: {
    id: string;
    name: string;
    vehicle_categories: { id: string; name: string } | null;
  } | null;
};

const VEHICLE_SELECT = `
  id, name, slug, price_per_day, bike_photo_url, fuel_level, subcategory_id,
  vehicle_subcategories!inner(id, name, vehicle_categories(id, name))
`;

function toListItem(row: VehicleRow): VehicleListItem {
  const category = row.vehicle_subcategories?.vehicle_categories ?? null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    pricePerDay: row.price_per_day,
    imageUrl: row.bike_photo_url,
    fuelLevel: row.fuel_level,
    subcategoryId: row.subcategory_id,
    subcategoryName: row.vehicle_subcategories?.name ?? null,
    categoryId: category?.id ?? null,
    categoryName: category?.name ?? null,
  };
}

/**
 * Ids of vehicles with no clashing booking in the given range.
 *
 * Relies on the `available_vehicles` SQL function being SECURITY DEFINER —
 * bookings are hidden from anonymous visitors by RLS, so without that the
 * clash check silently passes for everyone and every vehicle looks free.
 */
async function getAvailableIds(
  from: string,
  to: string
): Promise<string[] | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("available_vehicles", {
    p_start: from,
    p_end: to,
  });

  if (error) {
    console.error("Availability lookup failed:", error.message);
    return null;
  }

  return (data as { id: string }[] | null)?.map((v) => v.id) ?? [];
}

export async function getVehicles(query: VehicleQuery): Promise<{
  vehicles: VehicleListItem[];
  total: number;
}> {
  const supabase = await createClient();

  let request = supabase
    .from("vehicles")
    .select(VEHICLE_SELECT, { count: "exact" });

  if (query.q) {
    request = request.ilike("name", `%${query.q}%`);
  }
  if (query.subcategoryIds.length > 0) {
    request = request.in("subcategory_id", query.subcategoryIds);
  }
  if (query.categoryIds.length > 0) {
    request = request.in(
      "vehicle_subcategories.category_id",
      query.categoryIds
    );
  }
  if (typeof query.minPrice === "number") {
    request = request.gte("price_per_day", query.minPrice);
  }
  if (typeof query.maxPrice === "number") {
    request = request.lte("price_per_day", query.maxPrice);
  }

  if (query.from && query.to) {
    const availableIds = await getAvailableIds(query.from, query.to);
    if (availableIds !== null) {
      if (availableIds.length === 0) {
        return { vehicles: [], total: 0 };
      }
      request = request.in("id", availableIds);
    }
  }

  if (query.sort === "price_desc") {
    request = request.order("price_per_day", { ascending: false });
  } else if (query.sort === "name_asc") {
    request = request.order("name", { ascending: true });
  } else {
    request = request.order("price_per_day", { ascending: true });
  }

  const start = (query.page - 1) * PAGE_SIZE;
  request = request.range(start, start + PAGE_SIZE - 1);

  const { data, error, count } = await request;

  if (error) {
    console.error("Failed to load vehicles:", error.message);
    return { vehicles: [], total: 0 };
  }

  return {
    vehicles: ((data ?? []) as unknown as VehicleRow[]).map(toListItem),
    total: count ?? 0,
  };
}

/**
 * Filter options for the sidebar.
 *
 * The category and model lists come from their own tables, not from the
 * vehicles currently in stock — otherwise a category with nothing listed today
 * (say Car or Scooter) vanishes from the filter entirely and visitors have no
 * way to tell we rent them at all. Counts are folded in from the fleet so an
 * empty option can still be shown as "0".
 */
export async function getFilterOptions(): Promise<{
  categories: FilterOption[];
  subcategories: FilterOption[];
  priceRange: { min: number; max: number };
}> {
  const supabase = await createClient();

  const [
    { data: categoryRows },
    { data: subcategoryRows },
    { data: countRows },
    { data: priceRows },
  ] = await Promise.all([
    supabase.from("vehicle_categories").select("id, name"),
    supabase.from("vehicle_subcategories").select("id, name, category_id"),
    supabase
      .from("vehicles")
      .select(
        "id, vehicle_subcategories!inner(id, name, vehicle_categories(id, name))"
      ),
    supabase.from("vehicles").select("price_per_day"),
  ]);

  // Tally the fleet once, then read the totals off when building each list.
  const categoryCounts = new Map<string, number>();
  const subcategoryCounts = new Map<string, number>();

  for (const row of (countRows ?? []) as unknown as VehicleRow[]) {
    const sub = row.vehicle_subcategories;
    if (!sub) continue;

    subcategoryCounts.set(sub.id, (subcategoryCounts.get(sub.id) ?? 0) + 1);

    const categoryId = sub.vehicle_categories?.id;
    if (categoryId) {
      categoryCounts.set(categoryId, (categoryCounts.get(categoryId) ?? 0) + 1);
    }
  }

  const prices = (priceRows ?? []).map(
    (row) => (row as { price_per_day: number }).price_per_day
  );

  const byName = (a: FilterOption, b: FilterOption) =>
    a.name.localeCompare(b.name);

  const categories = (
    (categoryRows ?? []) as { id: string; name: string }[]
  ).map<FilterOption>((row) => ({
    id: row.id,
    name: row.name,
    count: categoryCounts.get(row.id) ?? 0,
  }));

  const subcategories = (
    (subcategoryRows ?? []) as {
      id: string;
      name: string;
      category_id: string | null;
    }[]
  ).map<FilterOption>((row) => ({
    id: row.id,
    name: row.name,
    categoryId: row.category_id,
    count: subcategoryCounts.get(row.id) ?? 0,
  }));

  return {
    categories: categories.sort(byName),
    subcategories: subcategories.sort(byName),
    priceRange: {
      min: prices.length ? Math.floor(Math.min(...prices)) : 0,
      max: prices.length ? Math.ceil(Math.max(...prices)) : 0,
    },
  };
}

export type VehicleDetail = VehicleListItem & {
  conditionPhotoUrl: string | null;
  note: string | null;
  /**
   * Papers are shown as a valid/expiring badge rather than raw dates — the
   * registration number and document numbers stay off the public page.
   */
  papersValid: boolean;
};

type VehicleDetailRow = VehicleRow & {
  condition_photo_url: string | null;
  note: string | null;
  insurance_end: string;
  fitness_end: string;
  permit_end: string;
  road_tax_end: string;
};

/** A single vehicle by its public slug, or null when the slug is unknown. */
export async function getVehicleBySlug(
  slug: string
): Promise<VehicleDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select(
      `${VEHICLE_SELECT}, condition_photo_url, note,
       insurance_end, fitness_end, permit_end, road_tax_end`
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Failed to load vehicle:", error.message);
    return null;
  }
  if (!data) return null;

  const row = data as unknown as VehicleDetailRow;
  const today = new Date().toISOString().slice(0, 10);

  return {
    ...toListItem(row),
    conditionPhotoUrl: row.condition_photo_url,
    note: row.note,
    papersValid: [
      row.insurance_end,
      row.fitness_end,
      row.permit_end,
      row.road_tax_end,
    ].every((date) => Boolean(date) && date >= today),
  };
}

/** Other vehicles in the same model line, for the "you may also like" row. */
export async function getRelatedVehicles(
  vehicle: VehicleDetail,
  limit = 8
): Promise<VehicleListItem[]> {
  const supabase = await createClient();

  let request = supabase
    .from("vehicles")
    .select(VEHICLE_SELECT)
    .neq("id", vehicle.id)
    .order("price_per_day", { ascending: true })
    .limit(limit);

  // Prefer the same model; fall back to anything once that runs dry.
  if (vehicle.subcategoryId) {
    request = request.eq("subcategory_id", vehicle.subcategoryId);
  }

  const { data } = await request;
  const related = ((data ?? []) as unknown as VehicleRow[]).map(toListItem);

  if (related.length >= 4 || !vehicle.subcategoryId) return related;

  const { data: fallback } = await supabase
    .from("vehicles")
    .select(VEHICLE_SELECT)
    .neq("id", vehicle.id)
    .order("price_per_day", { ascending: true })
    .limit(limit);

  const seen = new Set(related.map((item) => item.id));
  for (const item of ((fallback ?? []) as unknown as VehicleRow[]).map(
    toListItem
  )) {
    if (!seen.has(item.id) && related.length < limit) related.push(item);
  }

  return related;
}

/**
 * A handful of vehicles from one top-level category, cheapest first.
 *
 * Used by the city landing pages, which show a short bike / car / scooter
 * strip rather than the full listing. Matching on the category name keeps the
 * page content stable even if the row is re-created with a new id.
 */
export async function getVehiclesByCategoryName(
  categoryName: string,
  limit = 4
): Promise<VehicleListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("vehicles")
    .select(VEHICLE_SELECT)
    .ilike("vehicle_subcategories.vehicle_categories.name", categoryName)
    .order("price_per_day", { ascending: true })
    .limit(limit);

  if (error) {
    console.error(`Failed to load ${categoryName} vehicles:`, error.message);
    return [];
  }

  // The nested filter above narrows the join, not the outer rows, so vehicles
  // in other categories come back with a null category — drop those here.
  return ((data ?? []) as unknown as VehicleRow[])
    .filter(
      (row) =>
        row.vehicle_subcategories?.vehicle_categories?.name?.toLowerCase() ===
        categoryName.toLowerCase()
    )
    .map(toListItem);
}

/**
 * Whether a vehicle is free for a range. Server-side only — never trust an
 * availability answer computed in the browser.
 */
export async function isVehicleAvailable(
  vehicleId: string,
  from: string,
  to: string
): Promise<boolean> {
  const ids = await getAvailableIds(from, to);
  // A failed lookup returns null; treat that as "unknown", not "free".
  if (ids === null) return false;
  return ids.includes(vehicleId);
}

/** Headline counts for the stats bar. */
export async function getFleetStats() {
  const supabase = await createClient();

  const [{ count: vehicleCount }, { count: categoryCount }] = await Promise.all([
    supabase.from("vehicles").select("id", { count: "exact", head: true }),
    supabase
      .from("vehicle_categories")
      .select("id", { count: "exact", head: true }),
  ]);

  return {
    vehicles: vehicleCount ?? 0,
    categories: categoryCount ?? 0,
  };
}
