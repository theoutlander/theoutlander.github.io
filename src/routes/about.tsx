import { createFileRoute } from "@tanstack/react-router";
import { AboutPagePanda } from "../pages/AboutPagePanda";
import { ABOUT_HTML } from "../data/person";

export const Route = createFileRoute("/about")({
	component: AboutPage,
});

function AboutPage() {
	const aboutData = { title: "About", html: ABOUT_HTML };
	return <AboutPagePanda aboutData={aboutData} />;
}
