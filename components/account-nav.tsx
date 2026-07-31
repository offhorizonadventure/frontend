"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, UserRound } from "lucide-react";

const LINKS = [
  { href: "/profile", label: "My Details", icon: UserRound },
  { href: "/my-bookings", label: "My Bookings", icon: CalendarCheck },
] as const;

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account" className="flex gap-2 overflow-x-auto pb-1">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex shrink-0 items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              active
                ? "bg-neutral-950 text-white"
                : "border border-neutral-200 text-neutral-700 hover:border-neutral-950 hover:text-neutral-950"
            }`}
          >
            <link.icon className="size-4" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
