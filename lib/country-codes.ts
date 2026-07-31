export type CountryCode = {
  /** ISO 3166-1 alpha-2, used as a stable key. */
  iso: string;
  name: string;
  dial: string;
};

/** Common origin countries for riders in the Kullu–Manali valley. */
export const COUNTRY_CODES: CountryCode[] = [
  { iso: "IN", name: "India", dial: "+91" },
  { iso: "GB", name: "United Kingdom", dial: "+44" },
  { iso: "US", name: "United States", dial: "+1" },
  { iso: "AU", name: "Australia", dial: "+61" },
  { iso: "DE", name: "Germany", dial: "+49" },
  { iso: "FR", name: "France", dial: "+33" },
  { iso: "ES", name: "Spain", dial: "+34" },
  { iso: "IT", name: "Italy", dial: "+39" },
  { iso: "NL", name: "Netherlands", dial: "+31" },
  { iso: "IL", name: "Israel", dial: "+972" },
  { iso: "RU", name: "Russia", dial: "+7" },
  { iso: "SG", name: "Singapore", dial: "+65" },
  { iso: "AE", name: "United Arab Emirates", dial: "+971" },
  { iso: "NP", name: "Nepal", dial: "+977" },
];

export const DEFAULT_COUNTRY = COUNTRY_CODES[0];

/** Strips everything except digits from a user-typed local number. */
export function normaliseLocalNumber(input: string) {
  return input.replace(/\D/g, "");
}

/**
 * Builds the E.164 number Supabase expects, e.g. "+919623300012".
 *
 * Must match the admin dashboard's `toE164()` exactly — both write to
 * `profiles.mobile`, which is unique. Note Supabase strips the leading "+"
 * when storing `auth.users.phone`, so the trigger re-adds it; never persist
 * the bare `auth.users.phone` value as a mobile number.
 */
export function toE164(dial: string, localNumber: string) {
  const digits = normaliseLocalNumber(localNumber);
  const prefix = dial.startsWith("+") ? dial : `+${dial}`;
  return `${prefix}${digits}`;
}
