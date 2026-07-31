import { LifeBuoy, Mountain, Receipt, Wrench } from "lucide-react";

const FEATURES = [
  {
    icon: Mountain,
    title: "Mountain-Ready Vehicles",
    description: "Built for Himalayan terrain",
  },
  {
    icon: LifeBuoy,
    title: "Local Support",
    description: "Real help, right when you need it",
  },
  {
    icon: Wrench,
    title: "Regularly Serviced",
    description: "Checked before every ride",
  },
  {
    icon: Receipt,
    title: "Transparent Pricing",
    description: "No hidden charges, ever",
  },
] as const;

export function TrustFeatures() {
  return (
    <div className="relative z-10 mx-auto -mt-8 max-w-7xl px-4 sm:px-6 lg:-mt-10 lg:px-8">
      <div className="grid grid-cols-1 rounded-lg border border-neutral-100 bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
        {FEATURES.map(({ icon: Icon, title, description }, i) => (
          <div
            key={title}
            className={[
              "flex items-center gap-3 py-6 sm:px-6 lg:py-0",
              // Mobile (single column): horizontal divider above every item but the first.
              i === 0 ? "border-t-0" : "border-t",
              // Tablet (2-column grid): vertical divider on the right column,
              // horizontal divider on the second row only.
              i % 2 === 0 ? "sm:border-l-0" : "sm:border-l",
              i < 2 ? "sm:border-t-0" : "sm:border-t",
              // Desktop (single row of 4): vertical divider between items only.
              "lg:border-t-0",
              i === 0 ? "lg:border-l-0" : "lg:border-l",
              "border-neutral-200",
            ].join(" ")}
          >
            <Icon
              className="size-7 shrink-0 text-brand"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-neutral-950">
                {title}
              </span>
              <span className="text-xs text-neutral-500">{description}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
