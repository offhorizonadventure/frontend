import type { MetadataRoute } from "next";

const SITE_URL = "https://www.bikerentalsbhuntar.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Personal and transactional routes. They already send noindex headers;
      // this stops crawl budget being spent reaching them at all.
      disallow: [
        "/api/",
        "/cart",
        "/checkout",
        "/profile",
        "/my-bookings",
        "/login",
        "/complete-profile",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
