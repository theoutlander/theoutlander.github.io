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
			<p>I'm an engineering leader with 25+ years of experience building and scaling software at Google, Microsoft, Salesforce, Tableau, and high-growth startups. I've led teams across AI, platform engineering, and developer experience, including leading Gemini Code Assist from inception to adoption by millions of developers.</p>
			<p>I write about engineering leadership, AI strategy, and building high-performance teams. My focus is on clarity, execution, and building products that deliver real impact.</p>
			<p>After a brief personal transition, I'm now focused on full-time engineering leadership roles in AI, platform, and product engineering.</p>
		`,
	};
	return <AboutPagePanda aboutData={aboutData} />;
}
