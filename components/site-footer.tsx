import Link from "next/link";
import { Mail, MapPin, Navigation, Phone, ShieldCheck } from "lucide-react";

import {
  OFFICES,
  SUPPORT_EMAIL,
  SUPPORT_PHONE,
  SUPPORT_PHONE_HREF,
} from "@/lib/locations";

const QUICK_LINKS = [
  { label: "Category", href: "/#categories" },
  { label: "Vehicles", href: "/vehicles" },
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Find Us", href: "/#find-us" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
  { label: "Book Your Ride", href: "/vehicles" },
] as const;

/** Payment methods Razorpay settles for Indian merchants. */
const PAYMENT_METHODS = [
  "UPI",
  "Visa",
  "Mastercard",
  "RuPay",
  "Net Banking",
  "Wallets",
] as const;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-header text-neutral-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.4fr_0.8fr_1fr] lg:gap-8">
          {/* Branding */}
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="text-lg font-bold tracking-wide text-white"
            >
              BRB <span className="text-brand">EXPEDITIONS</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed">
              Self-drive bike and car rentals in the Kullu–Manali valley.
              Well-maintained vehicles, honest pricing and local riders who know
              every turn of the Himalayas.
            </p>
            <p className="inline-flex w-fit items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300">
              <ShieldCheck className="size-3.5 text-brand" aria-hidden="true" />
              Serving riders since 2014
            </p>
          </div>

          {/* Offices */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              Our Offices
            </h2>
            <ul className="flex flex-col gap-4">
              {OFFICES.map((office) => (
                <li
                  key={`${office.city}-${office.branch}`}
                  className="flex items-start gap-2.5"
                >
                  <MapPin
                    className="mt-0.5 size-4 shrink-0 text-brand"
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-neutral-200">
                      {office.city} ( {office.branch} )
                    </span>
                    <address className="text-xs leading-relaxed not-italic">
                      {office.address}
                    </address>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <a
                        href={office.directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:text-white"
                      >
                        <Navigation className="size-3" aria-hidden="true" />
                        Get Directions
                        <span className="sr-only">
                          to {office.city} {office.branch} branch
                        </span>
                      </a>
                      <a
                        href={SUPPORT_PHONE_HREF}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-300 transition-colors hover:text-white"
                      >
                        <Phone className="size-3" aria-hidden="true" />
                        Call
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer" className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              Quick Links
            </h2>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-brand"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              Contact Us
            </h2>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href={SUPPORT_PHONE_HREF}
                  className="flex items-center gap-2.5 text-sm transition-colors hover:text-white"
                >
                  <Phone className="size-4 shrink-0 text-brand" aria-hidden="true" />
                  {SUPPORT_PHONE}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="flex items-center gap-2.5 text-sm break-all transition-colors hover:text-white"
                >
                  <Mail className="size-4 shrink-0 text-brand" aria-hidden="true" />
                  {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        {/* Extra bottom padding on phones keeps the footer's dark band running
            behind the fixed contact bar. The bar is hidden from md up, so the
            padding goes with it. */}
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 pt-6 pb-28 sm:px-6 md:pb-6 lg:flex-row lg:px-8">
          <p className="order-2 text-xs text-neutral-500 lg:order-1">
            © {year} BRB Expeditions. All rights reserved.
          </p>

          <div className="order-1 flex flex-col items-center gap-2 lg:order-2 lg:items-end">
            <ul className="flex flex-wrap items-center justify-center gap-2">
              {PAYMENT_METHODS.map((method) => (
                <li
                  key={method}
                  className="rounded border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-neutral-300"
                >
                  {method}
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-neutral-500">
              Payments secured by Razorpay
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
