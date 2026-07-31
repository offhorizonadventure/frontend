/**
 * Shared cart values safe for the browser.
 *
 * Kept out of `lib/cart.ts`, which is `server-only` — client components need
 * the location list and the day-count helper, but must never pull in the
 * Supabase server client.
 */

/** Pickup regions, mirroring the check constraint on bookings.location. */
export const LOCATIONS = [
  "Local (Manali)",
  "Spiti Valley",
  "Ladakh",
  "Other",
] as const;

export type Location = (typeof LOCATIONS)[number];

const MS_PER_DAY = 86_400_000;

/** Whole days between two ISO dates, minimum 1 — a same-day return is a day. */
export function rentalDays(start: string, end: string): number {
  const from = Date.parse(`${start}T00:00:00Z`);
  const to = Date.parse(`${end}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return 1;
  return Math.max(1, Math.round((to - from) / MS_PER_DAY));
}
