export type Slide = { src: string; alt: string };

export type Office = {
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
  slides: Slide[];
};

export const SUPPORT_PHONE = "+91 9623300012";
export const SUPPORT_EMAIL = "info@bikerentalsbhuntar.com";

/** `tel:` needs the number without spaces. */
export const SUPPORT_PHONE_HREF = `tel:${SUPPORT_PHONE.replace(/\s+/g, "")}`;

/** Builds a directions link to exact coordinates using Google's documented
 *  Maps URL format. */
function directionsTo(lat: number, lng: number) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat}%2C${lng}`;
}

export const OFFICES: Office[] = [
  {
    city: "Manali",
    cityHref: "/manali",
    branch: "Bajhogi Road",
    tagline: "Gateway to Rohtang, Spiti & Leh",
    description:
      "Our Bajhogi Road pickup point, near Hotel Sunlight. Start here for the Atal Tunnel, Spiti Valley and the Leh–Manali highway.",
    address:
      "Near Hotel Sunlight, Bajhogi Rd, Siyal, Manali, Himachal Pradesh 175131",
    directionsUrl: directionsTo(32.2476139, 77.1864351),
    slides: [
      {
        src: "/images/locations/manali-1.jpg",
        alt: "Snow-covered Himalayan peaks rising above Manali town in Himachal Pradesh",
      },
      {
        src: "/images/locations/manali-3.jpg",
        alt: "Manali valley town with the snow-capped Pir Panjal range behind it",
      },
    ],
  },
  {
    city: "Manali",
    cityHref: "/manali",
    branch: "Log Huts Road",
    tagline: "Minutes from Old Manali & Mall Road",
    description:
      "Our Log Huts Road branch in Siyal, handy if you are staying around Old Manali or Mall Road and want to ride out the same day.",
    address:
      "Near Mall Road, Log Huts Rd, Manali, Himachal Pradesh 175131",
    directionsUrl: directionsTo(32.2479383, 77.1872677),
    slides: [
      {
        src: "/images/locations/manali-2.jpg",
        alt: "Wooden cafes and shops lining a street in Old Manali at dusk",
      },
      {
        src: "/images/locations/bhuntar-3.jpg",
        alt: "Pine forest and rugged mountain peaks in the Kullu district of Himachal Pradesh",
      },
    ],
  },
  {
    city: "Bhuntar",
    cityHref: "/bhuntar",
    branch: "Chowk Bhuntar",
    tagline: "Right beside Kullu–Manali Airport",
    description:
      "Land and ride. Collect your vehicle at Hathithan, Chowk Bhuntar, minutes from the airport and the Kullu bus stand.",
    address: "Hathithan, Chowk Bhuntar, Kullu, Himachal Pradesh 175125",
    // TODO: replace with exact coordinates once a Maps link for the Bhuntar
    // branch is available — this resolves by address search, not a pinned spot.
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
  },
];
