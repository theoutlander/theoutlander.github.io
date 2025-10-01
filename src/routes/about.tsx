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
			<p>I help teams move faster without breaking things.</p>
			<p>I've led engineering at Google, Microsoft, Salesforce, Tableau, IDM (now part of the Gates Foundation), T-Mobile, and startups. I care about clear decisions, strong execution, and code that ships.</p>
			<p>On this blog I write about AI, engineering leadership, and building web products with React, Node.js, and TypeScript. I try to keep it practical so you can use it right away.</p>
			<p>I also run <a href="https://plutonic.consulting" target="_blank" rel="noopener noreferrer">Plutonic Consulting</a>, where I work with founders on fractional CTO support, AI strategy, and scaling teams.</p>
			<p>If you're hiring, wrestling with roadmap and architecture, or want a second set of eyes on your stack, I'm happy to help.</p>
		`,
	};
	return <AboutPagePanda aboutData={aboutData} />;
}
