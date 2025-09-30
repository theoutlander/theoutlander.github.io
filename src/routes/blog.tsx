import { createFileRoute } from '@tanstack/react-router';
import { BlogPagePanda } from '../pages/BlogPagePanda';

export const Route = createFileRoute('/blog')({
  component: () => <BlogPagePanda posts={[]} />,
});
