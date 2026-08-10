export type Review = {
  name: string;
  badge: string;
  rating: number;
  quote: string;
};

/**
 * Condensed versions of genuine Google reviews for BRB Expeditions. Wording is
 * shortened for the carousel but the substance of each reviewer's comment is
 * preserved — do not embellish or add claims they did not make.
 */
export const REVIEWS: Review[] = [
  {
    name: "Vishal Solanki",
    badge: "Google Review",
    rating: 5,
    quote:
      "The staff were kind, helpful and professional. They explained everything clearly and the rental process was smooth. Both the bikes and the cars are well maintained and clean, and I had no trouble at all during my trip. I would recommend them to anyone.",
  },
  {
    name: "Rahul Pawar",
    badge: "Local Guide",
    rating: 5,
    quote:
      "We rented 5 bikes for 6 days in June. Rahul and his brother were extremely professional and supportive, answering all our queries before, during and after the trip. The bikes were well-maintained and performed flawlessly, even on our ride to Chandratal.",
  },
  {
    name: "Mariona Espona",
    badge: "Google Review",
    rating: 5,
    quote:
      "We rented a Suzuki Jimny for a one-week tour around Manali, Leh and Zanskar Valley and it was amazing. The car was completely new and in perfect condition. Rahul was very nice and helpful, giving us the best tips for a safe journey.",
  },
  {
    name: "Manisha Kataria",
    badge: "Google Review",
    rating: 5,
    quote:
      "Rented a Royal Enfield during my Manali trip and the experience was seamless. The bike was well-maintained and ran smoothly. Paperwork was quick, they explained everything clearly and shared useful tips on local routes and safety. Pricing was transparent with no hidden charges.",
  },
  {
    name: "Bhagavatula Harsha",
    badge: "Google Review",
    rating: 5,
    quote:
      "Amazing experience renting a bike in Manali. The bike was well maintained and the process was smooth and quick. The owner was friendly and professional, and after we returned the bike he even dropped us near our room. Very trustworthy.",
  },
];
