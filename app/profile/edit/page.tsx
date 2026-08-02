import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { ProfileForm } from "@/components/profile-form";
import { requireCompleteProfile } from "@/utils/supabase/require-user";

export const metadata: Metadata = {
  title: "Edit Profile | BRB Expeditions",
  robots: { index: false, follow: false },
};

export default async function EditProfilePage() {
  const { user, profile } = await requireCompleteProfile("/profile/edit");

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 transition-colors hover:text-neutral-950"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back to account
        </Link>

        <header className="mt-4 flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic">
            Edit <span className="text-brand">Profile</span>
          </h1>
          <p className="text-sm text-neutral-600">
            Keep your details current so bookings go through smoothly.
          </p>
        </header>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <ProfileForm
            userId={user.id}
            initialName={profile.name}
            initialMobile={profile.mobile ?? ""}
            email={profile.email ?? user.email ?? ""}
          />
        </div>
      </div>
    </main>
  );
}
