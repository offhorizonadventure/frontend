import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Page numbers around the current one, with ellipses for the gaps. */
function pageItems(current: number, total: number): (number | "gap")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const items: (number | "gap")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push("gap");
  for (let page = start; page <= end; page += 1) items.push(page);
  if (end < total - 1) items.push("gap");
  items.push(total);

  return items;
}

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const items = pageItems(currentPage, totalPages);

  const base =
    "flex size-9 items-center justify-center rounded-md border text-sm font-medium transition-colors";
  const inactive =
    "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-950 hover:text-neutral-950";
  const disabled = "pointer-events-none border-neutral-100 text-neutral-300";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      <Link
        href={buildHref(currentPage - 1)}
        aria-label="Previous page"
        aria-disabled={currentPage === 1}
        className={`${base} ${currentPage === 1 ? disabled : inactive}`}
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </Link>

      {items.map((item, index) =>
        item === "gap" ? (
          <span
            key={`gap-${index}`}
            className="px-1 text-sm text-neutral-400"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Link
            key={item}
            href={buildHref(item)}
            aria-label={`Page ${item}`}
            aria-current={item === currentPage ? "page" : undefined}
            className={`${base} ${
              item === currentPage
                ? "border-brand bg-brand text-white"
                : inactive
            }`}
          >
            {item}
          </Link>
        )
      )}

      <Link
        href={buildHref(currentPage + 1)}
        aria-label="Next page"
        aria-disabled={currentPage === totalPages}
        className={`${base} ${currentPage === totalPages ? disabled : inactive}`}
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </Link>
    </nav>
  );
}
