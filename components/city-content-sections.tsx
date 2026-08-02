import {
  Bike,
  FileCheck2,
  Headset,
  MapPin,
  MessageCircle,
  Mountain,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";

import { FaqList } from "@/components/faq-list";
import { WHY_ADVENTURE_WITH_US, type CityContent } from "@/lib/city-content";
import { SUPPORT_PHONE_HREF } from "@/lib/locations";

const WHY_ICONS = [ShieldCheck, Zap, Bike, MessageCircle] as const;

/**
 * The written body of a city page — the part that carries the local SEO.
 *
 * Shared verbatim between /manali and its three category pages (and the same
 * for Bhuntar), so the copy can't drift apart between them. Only the vehicles
 * shown above this differ.
 */
export function CityContentSections({ content }: { content: CityContent }) {
  return (
    <>
      {/* Freedom + documents */}
      <section
        aria-labelledby="documents-heading"
        className="grid grid-cols-1 gap-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8 lg:grid-cols-2 lg:gap-10"
      >
        <p className="text-lg leading-relaxed font-medium text-neutral-950 sm:text-xl">
          {content.intro}
        </p>

        <div>
          <h2
            id="documents-heading"
            className="text-sm font-bold tracking-wide text-neutral-950 uppercase"
          >
            Security Deposit &{" "}
            <span className="text-brand">Documents Required</span>
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            {content.documents.lead}
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {content.documents.items.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-neutral-700"
              >
                <FileCheck2
                  className="mt-0.5 size-4 shrink-0 text-brand"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-neutral-600">
            {content.documents.footnote}
            <a
              href={content.documents.footnoteLinkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand underline underline-offset-2 transition-colors hover:text-brand-dark"
            >
              {content.documents.footnoteLinkText}
            </a>
          </p>
        </div>
      </section>

      {/* Why us */}
      <section aria-labelledby="why-us-heading">
        <h2
          id="why-us-heading"
          className="text-center text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl"
        >
          Why Adventure <span className="text-brand">With Us?</span>
        </h2>

        <ul className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY_ADVENTURE_WITH_US.map((item, index) => {
            const Icon = WHY_ICONS[index] ?? ShieldCheck;
            return (
              <li
                key={item.title}
                className="flex flex-col gap-2.5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
              >
                <span
                  className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand"
                  aria-hidden="true"
                >
                  <Icon className="size-5" strokeWidth={1.75} />
                </span>
                <h3 className="text-base font-bold text-neutral-950">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-600">
                  {item.description}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Route chips */}
      <section aria-labelledby="route-chips-heading">
        <h2
          id="route-chips-heading"
          className="text-center text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl"
        >
          Popular <span className="text-brand">Himalayan Routes</span>
        </h2>

        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {content.routeChips.items.map((route) => (
            <li
              key={route}
              className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-4 transition-colors hover:border-brand/40"
            >
              <Mountain
                className="size-5 shrink-0 text-brand"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span className="text-sm font-semibold text-neutral-950">
                {route}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Custom itinerary CTA */}
      <section
        aria-labelledby="itinerary-heading"
        className="flex flex-col items-center gap-4 rounded-2xl bg-header px-6 py-10 text-center sm:px-10"
      >
        <span className="inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase">
          <Sparkles className="size-3.5 text-brand" aria-hidden="true" />
          Plan With Us
        </span>
        <h2
          id="itinerary-heading"
          className="text-2xl font-extrabold tracking-tight text-white uppercase italic sm:text-3xl"
        >
          Need a <span className="text-brand">Custom Itinerary?</span>
        </h2>
        <p className="max-w-lg text-sm text-neutral-300 sm:text-base">
          {content.itinerary.body}
        </p>
        <a
          href={SUPPORT_PHONE_HREF}
          className="mt-1 inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-brand-dark"
        >
          <Headset className="size-4" aria-hidden="true" />
          {content.itinerary.cta}
        </a>
      </section>

      {/* Pickup + pricing + requirements */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-8">
        <div className="flex flex-col gap-6">
          <section
            aria-labelledby="pickup-heading"
            className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7"
          >
            <span
              className="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand"
              aria-hidden="true"
            >
              <MapPin className="size-5" strokeWidth={1.75} />
            </span>
            <h2
              id="pickup-heading"
              className="mt-3 text-xl font-bold text-neutral-950 sm:text-2xl"
            >
              {content.pickup.heading}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              {content.pickup.body}
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-950">
              {content.pickup.closing}
            </p>
          </section>

          <section
            aria-labelledby="requirements-heading"
            className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7"
          >
            <h2
              id="requirements-heading"
              className="text-xl font-bold text-neutral-950 sm:text-2xl"
            >
              Security Deposit &{" "}
              <span className="text-brand">Documents Required</span>
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              {content.requirements.lead}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {content.requirements.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-neutral-700"
                >
                  <FileCheck2
                    className="mt-0.5 size-4 shrink-0 text-brand"
                    aria-hidden="true"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section
          aria-labelledby="pricing-heading"
          className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7"
        >
          <h2
            id="pricing-heading"
            className="text-xl font-bold text-neutral-950 sm:text-2xl"
          >
            Rental Pricing In <span className="text-brand">{content.city}</span>
          </h2>
          <p className="mt-2 text-sm text-neutral-600">{content.pricing.lead}</p>

          <div className="mt-5 flex flex-col gap-6">
            {content.pricing.groups.map((group) => (
              <div key={group.heading}>
                <h3 className="text-xs font-bold tracking-wide text-neutral-500 uppercase">
                  {group.heading}
                </h3>
                <dl className="mt-2.5 flex flex-col">
                  {group.rows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between gap-4 border-b border-neutral-100 py-2.5 last:border-b-0"
                    >
                      <dt className="text-sm text-neutral-700">{row.label}</dt>
                      <dd className="text-sm font-bold whitespace-nowrap text-neutral-950">
                        {row.price}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>

          <p className="mt-5 rounded-lg bg-neutral-50 px-3 py-2.5 text-xs text-neutral-500">
            {content.pricing.footnote}
          </p>
        </section>
      </div>

      {/* Route detail */}
      <section aria-labelledby="routes-heading">
        <h2
          id="routes-heading"
          className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl"
        >
          Popular Routes <span className="text-brand">from {content.city}</span>
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
          {content.routes.lead}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {content.routes.details.map((route) => (
            <article
              key={route.heading}
              className="flex flex-col gap-3 rounded-2xl border border-neutral-200 bg-white p-6"
            >
              <h3 className="text-lg font-bold text-neutral-950">
                {route.heading}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-600">
                {route.body}
              </p>

              {route.bestFor && (
                <div className="mt-1">
                  <p className="text-xs font-bold tracking-wide text-neutral-500 uppercase">
                    Best Suited For
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {route.bestFor.map((bike) => (
                      <li
                        key={bike}
                        className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-600"
                      >
                        {bike}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {route.note && (
                <p className="mt-auto rounded-lg bg-brand/5 px-3 py-2.5 text-xs font-medium text-neutral-700">
                  {route.note}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="city-faq-heading">
        <h2
          id="city-faq-heading"
          className="text-center text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl"
        >
          Frequently Asked <span className="text-brand">Questions</span>
        </h2>
        <div className="mx-auto mt-8 max-w-3xl">
          <FaqList faqs={content.faqs} />
        </div>
      </section>
    </>
  );
}
