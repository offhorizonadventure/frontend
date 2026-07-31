import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { createClient } from "@/utils/supabase/server";
import { getOwnProfile, type Profile } from "@/lib/profile";

/**
 * Server-side auth gate.
 *
 * Middleware alone is not enough: it can be bypassed if it fails to load, and
 * it never runs for direct RSC payload or Route Handler requests. Every page
 * that shows user data must verify on the server too.
 *
 * Uses getUser() (which revalidates the JWT with Supabase) rather than
 * getSession(), whose cookie contents are not verified.
 */
export async function requireUser(returnTo: string): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }

  return user;
}

/**
 * Auth gate that additionally requires a persisted profile row with a name.
 *
 * Account pages read from `profiles`; if that row is missing or incomplete
 * there is nothing real to show, so send the rider to finish signing up rather
 * than rendering placeholders that look like saved data.
 */
export async function requireCompleteProfile(
  returnTo: string
): Promise<{ user: User; profile: Profile }> {
  const user = await requireUser(returnTo);
  const profile = await getOwnProfile(user.id);

  if (!profile || !profile.name.trim()) {
    redirect(`/complete-profile?next=${encodeURIComponent(returnTo)}`);
  }

  return { user, profile };
}
