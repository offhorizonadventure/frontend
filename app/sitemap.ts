import type { MetadataRoute } from "next";

import { getAllBlogSlugs } from "@/lib/blog";
import { CITY_CATEGORIES, categoryPath } from "@/lib/city-content";

const SITE_URL = "https://www.bikerentalsbhuntar.com";

/**
 * Sitemap.
 *
 * Blog posts are added the moment they're published, which is the fastest way
 * to get a new post crawled — search engines poll this file rather than
 * rediscovering links. Private routes (cart, checkout, profile) are left out
 * deliberately; they're already noindex.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/vehicles`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/manali`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/bhuntar`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/blog`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.6 },
  ];

  // The per-city category pages: /manali/bike-rental-in-manali and friends.
  const cityCategoryRoutes: MetadataRoute.Sitemap = ["manali", "bhuntar"].flatMap(
    (city) =>
      CITY_CATEGORIES.map((category) => ({
        url: `${SITE_URL}${categoryPath(city, category.key)}`,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }))
  );

  const posts = await getAllBlogSlugs();

  return [
    ...staticRoutes,
    ...cityCategoryRoutes,
    ...posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
