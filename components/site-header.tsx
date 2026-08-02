"use client";

import Link from "next/link";
import * as React from "react";
import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  MapPin,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";

import { CITY_CATEGORIES, categoryPath } from "@/lib/city-content";
import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/locations";

// Homepage sections are linked by anchor; Contact is its own page.
const NAV_LINKS = [
  { label: "Category", href: "/#categories" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Find Us", href: "/#find-us" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/contact" },
] as const;

const LOCATIONS = [
  { slug: "manali", label: "Manali" },
  { slug: "bhuntar", label: "Bhuntar" },
] as const;

/**
 * Locations menu.
 *
 * Opens on hover for pointers and on click for touch — hover alone leaves it
 * unusable on a phone. The trigger is a real link to /vehicles too, so the
 * menu is never a dead end for anyone navigating by keyboard.
 */
function LocationsMenu() {
  const [open, setOpen] = React.useState(false);
  // Null until a city row is actually hovered or focused — the flyout should
  // never appear on its own.
  const [activeCity, setActiveCity] = React.useState<string | null>(null);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    // Click to open, not hover: a hover trigger fires whenever the cursor
    // merely passes near the label on its way elsewhere.
    <div
      ref={ref}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setOpen(false);
          setActiveCity(null);
        }
      }}
      className="relative"
    >
      <button
        type="button"
        onClick={() => {
          setOpen((value) => !value);
          setActiveCity(null);
        }}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex items-center gap-1 text-sm font-medium text-neutral-200 transition-colors hover:text-brand"
      >
        Locations
        <ChevronDown
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      <div
        className={`absolute top-full left-0 z-50 pt-3 transition-all ${
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        {/* Leaving the panel entirely closes any open flyout; moving between
            rows just swaps which one is showing. */}
        <ul
          onMouseLeave={() => setActiveCity(null)}
          className="w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl"
        >
          {LOCATIONS.map((location) => (
            <li
              key={location.slug}
              // Each city owns its own flyout, opened by hovering or focusing
              // anywhere within this row.
              onMouseEnter={() => setActiveCity(location.slug)}
              onFocus={() => setActiveCity(location.slug)}
              className="relative"
            >
              <Link
                href={`/${location.slug}`}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                aria-haspopup="true"
                aria-expanded={activeCity === location.slug}
                className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  activeCity === location.slug
                    ? "bg-neutral-50 text-brand"
                    : "text-neutral-950 hover:bg-neutral-50 hover:text-brand"
                }`}
              >
                <MapPin className="size-4 text-brand" aria-hidden="true" />
                {location.label}
                <ChevronRight
                  className="ml-auto size-3.5 text-neutral-400"
                  aria-hidden="true"
                />
              </Link>

              {/* Flyout — sits to the right of the row, not beneath it. */}
              <ul
                className={`absolute top-0 left-full w-60 rounded-xl border border-neutral-200 bg-white p-2 shadow-xl transition-all ${
                  activeCity === location.slug
                    ? "pointer-events-auto translate-x-0 opacity-100"
                    : "pointer-events-none -translate-x-1 opacity-0"
                }`}
              >
                <li className="px-3 pt-1 pb-2 text-[11px] font-bold tracking-wide text-neutral-400 uppercase">
                  {location.label} Rentals
                </li>
                {CITY_CATEGORIES.map((category) => (
                  <li key={category.key}>
                    <Link
                      href={categoryPath(location.slug, category.key)}
                      onClick={() => setOpen(false)}
                      tabIndex={
                        open && activeCity === location.slug ? 0 : -1
                      }
                      className="block rounded-lg px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-brand"
                    >
                      {category.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

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

  // The menu covers the screen, so the page behind it must not scroll —
  // otherwise closing the menu leaves you somewhere you never navigated to.
  React.useEffect(() => {
    if (!menuOpen) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

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
              <Link
                href={NAV_LINKS[0].href}
                className="text-sm font-medium text-neutral-200 transition-colors hover:text-brand"
              >
                {NAV_LINKS[0].label}
              </Link>

              <LocationsMenu />

              {NAV_LINKS.slice(1).map((link) => (
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

        {/* Mobile nav — a full-screen panel rather than a strip under the
            header. With locations expanded the list is far taller than a phone
            screen, and a cramped scrolling sliver was hard to use.
            100dvh, not 100vh: vh ignores mobile browser chrome, so the last
            item ends up behind the address bar. */}
        <div
          id="mobile-nav"
          hidden={!menuOpen}
          className="fixed inset-0 z-50 flex h-[100dvh] flex-col bg-header lg:hidden"
        >
          {/* Mirrors the header bar so closing feels like closing a layer,
              not jumping somewhere new. */}
          <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/10 px-4">
            <Link
              href="/"
              onClick={() => setMenuOpen(false)}
              className="text-base font-bold tracking-wide text-white"
            >
              BRB <span className="text-brand">EXPEDITIONS</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="text-white transition-colors hover:text-brand"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>

          <nav
            aria-label="Mobile primary"
            className="flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-4"
          >
            <div className="flex flex-col gap-1 py-4">
              <Link
                href={NAV_LINKS[0].href}
                onClick={() => setMenuOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/5 hover:text-brand"
              >
                {NAV_LINKS[0].label}
              </Link>

              {/* Locations, expanded inline — a nested dropdown inside a
                  drawer is fiddly on a phone, so the links are just listed. */}
              {LOCATIONS.map((location) => (
                <div key={location.slug} className="flex flex-col">
                  <Link
                    href={`/${location.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-1.5 rounded-md px-2 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/5 hover:text-brand"
                  >
                    <MapPin className="size-3.5 text-brand" aria-hidden="true" />
                    {location.label}
                  </Link>
                  {CITY_CATEGORIES.map((category) => (
                    <Link
                      key={category.key}
                      href={categoryPath(location.slug, category.key)}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-md py-2 pr-2 pl-9 text-sm text-neutral-400 transition-colors hover:bg-white/5 hover:text-brand"
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              ))}

              {NAV_LINKS.slice(1).map((link) => (
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
            </div>
          </nav>

          {/* Pinned, so the main action is reachable without scrolling to the
              end of the list. pb-safe keeps it clear of the home indicator. */}
          <div className="shrink-0 border-t border-white/10 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <Link
              href="/vehicles"
              onClick={() => setMenuOpen(false)}
              className="block rounded-md bg-brand px-5 py-3 text-center text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark"
            >
              Book Your Ride
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
