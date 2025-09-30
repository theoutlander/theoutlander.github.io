import { createFileRoute } from '@tanstack/react-router';
import { BlogPostPagePanda } from '../pages/BlogPostPagePanda';

export const Route = createFileRoute('/blog/$slug')({
  component: BlogPostPage,
  loader: async ({ params }): Promise<{ post: any }> => {
    try {
      // First try to get the individual post data
      try {
        const response = await fetch(`/data/posts/${params.slug}.json`);
        if (response.ok) {
          const post = await response.json();
          return { post };
        }
      } catch (error) {
        console.warn(
          `Could not load individual post data for ${params.slug}, falling back to general data`
        );
      }

      // Fallback to general hashnode data
      const response = await fetch('/data/hashnode.json');
      const posts = await response.json();
      const post = posts.find((p: any) => p.slug === params.slug);

      if (!post) {
        throw new Error(`Post with slug "${params.slug}" not found`);
      }

      return { post };
    } catch (error) {
      console.error('Failed to load blog post:', error);
      throw error;
    }
  },
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();
  console.log('BlogPostPage: Loaded post:', post?.title);
  return <BlogPostPagePanda post={post} />;
}
