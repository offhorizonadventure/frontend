/**
 * Copy for the city landing pages.
 *
 * These pages carry the site's local SEO, so the wording here is written and
 * owned by the business — treat it as content, not boilerplate, and don't
 * reword it when changing the layout. Structure is shared so Manali and
 * Bhuntar stay visually consistent; only the text differs.
 */

/**
 * The three rental categories each city page links out to.
 *
 * `categoryName` must match the name in vehicle_categories exactly — that's
 * how vehicles are looked up. `key` builds the URL.
 */
export const CITY_CATEGORIES = [
  {
    key: "bike",
    categoryName: "Bike",
    label: "Bike Rental",
    blurb:
      "Himalayan-ready motorcycles, serviced before every trip and built for high passes.",
  },
  {
    key: "car",
    categoryName: "Car",
    label: "Car Rental",
    blurb:
      "Self-drive cars and 4×4s for families, rough terrain and long highway days.",
  },
  {
    key: "scooter",
    categoryName: "Scooter",
    label: "Scooter Rental",
    blurb:
      "Light, easy and automatic — ideal for short valley runs and town riding.",
  },
] as const;

export type CityCategory = (typeof CITY_CATEGORIES)[number];

/** e.g. /manali/bike-rental-in-manali */
export function categoryPath(citySlug: string, key: string) {
  return `/${citySlug}/${key}-rental-in-${citySlug}`;
}

/** Reverses categoryPath, so the route can validate the slug it was given. */
export function parseCategorySlug(citySlug: string, slug: string) {
  return (
    CITY_CATEGORIES.find(
      (category) => `${category.key}-rental-in-${citySlug}` === slug
    ) ?? null
  );
}

export type PriceRow = { label: string; price: string };

export type RouteDetail = {
  heading: string;
  body: string;
  bestFor?: string[];
  note?: string;
};

export type Faq = { question: string; answer: string };

export type CityContent = {
  slug: string;
  city: string;
  /** H1 — the primary keyword target for the page. */
  title: string;
  subtitle: string;
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
  ogImageAlt: string;
  intro: string;
  documents: {
    heading: string;
    lead: string;
    items: string[];
    footnote: string;
    footnoteLinkText: string;
    footnoteLinkHref: string;
  };
  routeChips: { heading: string; items: string[] };
  itinerary: { heading: string; body: string; cta: string };
  pickup: { heading: string; body: string; closing: string };
  pricing: {
    heading: string;
    lead: string;
    groups: { heading: string; rows: PriceRow[] }[];
    footnote: string;
  };
  requirements: { heading: string; lead: string; items: string[] };
  routes: { heading: string; lead: string; details: RouteDetail[] };
  faqs: Faq[];
};

const WHY_US = [
  {
    title: "Full Maintenance",
    description: "Inspected before every tour for your safety",
  },
  {
    title: "Fast & Easy Booking",
    description:
      "Quick booking with minimal paperwork and instant confirmations.",
  },
  {
    title: "Wide Range Of Vehicles",
    description:
      "Choose from self drive cars, bikes and scooty, well maintained and ready to ride",
  },
  {
    title: "Instant Support on WhatsApp",
    description: "Fast response & easy communication",
  },
] as const;

export const WHY_ADVENTURE_WITH_US = WHY_US;

