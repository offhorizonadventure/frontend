import { Plus } from "lucide-react";

import type { Faq } from "@/lib/city-content";

/**
 * Accordion list of questions, matching the homepage FAQ styling.
 *
 * Built on <details>/<summary> so it works before hydration and is readable by
 * crawlers — the answers are in the HTML, not revealed by script.
 */
export function FaqList({ faqs }: { faqs: readonly Faq[] }) {
  return (
    <div className="flex flex-col gap-3">
      {faqs.map((faq) => (
        <details
          key={faq.question}
          className="group rounded-xl border border-neutral-200 bg-white transition-colors open:border-brand/40 hover:border-neutral-300"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-sm font-semibold text-neutral-950 sm:text-base [&::-webkit-details-marker]:hidden">
            {faq.question}
            <Plus
              className="size-5 shrink-0 text-brand transition-transform duration-300 group-open:rotate-45"
              aria-hidden="true"
            />
          </summary>
          <p className="px-5 pb-5 text-sm leading-relaxed text-neutral-600">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
