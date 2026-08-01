import Link from "next/link";
import { Phone, Send } from "lucide-react";

import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/locations";

/** WhatsApp's click-to-chat format wants the number as digits only. */
const WHATSAPP_HREF = `https://wa.me/${SUPPORT_PHONE.replace(/\D/g, "")}`;

/** Inline mark — lucide has no WhatsApp glyph, and its logo is a wordless icon. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.23 8.23 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.09-.17.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07s.89 2.4 1.01 2.56c.12.17 1.74 2.66 4.22 3.73.59.25 1.05.4 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.29Z" />
    </svg>
  );
}

const ACTIONS = [
  { label: "Whatsapp", href: WHATSAPP_HREF, icon: WhatsAppIcon, external: true },
  { label: "Send Query", href: "/contact", icon: Send, external: false },
  { label: "Call Us", href: SUPPORT_PHONE_HREF, icon: Phone, external: true },
] as const;

/**
 * Persistent contact bar pinned to the bottom of every page.
 *
 * A server component with no state: three plain links, so it works with
 * JavaScript disabled and costs nothing in the client bundle.
 */
export function FloatingContact() {
  const itemClass =
    "flex flex-1 flex-col items-center justify-center gap-1 px-3 py-3 text-white transition-colors hover:bg-white/10 focus-visible:bg-white/10 focus-visible:outline-none sm:px-6";

  return (
    // Phones only: on desktop the header already carries a phone number and a
    // CTA, so a floating bar would just cover content.
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:hidden">
      <nav
        aria-label="Contact us"
        className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl bg-brand shadow-xl shadow-black/20 sm:max-w-md"
      >
        <ul className="flex items-stretch divide-x divide-white/25">
          {ACTIONS.map((action) => {
            const inner = (
              <>
                <action.icon className="size-5 shrink-0" />
                <span className="text-xs font-semibold whitespace-nowrap sm:text-sm">
                  {action.label}
                </span>
              </>
            );

            return (
              <li key={action.label} className="flex flex-1">
                {action.external ? (
                  <a
                    href={action.href}
                    target={
                      action.href.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      action.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className={itemClass}
                  >
                    {inner}
                  </a>
                ) : (
                  <Link href={action.href} className={itemClass}>
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
