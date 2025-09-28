import { createFileRoute } from "@tanstack/react-router";
import RoutePost from "../components/blog/RoutePost";

function BlogPostComponent() {
	const { slug } = Route.useParams();
	return <RoutePost slug={slug} />;
}

export const Route = createFileRoute("/blog/$slug")({
	component: BlogPostComponent,
});
