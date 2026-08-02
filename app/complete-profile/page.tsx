import type { Metadata } from "next";
import { UserRound } from "lucide-react";

import { ProfileForm } from "@/components/profile-form";
import { SignOutButton } from "@/components/sign-out-button";
import { getOwnProfile } from "@/lib/profile";
import { requireUser } from "@/utils/supabase/require-user";

export const metadata: Metadata = {
  title: "Complete Your Profile | BRB Expeditions",
  robots: { index: false, follow: false },
};

/**
 * Shown when a signed-in rider has no saved profile row (or no name yet).
 * Requires a session but deliberately not a complete profile — otherwise the
 * redirect from requireCompleteProfile would loop back into itself.
 */
export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await requireUser("/complete-profile");
  const profile = await getOwnProfile(user.id);
  const { next } = await searchParams;

  // Only allow same-site redirect targets.
  const redirectTo = next?.startsWith("/") ? next : "/profile";

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:py-20">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-brand/10 text-brand">
              <UserRound className="size-5" aria-hidden="true" />
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-950 uppercase italic">
              Almost <span className="text-brand">There</span>
            </h1>
            <p className="text-sm text-neutral-500">
              Add your name to finish setting up your account.
            </p>
          </div>

          <div className="mt-6">
            <ProfileForm
              userId={user.id}
              initialName={profile?.name ?? ""}
              initialMobile={profile?.mobile ?? ""}
              email={profile?.email ?? user.email ?? ""}
              redirectTo={redirectTo}
              submitLabel="Finish"
              onCancel={false}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-center">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
