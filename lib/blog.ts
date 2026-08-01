import "server-only";

import { createClient } from "@/utils/supabase/server";

export const BLOG_PAGE_SIZE = 9;

export type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  publishedAt: string | null;
};

export type BlogPost = BlogListItem & {
  content: string;
  updatedAt: string;
};

const LIST_SELECT = "id, title, slug, excerpt, cover_image_url, published_at";

type Row = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover_image_url: string | null;
  published_at: string | null;
};

function toListItem(row: Row): BlogListItem {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    coverImageUrl: row.cover_image_url,
    publishedAt: row.published_at,
  };
}

/**
 * A page of published posts, newest first.
 *
 * Drafts are excluded by RLS as well as by the filter here — an anonymous
 * visitor can only select rows with status 'published', so a draft can't leak
 * even if this query were wrong.
 */
export async function getBlogPage(page: number): Promise<{
  posts: BlogListItem[];
  total: number;
}> {
  const supabase = await createClient();
  const start = (page - 1) * BLOG_PAGE_SIZE;

  const { data, error, count } = await supabase
    .from("blogs")
    .select(LIST_SELECT, { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(start, start + BLOG_PAGE_SIZE - 1);

  if (error) {
    console.error("Failed to load blog posts:", error.message);
    return { posts: [], total: 0 };
  }

  return {
    posts: ((data ?? []) as Row[]).map(toListItem),
    total: count ?? 0,
  };
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blogs")
    .select(`${LIST_SELECT}, content, updated_at`)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) return null;

  const row = data as Row & { content: string; updated_at: string };

  return {
    ...toListItem(row),
    content: row.content,
    updatedAt: row.updated_at,
  };
}

/** Recent posts excluding the one being read, for the "keep reading" strip. */
export async function getRelatedPosts(
  excludeId: string,
  limit = 3
): Promise<BlogListItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("blogs")
    .select(LIST_SELECT)
    .eq("status", "published")
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(limit);

  return ((data ?? []) as Row[]).map(toListItem);
}

/** Every published slug, for the sitemap. */
export async function getAllBlogSlugs(): Promise<
  { slug: string; updatedAt: string }[]
> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("blogs")
    .select("slug, updated_at")
    .eq("status", "published");

  return ((data ?? []) as { slug: string; updated_at: string }[]).map((row) => ({
    slug: row.slug,
    updatedAt: row.updated_at,
  }));
}
