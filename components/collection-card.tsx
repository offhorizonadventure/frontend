import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";

/**
 * Shared image card used for both vehicle categories and subcategories, so the
 * two levels of the browse flow look identical.
 */
export function CollectionCard({
  href,
  title,
  subtitle,
  imageUrl,
  imageAlt,
  priority = false,
}: {
  href: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string | null;
  imageAlt: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-900 shadow-lg"
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
          // Served straight from Supabase's CDN. Routing these through Next's
          // optimizer means a server-side fetch of the full-size upload, which
          // trips its 7s timeout on large admin-uploaded photos.
          unoptimized
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-neutral-500">
          <ImageIcon className="size-8" aria-hidden="true" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-3 p-6 sm:p-7">
        <div className="flex flex-col gap-1">
          <h3 className="text-2xl font-bold text-white sm:text-3xl">{title}</h3>
          {subtitle && (
            <p className="line-clamp-2 text-sm text-white/80">{subtitle}</p>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-brand px-5 py-2.5 text-xs font-semibold tracking-wide text-white uppercase transition-colors group-hover:bg-brand-dark">
          Explore
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