export const MANALI: CityContent = {
  slug: "manali",
  city: "Manali",
  title:
    "Bike and Car Rental in Manali - Affordable Self Drive Cars & Bikes",
  subtitle:
    "Conquer the Himalayas with our premium fleet. Reliable, well maintained and ready for adventure.",
  metaTitle: "Affordable Bikes & Car Rental in Manali - Book Now",
  metaDescription:
    "Best bike rental in Manali near Mall Road. Self drive 4x4 cars & Ladakh bikes available. No hidden charges. Instant booking support.",
  ogImage:
    "/og-hero.jpg",
  ogImageAlt:
    "Royal Enfield Himalayan 450 parked on a snowy Himalayan mountain road in Manali under colorful prayer flags.",
  intro:
    "Explore the Himalayas at your own pace with our self drive car rental in Manali. No drivers, no restrictions, just pure freedom.",
  documents: {
    heading: "Security Deposit & Documents Required",
    lead: "To rent a vehicle in Manali, you typically need:",
    items: [
      "Valid Driving License",
      "Government ID proof",
      "Refundable security deposit",
    ],
    footnote: "International travelers may require an ",
    footnoteLinkText: "International Driving Permit.",
    footnoteLinkHref: "https://iaapermittranslation.com/",
  },
  routeChips: {
    heading: "Popular Himalayan Routes",
    items: [
      "Manali to Leh Ladakh",
      "Spiti Valley Circuit",
      "Rohtang Pass Tour",
      "Kasol & Manikaran",
      "Atal Tunnel Day Tour",
    ],
  },
  itinerary: {
    heading: "Need a Custom Itinerary?",
    body: "Our experts can help you plan the perfect road trip across Himachal and Ladakh",
    cta: "Talk To Our Guide",
  },
  pickup: {
    heading: "Easy Pickup Near Mall Road Manali",
    body: "Our pickup location is convenient for travelers arriving by bus or taxi. Quick documentation, fast handover, simple return process.",
    closing: "Your trip starts without delay.",
  },
  pricing: {
    heading: "Rental Pricing In Manali",
    lead: "Pricing varies depending on season, vehicle type, and rental duration.",
    groups: [
      {
        heading: "Bike Rentals Price Per Day",
        rows: [
          { label: "RE Himalayan 450cc", price: "₹2000 – ₹2500" },
          { label: "RE Himalayan 411cc", price: "₹1500 – ₹1800" },
          { label: "RE Scram", price: "₹1200 – ₹1500" },
          { label: "Hero Xpulse", price: "₹1000 – ₹1200" },
          { label: "Scooty", price: "₹600 – ₹800" },
        ],
      },
      {
        heading: "Car Rentals Price Per Day",
        rows: [{ label: "Maruti Suzuki Jimny", price: "₹4000 – ₹6000" }],
      },
    ],
    footnote: "Long-term bookings receive discounted rates.",
  },
  requirements: {
    heading: "Security Deposit & Documents Required",
    lead: "To rent a vehicle in Manali, you typically need:",
    items: [
      "Valid Driving License",
      "Govt. ID Proof",
      "Refundable Security Deposit",
      "International travelers require an IDLP.",
    ],
  },
  routes: {
    heading: "Popular Routes from Manali",
    lead: "Manali is the gateway to some of India's most breathtaking road journeys.",
    details: [
      {
        heading: "Manali to Leh Ladakh Bike Trip",
        body: "The Manali-Leh Highway is a dream route for riders. High mountain passes, river crossings, and endless valleys make it unforgettable.",
        bestFor: ["RE Himalayan 450cc", "RE Himalayan 411cc", "Adventure bikes"],
        note: "Plan fuel stops carefully and ride prepared for altitude changes.",
      },
      {
        heading: "Manali to Spiti Valley Road Trip",
        body: "Spiti offers dramatic landscapes, monasteries, and remote Himalayan villages. 4×4 rentals are highly recommended due to rough terrain.",
        bestFor: ["Maruti Suzuki Jimny", "RE Himalayan 450cc", "4×4 rentals"],
        note: "Carry extra fuel for the Kaza stretch and keep a day spare for weather.",
      },
      {
        heading: "Rohtang Pass & Atal Tunnel Drive",
        body: "A short but scenic route perfect for families and snow lovers. Ideal for car rentals and beginner riders.",
        bestFor: ["Maruti Suzuki Jimny", "RE Scram", "Scooty"],
        note: "A permit is needed for Rohtang Pass. The Atal Tunnel side stays open year round.",
      },
    ],
  },
  faqs: [
    {
      question: "What documents are required to rent a bike in Manali?",
      answer:
        "A valid driving license and government ID are mandatory. A refundable security deposit is also required.",
    },
    {
      question: "Can I rent a car without driver in Manali?",
      answer:
        "Yes. We provide self drive car rentals for travelers who prefer independent travel.",
    },
    {
      question: "Is helmet included in bike rental?",
      answer:
        "Yes. Helmets are included. Additional riding gear may be available on request.",
    },
    {
      question: "Do you provide backup vehicle for Ladakh trips?",
      answer: "Yes, we can provide backup vehicles.",
    },
  ],
};

