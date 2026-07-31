import type { Metadata } from "next";

import type { CityContent } from "@/lib/city-content";

/**
 * Metadata for a city landing page.
 *
 * Mirrors the tags the existing WordPress site ranks on, so the titles,
 * descriptions and social cards carry over unchanged when traffic moves here.
 */
export function cityMetadata(content: CityContent): Metadata {
  return {
    title: content.metaTitle,
    description: content.metaDescription,
    alternates: { canonical: `/${content.slug}` },
    robots: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
    openGraph: {
      type: "article",
      locale: "en_US",
      siteName: "BRB Expeditions",
      title: content.metaTitle,
      description: content.metaDescription,
      url: `/${content.slug}`,
      images: [
        {
          url: content.ogImage,
          secureUrl: content.ogImage,
          width: 1024,
          height: 1024,
          alt: content.ogImageAlt,
          type: "image/jpeg",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: content.metaTitle,
      description: content.metaDescription,
      images: [content.ogImage],
    },
  };
}
