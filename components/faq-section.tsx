import { Plus } from "lucide-react";

import { FAQS } from "@/lib/faqs";

/**
 * Uses native <details>/<summary> so answers are in the DOM (crawlable and
 * searchable in-page) and the accordion works with zero JavaScript.
 * A matching FAQPage JSON-LD block makes the Q&As eligible for rich results.
 */
export function FaqSection() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section
      id="faq"
      className="scroll-mt-28 bg-neutral-50 py-14 lg:py-20"
      aria-labelledby="faq-heading"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 text-center">
          <span className="inline-flex items-center rounded-md bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
            Good To Know
          </span>
          <h2
            id="faq-heading"
            className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl"
          >
            Frequently Asked <span className="text-brand">Questions</span>
          </h2>
          <p className="text-sm text-neutral-500 sm:text-base">
            Everything about documents, deposits and riding the mountains with
            us
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {FAQS.map((faq) => (
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
      </div>
    </section>
  );
}
