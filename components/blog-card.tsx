import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ImageIcon } from "lucide-react";

import type { BlogListItem } from "@/lib/blog";

export function formatPostDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlogCard({ post }: { post: BlogListItem }) {
  const date = formatPostDate(post.publishedAt);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-md">
      <Link
        href={`/blog/${post.slug}`}
        className="relative aspect-[16/10] overflow-hidden bg-neutral-100"
      >
        {post.coverImageUrl ? (
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            // Straight from Supabase's CDN — routing full-size uploads through
            // Next's optimizer trips its fetch timeout.
            unoptimized
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-neutral-300">
            <ImageIcon className="size-7" aria-hidden="true" />
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        {date && (
          <time
            dateTime={post.publishedAt ?? undefined}
            className="text-xs font-semibold tracking-wide text-brand uppercase"
          >
            {date}
          </time>
        )}

        <h2 className="text-base font-bold text-neutral-950">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors hover:text-brand"
          >
            {post.title}
          </Link>
        </h2>

        {post.excerpt && (
          <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600">
            {post.excerpt}
          </p>
        )}

        <Link
          href={`/blog/${post.slug}`}
          className="mt-auto inline-flex w-fit items-center gap-1.5 pt-2 text-sm font-semibold text-brand transition-colors hover:text-brand-dark"
        >
          Read more
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