// NOTE: Bhuntar mirrors Manali's structure, with the wording adjusted for the
// airport pickup point. Replace this copy with your own SEO-written text
// before this page goes live.
export const BHUNTAR: CityContent = {
  slug: "bhuntar",
  city: "Bhuntar",
  title:
    "Bike and Car Rental in Bhuntar - Affordable Self Drive Cars & Bikes",
  subtitle:
    "Land and ride. Collect your vehicle minutes from Kullu–Manali Airport, ready for the Himalayas.",
  metaTitle: "Affordable Bikes & Car Rental in Bhuntar - Book Now",
  metaDescription:
    "Bike rental in Bhuntar near Kullu–Manali Airport. Self drive 4x4 cars & Ladakh bikes available. No hidden charges. Instant booking support.",
  ogImage:
    "https://www.bikerentalsbhuntar.com/wp-content/uploads/2026/02/royal-enfield-himalayan-450-manali-snow-mountain.jpg",
  ogImageAlt:
    "Royal Enfield Himalayan 450 parked on a snowy Himalayan mountain road under colorful prayer flags.",
  intro:
    "Explore the Himalayas at your own pace with our self drive car rental in Bhuntar. No drivers, no restrictions, just pure freedom.",
  documents: {
    heading: "Security Deposit & Documents Required",
    lead: "To rent a vehicle in Bhuntar, you typically need:",
    items: [
      "Valid Driving License",
      "Government ID proof",
      "Refundable security deposit",
    ],
    footnote: "International travelers may require an ",
    footnoteLinkText: "International Driving Permit.",
    footnoteLinkHref: "https://iaapermittranslation.com/",
  },
  routeChips: {
    heading: "Popular Himalayan Routes",
    items: [
      "Bhuntar to Leh Ladakh",
      "Spiti Valley Circuit",
      "Rohtang Pass Tour",
      "Kasol & Manikaran",
      "Atal Tunnel Day Tour",
    ],
  },
  itinerary: {
    heading: "Need a Custom Itinerary?",
    body: "Our experts can help you plan the perfect road trip across Himachal and Ladakh",
    cta: "Talk To Our Guide",
  },
  pickup: {
    heading: "Easy Pickup Near Kullu–Manali Airport",
    body: "Our pickup location is minutes from the airport and the Kullu bus stand. Quick documentation, fast handover, simple return process.",
    closing: "Your trip starts without delay.",
  },
  pricing: {
    heading: "Rental Pricing In Bhuntar",
    lead: "Pricing varies depending on season, vehicle type, and rental duration.",
    groups: [
      {
        heading: "Bike Rentals Price Per Day",
        rows: [
          { label: "RE Himalayan 450cc", price: "₹2000 – ₹2500" },
          { label: "RE Himalayan 411cc", price: "₹1500 – ₹1800" },
          { label: "RE Scram", price: "₹1200 – ₹1500" },
          { label: "Hero Xpulse", price: "₹1000 – ₹1200" },
          { label: "Scooty", price: "₹600 – ₹800" },
        ],
      },
      {
        heading: "Car Rentals Price Per Day",
        rows: [{ label: "Maruti Suzuki Jimny", price: "₹4000 – ₹6000" }],
      },
    ],
    footnote: "Long-term bookings receive discounted rates.",
  },
  requirements: {
    heading: "Security Deposit & Documents Required",
    lead: "To rent a vehicle in Bhuntar, you typically need:",
    items: [
      "Valid Driving License",
      "Govt. ID Proof",
      "Refundable Security Deposit",
      "International travelers require an IDLP.",
    ],
  },
  routes: {
    heading: "Popular Routes from Bhuntar",
    lead: "Bhuntar is the arrival point for some of India's most breathtaking road journeys.",
    details: [
      {
        heading: "Bhuntar to Leh Ladakh Bike Trip",
        body: "The Manali-Leh Highway is a dream route for riders. High mountain passes, river crossings, and endless valleys make it unforgettable.",
        bestFor: ["RE Himalayan 450cc", "RE Himalayan 411cc", "Adventure bikes"],
        note: "Plan fuel stops carefully and ride prepared for altitude changes.",
      },
      {
        heading: "Bhuntar to Spiti Valley Road Trip",
        body: "Spiti offers dramatic landscapes, monasteries, and remote Himalayan villages. 4×4 rentals are highly recommended due to rough terrain.",
        bestFor: ["Maruti Suzuki Jimny", "RE Himalayan 450cc", "4×4 rentals"],
        note: "Carry extra fuel for the Kaza stretch and keep a day spare for weather.",
      },
      {
        heading: "Kasol & Manikaran Day Ride",
        body: "A short, scenic run up the Parvati valley from Bhuntar. Ideal for scooters, beginner riders and families.",
        bestFor: ["Scooty", "Hero Xpulse", "RE Scram"],
        note: "An easy half-day ride from the airport, so it suits your arrival day.",
      },
    ],
  },
  faqs: [
    {
      question: "What documents are required to rent a bike in Bhuntar?",
      answer:
        "A valid driving license and government ID are mandatory. A refundable security deposit is also required.",
    },
    {
      question: "Can I rent a car without driver in Bhuntar?",
      answer:
        "Yes. We provide self drive car rentals for travelers who prefer independent travel.",
    },
    {
      question: "Is helmet included in bike rental?",
      answer:
        "Yes. Helmets are included. Additional riding gear may be available on request.",
    },
    {
      question: "Do you provide backup vehicle for Ladakh trips?",
      answer: "Yes, we can provide backup vehicles.",
    },
  ],
};
