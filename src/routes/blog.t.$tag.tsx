import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import BlogList from "../components/blog/BlogList";

export const Route = createFileRoute("/blog/t/$tag")({
	component: function BlogTagComponent() {
		const { tag } = Route.useParams();
		return <BlogList filterTag={tag} />;
	},
});
