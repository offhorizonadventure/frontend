import { Quote, Star } from "lucide-react";

import { Carousel } from "@/components/ui/carousel";
import { REVIEWS } from "@/lib/reviews";

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function ReviewsSection() {
  return (
    <section
      className="bg-neutral-50 py-14 lg:py-20"
      aria-labelledby="reviews-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center">
          <span className="inline-flex items-center rounded-md bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
            Rated 4.8 On Google
          </span>
          <h2
            id="reviews-heading"
            className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl"
          >
            What Riders <span className="text-brand">Say</span>
          </h2>
          <p className="text-sm text-neutral-500 sm:text-base">
            Real reviews from riders who explored the Himalayas with us
          </p>
        </div>

        <div className="mt-10">
          <Carousel ariaLabel="Customer reviews" itemsLabel="reviews">
            {REVIEWS.map((review) => (
              <li
                key={review.name}
                className="flex w-full shrink-0 snap-start sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3rem)/3)]"
              >
                <figure className="relative flex h-full flex-col gap-4 rounded-xl border border-neutral-200 bg-white p-6 sm:p-7">
                  <Quote
                    className="absolute top-6 right-6 size-8 text-neutral-100"
                    aria-hidden="true"
                  />

                  <div
                    className="flex items-center gap-0.5 text-brand"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 fill-current"
                        aria-hidden="true"
                      />
                    ))}
                  </div>

                  <blockquote className="flex-1 text-sm leading-relaxed text-neutral-700">
                    {review.quote}
                  </blockquote>

                  <figcaption className="flex items-center gap-3 border-t border-neutral-100 pt-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-xs font-bold text-white">
                      {initials(review.name)}
                    </span>
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold text-neutral-950">
                        {review.name}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {review.badge}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
