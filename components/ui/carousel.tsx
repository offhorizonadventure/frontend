"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Horizontal scroll-snap carousel.
 *
 * Scrolling itself is native CSS (works by touch/trackpad with no JS), so the
 * content stays usable even before hydration. The buttons are progressive
 * enhancement that scroll one full page of items at a time, and disable
 * themselves at either end. They hide entirely when everything already fits.
 *
 * Children must be `<li>` elements; size them as exact fractions of the row so
 * a page scroll always lands on a clean edge.
 */
export function Carousel({
  ariaLabel,
  itemsLabel,
  children,
}: {
  ariaLabel: string;
  /** Plural noun used in the buttons' accessible names, e.g. "categories". */
  itemsLabel: string;
  children: React.ReactNode;
}) {
  const scrollerRef = React.useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = React.useState(true);
  const [atEnd, setAtEnd] = React.useState(true);

  const updateScrollState = React.useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    setAtStart(scroller.scrollLeft <= 4);
    setAtEnd(
      scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 4
    );
  }, []);

  React.useEffect(() => {
    updateScrollState();
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      scroller.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  function scrollByPage(direction: 1 | -1) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.scrollBy({
      left: scroller.clientWidth * direction,
      behavior: "smooth",
    });
  }

  return (
    <div className="relative">
      <ul
        ref={scrollerRef}
        aria-label={ariaLabel}
        className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2"
      >
        {children}
      </ul>

      {!(atStart && atEnd) && (
        <div className="mt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            disabled={atStart}
            aria-label={`Scroll to previous ${itemsLabel}`}
            className="flex size-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:border-neutral-950 hover:text-neutral-950 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            disabled={atEnd}
            aria-label={`Scroll to next ${itemsLabel}`}
            className="flex size-9 items-center justify-center rounded-full border border-neutral-300 text-neutral-700 transition-colors hover:border-neutral-950 hover:text-neutral-950 disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
