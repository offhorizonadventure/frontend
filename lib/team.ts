/**
 * Team roster for the About page.
 *
 * Photos live in /public/team. Grouped by role so the grid reads as an org
 * rather than a flat wall of faces.
 */

export type TeamMember = {
  name: string;
  image: string;
};

export type TeamGroup = {
  role: string;
  members: TeamMember[];
};

export const TEAM: TeamGroup[] = [
  {
    role: "Head of the Business",
    members: [{ name: "Krishan Thakur", image: "/team/hod-kt.png" }],
  },
  {
    role: "Business Owner & Operations Head",
    members: [
      { name: "Muskan Thakur", image: "/team/boh-mt.png" },
      { name: "Taniya", image: "/team/ooh-tt.png" },
    ],
  },
  {
    role: "Customer Support & Fleet Executive",
    members: [
      { name: "Rahul Thakur", image: "/team/cst-rt.jpeg" },
      { name: "Aditya Thakur", image: "/team/fet-at.jpg" },
    ],
  },
  {
    role: "BRB Backbone — Technical Team",
    members: [
      { name: "Nikhil Thakur", image: "/team/btt-nt.png" },
      { name: "Rajender Thakur", image: "/team/btt-rt.png" },
      { name: "Hishe Bodh", image: "/team/btt-hb.png" },
    ],
  },
];

/** Reasons to book with us, shown on the About page. */
export const WHY_CHOOSE_US = [
  {
    title: "Trusted Since 2014",
    description:
      "With years of experience, we have earned the trust of travelers by delivering reliable and professional rental services.",
  },
  {
    title: "Wide Range of Vehicles",
    description:
      "We provide self-drive 4×4 cars, bikes, and scooty to suit every type of traveler — from adventure seekers to casual explorers.",
  },
  {
    title: "Smooth & Hassle-Free Experience",
    description:
      "Our team ensures an easy booking process, quick delivery, and full support throughout your journey.",
  },
  {
    title: "Expert & Friendly Team",
    description:
      "Our experienced staff is always ready to assist you and make sure your ride is safe and comfortable.",
  },
  {
    title: "Multiple Service Locations",
    description:
      "We operate in popular destinations including Manali and Bhuntar, so you can start your trip conveniently.",
  },
  {
    title: "Well-Maintained & Safe Vehicles",
    description:
      "All our cars, bikes, and scooty are regularly serviced and thoroughly checked for safety and cleanliness.",
  },
  {
    title: "Customer Satisfaction Comes First",
    description:
      "We focus on providing quality service and memorable travel experiences for every customer.",
  },
  {
    title: "Affordable & Transparent Pricing",
    description:
      "No hidden costs — just honest pricing and great value for your money.",
  },
] as const;
