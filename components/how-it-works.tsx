import { CalendarCheck, MapPinned, Search } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Choose Your Bike",
    description: "Pick from scooters, cruisers and adventure bikes",
  },
  {
    icon: CalendarCheck,
    title: "Book Online",
    description: "Select your dates and confirm in minutes",
  },
  {
    icon: MapPinned,
    title: "Ride & Explore",
    description: "Collect your keys and head for the mountains",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto flex max-w-xl flex-col items-center gap-2 text-center">
        <span className="inline-flex items-center rounded-md bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
          Simple Process
        </span>
        <h2
          id="how-it-works-heading"
          className="text-3xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-4xl"
        >
          How It <span className="text-brand">Works</span>
        </h2>
        <p className="text-sm text-neutral-500 sm:text-base">
          Get your bike in three simple steps
        </p>
      </div>

      <div className="relative mt-12">
        {/* Connector line sitting behind the icon row on desktop only. */}
        <span
          aria-hidden="true"
          className="absolute top-12 right-[16.666%] left-[16.666%] hidden border-t-2 border-dashed border-neutral-200 lg:block"
        />

        <ol className="relative grid grid-cols-1 gap-10 sm:grid-cols-3 sm:gap-6">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="group flex flex-col items-center gap-4 text-center"
            >
              <span className="relative flex size-24 items-center justify-center rounded-full border-2 border-brand/20 bg-white text-brand transition-all duration-300 group-hover:border-brand group-hover:shadow-lg group-hover:shadow-brand/10">
                <step.icon
                  className="size-9"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="absolute -top-1 -right-1 flex size-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white shadow-sm">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </span>

              <div className="flex max-w-xs flex-col gap-1.5">
                <h3 className="text-lg font-bold text-neutral-950">
                  {step.title}
                </h3>
                <p className="text-sm text-neutral-600">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
