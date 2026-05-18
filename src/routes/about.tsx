import { createFileRoute } from "@tanstack/react-router";
import { AboutPagePanda } from "../pages/AboutPagePanda";
import { getAboutPageData } from "../data/person";

export const Route = createFileRoute("/about")({
	component: AboutPage,
});

function AboutPage() {
	return <AboutPagePanda aboutData={getAboutPageData()} />;
}
