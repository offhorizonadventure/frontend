import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ChevronRight, Headset } from "lucide-react";

import { BlogCard, formatPostDate } from "@/components/blog-card";
import { getBlogPost, getRelatedPosts } from "@/lib/blog";
import { SUPPORT_PHONE, SUPPORT_PHONE_HREF } from "@/lib/locations";

const SITE_URL = "https://www.bikerentalsbhuntar.com";

export const revalidate = 300;

type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return { title: "Post not found | BRB Expeditions" };
  }

  const description =
    post.excerpt ??
    `${post.title} — travel and riding advice from BRB Expeditions, Manali and Bhuntar.`;

  return {
    title: `${post.title} | BRB Expeditions`,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) notFound();

  const related = await getRelatedPosts(post.id);
  const date = formatPostDate(post.publishedAt);

  // BlogPosting + breadcrumbs give search engines the article's date, author
  // and place in the site, which is what earns a rich result.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt ?? undefined,
      image: post.coverImageUrl ?? undefined,
      datePublished: post.publishedAt ?? undefined,
      dateModified: post.updatedAt,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": `${SITE_URL}/blog/${post.slug}`,
      },
      author: { "@type": "Organization", name: "BRB Expeditions" },
      publisher: { "@type": "Organization", name: "BRB Expeditions" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blog",
          item: `${SITE_URL}/blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: `${SITE_URL}/blog/${post.slug}`,
        },
      ],
    },
  ];

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        {/* Header */}
        <div className="border-b border-neutral-100 bg-neutral-50">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500 sm:text-sm">
                <li>
                  <Link href="/" className="transition-colors hover:text-brand">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="transition-colors hover:text-brand"
                  >
                    Blog
                  </Link>
                </li>
                <li aria-hidden="true">
                  <ChevronRight className="size-3.5" />
                </li>
                <li className="line-clamp-1 font-medium text-neutral-950">
                  {post.title}
                </li>
              </ol>
            </nav>

            {date && (
              <time
                dateTime={post.publishedAt ?? undefined}
                className="mt-4 block text-xs font-semibold tracking-wide text-brand uppercase"
              >
                {date}
              </time>
            )}

            <h1 className="mt-1.5 text-2xl leading-tight font-extrabold tracking-tight text-neutral-950 sm:text-3xl lg:text-4xl">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
                {post.excerpt}
              </p>
            )}
          </div>
        </div>

        {/* Cover */}
        {post.coverImageUrl && (
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                fill
                priority
                sizes="(min-width: 1024px) 896px, 100vw"
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          {/*
            The HTML comes from the Tiptap editor in the admin dashboard, which
            only admins can write to and whose schema drops anything it doesn't
            recognise — script tags, event handlers, inline styles — including
            from pasted content. It is not visitor-submitted.
          */}
          <div
            className="prose prose-neutral max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand prose-a:underline-offset-2 prose-img:rounded-xl sm:prose-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200 pt-6">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              All posts
            </Link>

            <a
              href={SUPPORT_PHONE_HREF}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:border-neutral-950"
            >
              <Headset className="size-4 text-brand" aria-hidden="true" />
              {SUPPORT_PHONE}
            </a>
          </div>
        </div>
      </article>

      {/* Keep reading */}
      {related.length > 0 && (
        <section
          aria-labelledby="related-heading"
          className="border-t border-neutral-100 bg-neutral-50"
        >
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <h2
              id="related-heading"
              className="text-2xl font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-3xl"
            >
              Keep <span className="text-brand">Reading</span>
            </h2>

            <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <BlogCard post={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
