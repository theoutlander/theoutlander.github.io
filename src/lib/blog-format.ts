import type { Post } from "../types/blog";

export function formatBlogDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function estimateReadingTime(text: string) {
  const cleanText = text.replace(/<[^>]*>/g, "");
  const words = cleanText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export function formatReadTime(minutes: number, suffix = true) {
  return suffix ? `${minutes} min read` : `${minutes} min`;
}

export function getPostNumber(posts: Post[], postId: string) {
  const index = posts.findIndex((p) => p.id === postId);
  if (index < 0) return "000";
  return String(index + 1).padStart(3, "0");
}

export function postReadMinutes(post: Post) {
  const html =
    (post as { contentHtml?: string }).contentHtml ||
    (post as { html?: string }).html ||
    "";
  return estimateReadingTime(html || post.excerpt || "");
}

export function postCategoryLabel(post: Post) {
  return post.category ?? post.tags?.[0] ?? "";
}
