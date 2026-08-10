import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { PasswordForm } from "@/components/password-form";
import { requireCompleteProfile } from "@/utils/supabase/require-user";

export const metadata: Metadata = {
  title: "Change Password | BRB Expeditions",
  robots: { index: false, follow: false },
};

export default async function ChangePasswordPage() {
  await requireCompleteProfile("/profile/password");

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm font-medium text-neutral-500 transition-colors hover:text-brand"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Back to account
        </Link>

        <header className="mt-4 flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic">
            Change <span className="text-brand">Password</span>
          </h1>
          <p className="text-sm text-neutral-600">
            You&apos;ll stay signed in on this device.
          </p>
        </header>

        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <PasswordForm redirectTo="/profile" />
        </div>
      </div>
    </main>
  );
}
