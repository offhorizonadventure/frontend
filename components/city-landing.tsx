import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Headset } from "lucide-react";

import { CityCategorySection } from "@/components/city-category-section";
import { CityContentSections } from "@/components/city-content-sections";
import { type CityContent } from "@/lib/city-content";
import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/locations";

export function CityLanding({ content }: { content: CityContent }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: content.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: { "@type": "Answer", text: faq.answer },
    })),
  };

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        // Our own copy, not user input.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero — same washed background treatment as the vehicles page */}
      <section className="relative overflow-hidden border-b border-neutral-100">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.jpg"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/90" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-neutral-500 sm:text-sm">
              <li>
                <Link href="/" className="transition-colors hover:text-brand">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li className="font-medium text-neutral-950">{content.city}</li>
            </ol>
          </nav>

          <h1 className="mt-3 max-w-4xl text-2xl leading-tight font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-3xl lg:text-4xl">
            {content.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
            {content.subtitle}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href="/vehicles"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Explore Vehicles
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href={SUPPORT_PHONE_HREF}
              className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:border-neutral-950"
            >
              <Headset className="size-4 text-brand" aria-hidden="true" />
              {SUPPORT_PHONE}
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-4 py-10 sm:px-6 lg:gap-20 lg:px-8 lg:py-14">
        <CityCategorySection citySlug={content.slug} city={content.city} />

        <CityContentSections content={content} />
      </div>
    </main>
  );
}
