import Link from "next/link";
import { ChevronRight, Headset, Mail } from "lucide-react";

import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/locations";

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

/**
 * Shared shell for Privacy and Terms.
 *
 * Same hero treatment as the rest of the site, with the body kept to a single
 * readable column — legal copy is read in long stretches, not scanned.
 */
export function LegalPage({
  title,
  highlight,
  intro,
  updated,
  sections,
}: {
  title: string;
  highlight: string;
  intro: string;
  updated: string;
  sections: LegalSection[];
}) {
  return (
    <main className="flex-1">
      <section className="border-b border-neutral-100 bg-neutral-50">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
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
              <li className="font-medium text-neutral-950">{title}</li>
            </ol>
          </nav>

          <h1 className="mt-3 text-2xl leading-tight font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-3xl lg:text-4xl">
            {title} <span className="text-brand">{highlight}</span>
          </h1>
          <p className="mt-2 text-sm text-neutral-600 sm:text-base">{intro}</p>
          <p className="mt-3 text-xs text-neutral-500">
            Last updated: {updated}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-bold text-neutral-950 sm:text-xl">
                {section.heading}
              </h2>

              {section.paragraphs?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base"
                >
                  {paragraph}
                </p>
              ))}

              {section.bullets && (
                <ul className="mt-3 flex flex-col gap-2">
                  {section.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2.5 text-sm leading-relaxed text-neutral-600 sm:text-base"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-brand"
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <section className="mt-10 rounded-2xl border border-neutral-200 bg-neutral-50 p-6">
          <h2 className="text-base font-bold text-neutral-950">
            Questions about this page?
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            Get in touch and a real person will answer.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={SUPPORT_PHONE_HREF}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              <Headset className="size-4" aria-hidden="true" />
              {SUPPORT_PHONE}
            </a>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:border-neutral-950"
            >
              <Mail className="size-4 text-brand" aria-hidden="true" />
              {SUPPORT_EMAIL}
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
