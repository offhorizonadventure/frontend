import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client that bypasses Row Level Security.
 *
 * This exists for exactly one job: confirming a payment. Marking an order paid
 * and a booking confirmed must not be something a rider's own session can do,
 * or anyone could confirm a booking they never paid for — so those columns
 * have no customer UPDATE policy and are written here instead, only after a
 * Razorpay signature has been verified.
 *
 * Rules for using this:
 *   - `server-only` above means importing it from a client component fails the
 *     build. Never remove it.
 *   - The key must be SUPABASE_SERVICE_ROLE_KEY, never NEXT_PUBLIC_ anything.
 *     A NEXT_PUBLIC_ prefix would inline it into the browser bundle and hand
 *     every visitor full read/write access to the database.
 *   - Every read through this client must filter by the id you already
 *     verified. RLS is not there to catch your mistakes any more.
 *
 * Everything else — pages, listings, the cart — uses utils/supabase/server.ts,
 * which runs as the signed-in user with RLS enforced.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      // No cookies, no refresh: this client is never tied to a user session.
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
