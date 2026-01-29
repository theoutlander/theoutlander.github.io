import { createFileRoute } from "@tanstack/react-router";
import { BlogPostPagePanda } from "../../pages/BlogPostPagePanda";
import { loadBlogPost, loadAllBlogPosts, type BlogPost } from "../../lib/content";

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

function BlogPostPage() {
	const { post, posts } = Route.useLoaderData();
	return <BlogPostPagePanda post={post} posts={posts} />;
}
