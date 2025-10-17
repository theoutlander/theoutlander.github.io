import { createFileRoute } from '@tanstack/react-router';
import { HomePagePanda } from '../pages/HomePagePanda';
import { loadAllBlogPosts, type BlogPost } from '../lib/content';

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: async (): Promise<{ posts: BlogPost[] }> => {
    try {
      const posts = await loadAllBlogPosts();
      return { posts };
    } catch (error) {
      console.error('Failed to load blog posts:', error);
      return { posts: [] };
    }
  },
});

function HomePage() {
  const { posts } = Route.useLoaderData();
  return <HomePagePanda posts={posts} />;
}
