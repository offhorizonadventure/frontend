"use client";

import Link from "next/link";
import { useState } from "react";
import {
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";

import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/locations";

// Homepage sections are linked by anchor; Contact is its own page.
const NAV_LINKS = [
  { label: "Category", href: "/#categories" },
  { label: "Bikes", href: "/#bikes" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Find Us", href: "/#find-us" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
] as const;

function TopBar() {
  return (
    <div className="bg-header text-neutral-300">
      {/* Mobile: single condensed line */}
      <div className="flex items-center justify-center px-4 py-2 text-xs sm:hidden">
        <a
          href={SUPPORT_PHONE_HREF}
          className="flex items-center gap-1.5 text-neutral-300 transition-colors hover:text-brand"
        >
          <Phone className="size-3.5" aria-hidden="true" />
          {SUPPORT_PHONE}
        </a>
      </div>

      {/* Desktop: three sections */}
      <div className="mx-auto hidden max-w-7xl items-center justify-between gap-4 px-6 py-2 text-xs sm:flex lg:px-8">
        <p className="font-semibold tracking-wide whitespace-nowrap text-white uppercase">
          Welcome to BRB Expeditions
        </p>
        <p className="whitespace-nowrap">
          For assistance, reach out to us at{" "}
          <a
            href={SUPPORT_PHONE_HREF}
            className="font-medium text-brand transition-colors hover:text-white"
          >
            {SUPPORT_PHONE}
          </a>
        </p>
        <p className="flex items-center gap-1.5 whitespace-nowrap">
          <MapPin className="size-3.5 text-brand" aria-hidden="true" />
          Manali & Bhuntar
        </p>
      </div>
    </div>
  );
}

export function SiteHeader({
  isSignedIn = false,
  cartCount = 0,
}: {
  isSignedIn?: boolean;
  cartCount?: number;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Signed out, the account icon goes to login and comes back afterwards.
  const accountHref = isSignedIn ? "/profile" : "/login?next=%2Fprofile";

  return (
    <header className="sticky top-0 z-50 border-b-2 border-brand">
      <TopBar />

      <div className="border-b border-white/10 bg-header">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Left: mobile menu toggle + desktop nav links */}
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className="text-white transition-colors hover:text-brand lg:hidden"
            >
              {menuOpen ? (
                <X className="size-6" aria-hidden="true" />
              ) : (
                <Menu className="size-6" aria-hidden="true" />
              )}
            </button>

            <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-neutral-200 transition-colors hover:text-brand"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center: logo */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 text-base font-bold tracking-wide whitespace-nowrap text-white sm:text-lg lg:text-xl"
          >
            BRB <span className="text-brand">EXPEDITIONS</span>
          </Link>

          {/* Right: icons + CTA */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/vehicles"
              aria-label="Search vehicles"
              className="text-neutral-200 transition-colors hover:text-brand"
            >
              <Search className="size-5" aria-hidden="true" />
            </Link>
            <Link
              href={accountHref}
              aria-label={isSignedIn ? "My account" : "Sign in"}
              className="hidden text-neutral-200 transition-colors hover:text-brand sm:inline-flex"
            >
              <User className="size-5" aria-hidden="true" />
            </Link>
            <Link
              href="/cart"
              aria-label={
                cartCount > 0
                  ? `Cart, ${cartCount} ${cartCount === 1 ? "vehicle" : "vehicles"}`
                  : "Cart"
              }
              className="relative text-neutral-200 transition-colors hover:text-brand"
            >
              <ShoppingCart className="size-5" aria-hidden="true" />
              {cartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1.5 -right-1.5 flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white"
                >
                  {cartCount}
                </span>
              )}
            </Link>
            <Link
              href="/vehicles"
              className="hidden rounded-md bg-brand px-4 py-1.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:bg-brand-dark sm:inline-flex"
            >
              Book Your Ride
            </Link>
          </div>
        </div>

        {/* Mobile nav drawer */}
        <div
          id="mobile-nav"
          className={`grid transition-[grid-template-rows] duration-300 ease-out lg:hidden ${
            menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <nav
            aria-label="Mobile primary"
            className="overflow-hidden border-t border-white/10 px-4"
          >
            <div className="flex flex-col gap-1 py-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-2 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/5 hover:text-brand"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={accountHref}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/5 hover:text-brand"
              >
                {isSignedIn ? "My Account" : "Sign In"}
              </Link>
              {isSignedIn && (
                <Link
                  href="/my-bookings"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-2 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/5 hover:text-brand"
                >
                  My Bookings
                </Link>
              )}
              <Link
                href="/vehicles"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-md bg-brand px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                Book Your Ride
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
