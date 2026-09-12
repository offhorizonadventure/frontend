export type Slide = { src: string; alt: string };

export type Office = {
  /** Matches vehicles.branch in the database, and the admin's branch list.
   *  Changing one means changing all three. */
  key: BranchKey;
  /** Short label used in headings, e.g. "Manali". */
  city: string;
  /** City landing page this office links through to, e.g. "/manali". */
  cityHref: string;
  /** Distinguishes branches within the same city. */
  branch: string;
  tagline: string;
  description: string;
  address: string;
  /** Google Maps directions link, destination-only so it routes from the
   *  visitor's own location rather than a baked-in starting point. */
  directionsUrl: string;
  /** Whether the office appears in the home page grid and the footer.
   *
   *  Bhuntar is false: the business no longer promotes it, but /bhuntar and
   *  its category pages rank and stay published, and it keeps its place in
   *  the header's locations menu. Hiding the pages would throw that ranking
   *  away. */
  listed: boolean;
  slides: Slide[];
};

export type BranchKey =
  | "manali-log-huts"
  | "manali-vashisht"
  | "kullu"
  | "bhuntar";

export const SUPPORT_PHONE = "+91 9623300012";
export const SUPPORT_EMAIL = "info@bikerentalsbhuntar.com";

/** `tel:` needs the number without spaces. */
export const SUPPORT_PHONE_HREF = `tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`;

export const OFFICES: Office[] = [
  {
    key: "manali-log-huts",
    city: "Manali",
    cityHref: "/manali",
    branch: "Log Huts Road",
    tagline: "Head office, minutes from Mall Road",
    description:
      "Our main office on Log Huts Road, near Mall Road. Handy if you are staying around Old Manali or the Mall and want to ride out the same day.",
    address: "Near Mall Road, Log Huts Rd, Manali, Himachal Pradesh 175131",
    directionsUrl: "https://maps.app.goo.gl/XHDkpqHJc1SYZUmN7",
    slides: [
      {
        src: "/images/locations/manali-2.jpg",
        alt: "Wooden cafes and shops lining a street in Old Manali at dusk",
      },
      {
        src: "/images/locations/manali-1.jpg",
        alt: "Snow-covered Himalayan peaks rising above Manali town in Himachal Pradesh",
      },
    ],
    listed: true,
  },
  {
    key: "manali-vashisht",
    city: "Manali",
    cityHref: "/manali",
    branch: "Vashisht",
    tagline: "Beside the hot springs and Vashisht Temple",
    description:
      "Our Vashisht branch, a short ride above Manali. Convenient if you are staying in Vashisht or Old Manali and heading for the Atal Tunnel.",
    address: "Near Vashisht Temple, Manali, Bashisht, Himachal Pradesh 175103",
    directionsUrl: "https://maps.app.goo.gl/SV65f6ee3uU5GRhFA",
    slides: [
      {
        src: "/images/locations/manali-3.jpg",
        alt: "Manali valley town with the snow-capped Pir Panjal range behind it",
      },
      {
        src: "/images/locations/bhuntar-3.jpg",
        alt: "Pine forest and rugged mountain peaks in the Kullu district of Himachal Pradesh",
      },
    ],
    listed: true,
  },
  {
    key: "kullu",
    city: "Kullu",
    cityHref: "/kullu",
    branch: "Akhara",
    tagline: "In Kullu town, close to the bus stand",
    description:
      "Our Kullu branch at Akhara. A good starting point for Kasol, Manikaran, Jalori Pass and Tirthan, and an easy stop on the way up the valley.",
    address: "Akhara, Kullu, Himachal Pradesh 175101",
    directionsUrl: "https://maps.app.goo.gl/BaXYVsdL8hLBtsbi6",
    slides: [
      {
        src: "/images/locations/bhuntar-1.jpg",
        alt: "The Beas river winding through the Kullu valley below snow-capped mountains",
      },
      {
        src: "/images/locations/bhuntar-2.jpg",
        alt: "Aerial view of the Kullu valley settlements surrounded by Himalayan slopes",
      },
    ],
    listed: true,
  },
  {
    key: "bhuntar",
    city: "Bhuntar",
    cityHref: "/bhuntar",
    branch: "Chowk Bhuntar",
    tagline: "Right beside Kullu-Manali Airport",
    description:
      "Land and ride. Collect your vehicle at Hathithan, Chowk Bhuntar, minutes from the airport and the Kullu bus stand.",
    address: "Hathithan, Chowk Bhuntar, Kullu, Himachal Pradesh 175125",
    // TODO: replace with exact coordinates once a Maps link for the Bhuntar
    // branch is available. This resolves by address search, not a pinned spot.
    directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      "BRB Expeditions, Hathithan, Chowk Bhuntar, Kullu, Himachal Pradesh 175125"
    )}`,
    slides: [
      {
        src: "/images/locations/bhuntar-1.jpg",
        alt: "The Beas river winding through the Kullu valley below snow-capped mountains",
      },
      {
        src: "/images/locations/bhuntar-2.jpg",
        alt: "Aerial view of the Kullu valley settlements surrounded by Himalayan slopes",
      },
    ],
    listed: false,
  },
];

/** The offices shown on the home page and in the footer. */
export const LISTED_OFFICES = OFFICES.filter((office) => office.listed);

/** Every branch in a city, in the order they should be presented. */
export function officesForCity(citySlug: string) {
  return OFFICES.filter((office) => office.cityHref === `/${citySlug}`);
}
