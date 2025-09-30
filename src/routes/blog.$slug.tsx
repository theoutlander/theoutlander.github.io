import { createFileRoute } from '@tanstack/react-router';
import RoutePost from '../components/blog/RoutePost';

export const Route = createFileRoute('/blog/$slug')({
  component: BlogPostPage,
});

function BlogPostPage() {
  const { slug } = Route.useParams();
  return <RoutePost slug={slug} />;
}
