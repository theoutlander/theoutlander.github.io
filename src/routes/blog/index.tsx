import { createFileRoute } from "@tanstack/react-router";
import { BlogPagePanda } from "../../pages/BlogPagePanda";
import { loadAllBlogPosts, type BlogPost } from "../../lib/content";

export const Route = createFileRoute("/blog/")({
	component: BlogPage,
	loader: async (): Promise<{ posts: BlogPost[] }> => {
		try {
			const posts = await loadAllBlogPosts();
			return { posts };
		} catch (error) {
			console.error("Failed to load blog posts:", error);
			return { posts: [] };
		}
	},
});

function BlogPage() {
	const { posts } = Route.useLoaderData();
	return <BlogPagePanda posts={posts} />;
}
