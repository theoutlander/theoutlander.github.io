import { createFileRoute } from "@tanstack/react-router";
import { BlogPagePanda } from "../pages/BlogPagePanda";

type Post = {
	id?: string;
	slug: string;
	title: string;
	excerpt: string;
	url: string;
	date: string;
	cover: string;
	tags: string[];
};

export const Route = createFileRoute("/blog")({
	component: BlogPage,
	loader: async (): Promise<{ posts: Post[] }> => {
		try {
			const response = await fetch("/data/hashnode.json");
			const posts: Post[] = await response.json();
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
