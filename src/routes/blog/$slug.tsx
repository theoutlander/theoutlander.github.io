import { createFileRoute } from "@tanstack/react-router";
import { BlogPostPagePanda } from "../../pages/BlogPostPagePanda";
import { loadBlogPost, type BlogPost } from "../../lib/content";

export const Route = createFileRoute("/blog/$slug")({
	component: BlogPostPage,
	loader: async ({ params }): Promise<{ post: BlogPost }> => {
		console.log("Blog loader called with params:", params);
		try {
			const post = await loadBlogPost(params.slug);
			
			if (!post) {
				throw new Error(`Post with slug "${params.slug}" not found`);
			}

			console.log("Blog post loaded:", post.title);
			return { post };
		} catch (error) {
			console.error("Failed to load blog post:", error);
			throw error;
		}
	},
});

function BlogPostPage() {
	const { post } = Route.useLoaderData();
	console.log("BlogPostPage: Loaded post:", post?.title);
	return <BlogPostPagePanda post={post} />;
}
