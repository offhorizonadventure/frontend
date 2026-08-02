import type { Metadata } from "next";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarCheck,
  Clock,
  Mail,
  Pencil,
  Phone,
  UserRound,
} from "lucide-react";

import { AccountNav } from "@/components/account-nav";
import { SignOutButton } from "@/components/sign-out-button";
import { requireCompleteProfile } from "@/utils/supabase/require-user";

export const metadata: Metadata = {
  title: "My Details | BRB Expeditions",
  robots: { index: false, follow: false },
};

export default async function ProfilePage() {
  // Guarantees a persisted profile row — everything below is real saved data,
  // never a fallback from the auth session.
  const { user, profile } = await requireCompleteProfile("/profile");

  const emailVerified = Boolean(user.email_confirmed_at);
  const displayEmail = profile.email ?? user.email ?? "—";
  const displayPhone = profile.mobile || "Not added";

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl">
            My <span className="text-brand">Account</span>
          </h1>
          <p className="text-sm text-neutral-600">
            Manage your details and keep your contact information up to date.
          </p>
        </header>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <AccountNav />
          <SignOutButton />
        </div>

        <section
          aria-labelledby="details-heading"
          className="mt-8 rounded-2xl border border-neutral-200 bg-white"
        >
          <div className="flex items-center justify-between gap-4 border-b border-neutral-100 p-6">
            <div className="flex items-center gap-4">
              <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                <UserRound className="size-7" aria-hidden="true" />
              </span>
              <div className="flex flex-col gap-1">
                <h2
                  id="details-heading"
                  className="text-lg font-bold text-neutral-950"
                >
                  {profile.name}
                </h2>
                <p className="text-sm text-neutral-500">
                  Used on your rental agreement and booking confirmations.
                </p>
              </div>
            </div>

            <Link
              href="/profile/edit"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-300 px-4 py-2 text-xs font-semibold text-neutral-950 transition-colors hover:border-neutral-950"
            >
              <Pencil className="size-3.5" aria-hidden="true" />
              Edit
            </Link>
          </div>

          <dl className="divide-y divide-neutral-100">
            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <dt className="flex items-center gap-2.5 text-sm text-neutral-600">
                <UserRound
                  className="size-4 shrink-0 text-neutral-400"
                  aria-hidden="true"
                />
                Full name
              </dt>
              <dd className="text-sm font-medium text-neutral-950">
                {profile.name}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <dt className="flex items-center gap-2.5 text-sm text-neutral-600">
                <Mail
                  className="size-4 shrink-0 text-neutral-400"
                  aria-hidden="true"
                />
                Email
              </dt>
              <dd className="flex items-center gap-2 text-sm font-medium break-all text-neutral-950">
                {displayEmail}
                {emailVerified && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    <BadgeCheck className="size-3" aria-hidden="true" />
                    Verified
                  </span>
                )}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <dt className="flex items-center gap-2.5 text-sm text-neutral-600">
                <Phone
                  className="size-4 shrink-0 text-neutral-400"
                  aria-hidden="true"
                />
                Phone number
              </dt>
              <dd className="text-sm font-medium text-neutral-950">
                {displayPhone}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <dt className="flex items-center gap-2.5 text-sm text-neutral-600">
                <BadgeCheck
                  className="size-4 shrink-0 text-neutral-400"
                  aria-hidden="true"
                />
                Account status
              </dt>
              <dd className="text-sm font-medium">
                {profile.verified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <BadgeCheck className="size-3.5" aria-hidden="true" />
                    Verified rider
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                    <Clock className="size-3.5" aria-hidden="true" />
                    Under review
                  </span>
                )}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-4 px-6 py-4">
              <dt className="flex items-center gap-2.5 text-sm text-neutral-600">
                <CalendarCheck
                  className="size-4 shrink-0 text-neutral-400"
                  aria-hidden="true"
                />
                Total bookings
              </dt>
              <dd className="text-sm font-medium text-neutral-950">
                {profile.total_bookings}
              </dd>
            </div>
          </dl>

          {!profile.verified && (
            <div className="border-t border-neutral-100 p-6">
              <p className="text-sm text-neutral-500">
                Accounts are verified automatically once your email address is
                confirmed. If this still says under review, get in touch and
                our team will sort it out.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
