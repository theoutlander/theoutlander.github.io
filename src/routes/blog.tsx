import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import BlogList from "../components/blog/BlogList";

export const Route = createFileRoute("/blog")({
	component: () => {
		const location = useLocation();
		// Only show blog list if we're exactly at /blog
		if (location.pathname === "/blog") {
			return <BlogList />;
		}
		// Otherwise, render the outlet for child routes
		return <Outlet />;
	},
});
