import "server-only";

import { createClient } from "@/utils/supabase/server";

export type Profile = {
  id: string;
  name: string;
  mobile: string;
  verified: boolean;
  total_bookings: number;
};

/**
 * Loads the signed-in user's profile row. RLS restricts this to their own
 * record, so no extra filtering is needed beyond the id.
 */
export async function getOwnProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, mobile, verified, total_bookings")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Failed to load profile:", error.message);
    return null;
  }

  return data as Profile | null;
}
