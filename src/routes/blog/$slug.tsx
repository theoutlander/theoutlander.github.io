import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BlogPostPagePanda } from "../../pages/BlogPostPagePanda";
import { loadBlogPost, loadAllBlogPosts, type BlogPost } from "../../lib/content";
import { analytics } from "../../lib/analytics";

export const Route = createFileRoute("/blog/$slug")({
	component: BlogPostPage,
	loader: async ({ params }): Promise<{ post: BlogPost; posts: BlogPost[] }> => {
		try {
			const [post, posts] = await Promise.all([
				loadBlogPost(params.slug),
				loadAllBlogPosts(),
			]);

			if (!post) {
				throw new Error(`Post with slug "${params.slug}" not found`);
			}

			return { post, posts };
		} catch (error) {
			console.error("Failed to load blog post:", error);
			throw error;
		}
	},
});

function estimateReadingTime(text: string) {
	const cleanText = text.replace(/<[^>]*>/g, "");
	const words = cleanText.trim().split(/\s+/).length;
	return Math.max(1, Math.round(words / 200));
}

function BlogPostPage() {
	const { post, posts } = Route.useLoaderData();

	React.useEffect(() => {
		analytics.blogPostView({
			slug: post.slug,
			title: post.title,
			category: post.category,
			tags: post.tags,
			readingTime: estimateReadingTime(
				post.contentHtml || post.html || post.excerpt || ""
			),
		});
	}, [post.slug]);

	return <BlogPostPagePanda post={post} posts={posts} />;
}
