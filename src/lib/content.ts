import { BlogPost } from "../types/blog";

const ALL_POSTS_INLINE_ID = "__ALL_POSTS__";
const SINGLE_POST_INLINE_ID = "__POST_DATA__";

let cachedAllPosts: BlogPost[] | null = null;
const cachedPostsBySlug: Record<string, BlogPost | null> = {};

function readInlineJson<T>(id: string): T | null {
	if (typeof document === "undefined") return null;

	const el = document.getElementById(id);
	if (!el?.textContent) return null;

	try {
		return JSON.parse(el.textContent) as T;
	} catch (error) {
		console.error(`Failed to parse inline data from ${id}:`, error);
		return null;
	}
}

function normalizePost(raw: any, slug: string): BlogPost {
	return {
		id: raw.id,
		slug,
		title: raw.title,
		excerpt: raw.excerpt,
		url: raw.url ?? `/blog/${slug}`,
		date: raw.date,
		cover: raw.cover,
		tags: raw.tags,
		contentMarkdown: raw.contentMarkdown ?? "",
		contentHtml: raw.contentHtml ?? raw.html ?? "",
	};
}

function getInlineAllPosts(): BlogPost[] | null {
	if (cachedAllPosts) return cachedAllPosts;
	const inline = readInlineJson<BlogPost[]>(ALL_POSTS_INLINE_ID);
	if (!inline) return null;
	cachedAllPosts = inline.map((post) => normalizePost(post, post.slug));
	for (const post of cachedAllPosts) {
		cachedPostsBySlug[post.slug] = post;
	}
	return cachedAllPosts;
}

function getInlinePost(slug: string): BlogPost | null {
	if (cachedPostsBySlug[slug]) {
		return cachedPostsBySlug[slug];
	}

	const inlinePost = readInlineJson<BlogPost>(SINGLE_POST_INLINE_ID);
	if (inlinePost && (inlinePost as any).slug === slug) {
		const normalized = normalizePost(inlinePost, slug);
		cachedPostsBySlug[slug] = normalized;
		return normalized;
	}

	const all = cachedAllPosts || getInlineAllPosts();
	if (all) {
		const found = all.find((p) => p.slug === slug);
		if (found) {
			cachedPostsBySlug[slug] = found;
			return found;
		}
	}

	return null;
}

// Client-side functions that fetch from the generated JSON files
export async function loadAllBlogPosts(): Promise<BlogPost[]> {
	try {
		const inline = getInlineAllPosts();
		if (inline) return inline;

		const response = await fetch("/data/blog-posts.json");
		if (!response.ok) {
			throw new Error("Failed to fetch blog posts");
		}
		const posts = (await response.json()) as BlogPost[];
		cachedAllPosts = posts.map((post) => normalizePost(post, post.slug));
		for (const post of cachedAllPosts) {
			cachedPostsBySlug[post.slug] = post;
		}
		return cachedAllPosts;
	} catch (error) {
		console.error("Failed to load blog posts:", error);
		return [];
	}
}

export async function loadBlogPost(slug: string): Promise<BlogPost | null> {
	try {
		const inlinePost = getInlinePost(slug);
		if (inlinePost) return inlinePost;

		const response = await fetch(`/data/posts/${slug}.json`);
		if (!response.ok) {
			return null;
		}
		const post = await response.json();
		const normalized = normalizePost(post, slug);
		cachedPostsBySlug[slug] = normalized;
		return normalized;
	} catch (error) {
		console.error("Failed to load blog post:", error);
		return null;
	}
}

export function getBlogPostSlugs(): string[] {
	// This would need to be implemented differently for client-side
	// For now, return empty array as it's mainly used server-side
	return [];
}