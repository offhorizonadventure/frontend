import type { MetadataRoute } from "next";

const SITE_URL = "https://www.bikerentalsbhuntar.com";

/**
 * Crawl rules.
 *
 * Everything public is open to every crawler. Googlebot and Bingbot are also
 * named explicitly so the intent is unambiguous in Search Console and
 * Webmaster Tools — a wildcard rule alone sometimes reads as ambiguous when
 * people audit a site.
 *
 * The disallow list is only personal and transactional routes. They carry
 * noindex headers anyway; keeping crawlers out of them means budget is spent
 * on pages that can actually rank.
 */
const PRIVATE_PATHS = [
  "/api/",
  "/cart",
  "/checkout",
  "/profile",
  "/my-bookings",
  "/login",
  "/complete-profile",
  "/forgot-password",
  "/reset-password",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "Googlebot", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "Bingbot", allow: "/", disallow: PRIVATE_PATHS },
      { userAgent: "*", allow: "/", disallow: PRIVATE_PATHS },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
