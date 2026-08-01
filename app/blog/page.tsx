import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Newspaper } from "lucide-react";

import { BlogCard } from "@/components/blog-card";
import { Pagination } from "@/components/pagination";
import { BLOG_PAGE_SIZE, getBlogPage } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Travel Blog | Himalayan Road Trips & Riding Tips | BRB Expeditions",
  description:
    "Route guides, riding tips and travel advice for Manali, Spiti, Ladakh and the Kullu valley, from the team that rents the bikes and cars.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "Travel Blog | BRB Expeditions",
    description:
      "Route guides, riding tips and travel advice for the Himalayas, from the team that rents the bikes and cars.",
    url: "/blog",
  },
};

// Posts are published from the dashboard, so revalidate rather than caching
// this page for the lifetime of a deploy.
export const revalidate = 300;

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: rawPage } = await searchParams;
  const parsed = Number(rawPage);
  const page = Number.isFinite(parsed) && parsed > 1 ? Math.floor(parsed) : 1;

  const { posts, total } = await getBlogPage(page);
  const totalPages = Math.max(1, Math.ceil(total / BLOG_PAGE_SIZE));

  function buildHref(nextPage: number) {
    return nextPage > 1 ? `/blog?page=${nextPage}` : "/blog";
  }

  return (
    <main className="flex-1">
      {/* Hero — same washed background treatment as the vehicles page */}
      <section className="relative overflow-hidden border-b border-neutral-100">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-bg.jpg"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/90" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1.5 text-xs text-neutral-500 sm:text-sm">
              <li>
                <Link href="/" className="transition-colors hover:text-brand">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3.5" />
              </li>
              <li className="font-medium text-neutral-950">Blog</li>
            </ol>
          </nav>

          <span className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand uppercase">
            <Newspaper className="size-3.5" aria-hidden="true" />
            From The Road
          </span>

          <h1 className="mt-2 text-2xl leading-tight font-extrabold tracking-tight text-neutral-950 uppercase italic sm:text-3xl lg:text-4xl">
            Travel <span className="text-brand">Blog</span>
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-neutral-600">
            Route guides, riding tips and honest advice for the Himalayas —
            written by the people who maintain the fleet.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-10 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-white text-neutral-400">
              <Newspaper className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-4 text-base font-semibold text-neutral-950">
              No posts yet
            </p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
              We&apos;re writing up our favourite routes. Check back soon.
            </p>
            <Link
              href="/vehicles"
              className="mt-6 inline-flex items-center rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              Explore Vehicles
            </Link>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <BlogCard post={post} />
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  buildHref={buildHref}
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
