import { createFileRoute } from "@tanstack/react-router";
import BlogList from "../components/blog/BlogList";

export const Route = createFileRoute("/")({
	component: BlogList,
});
