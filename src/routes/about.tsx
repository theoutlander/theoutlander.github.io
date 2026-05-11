import { createFileRoute } from "@tanstack/react-router";
import { AboutPagePanda } from "../pages/AboutPagePanda";

export const Route = createFileRoute("/about")({
	component: AboutPage,
});

function AboutPage() {
	// Use hardcoded data instead of fetching from JSON
	const aboutData = {
		title: "About",
		html: `
			<p>Twenty-five years of building software. Search engines, disease models, data platforms, AI tools. Not linear, not planned, all of it real.</p>
			<p>At Microsoft I spent six years on Bing search building relevance systems, data pipelines, and ML classifiers. I co-invented a patent on intent detection. At the Institute for Disease Modeling I built software that ended up in a Bill Gates TED Talk. At Tableau I led the data connectivity platform. At Google I led Gemini Code Assist from inception to millions of developers.</p>
			<p>I cook seriously, make cocktails, travel when I can, and build games with my three kids.</p>
			<p>Still figuring out what comes next and building it anyway.</p>
		`,
	};
	return <AboutPagePanda aboutData={aboutData} />;
}
