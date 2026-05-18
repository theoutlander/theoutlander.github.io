import { createFileRoute } from "@tanstack/react-router";
import { AboutPagePanda } from "../pages/AboutPagePanda";

export const Route = createFileRoute("/about")({
	component: AboutPage,
});

function AboutPage() {
	return <AboutPagePanda />;
}
