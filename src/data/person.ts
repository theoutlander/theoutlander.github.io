// Single source of truth for personal identity and bio content.
// Import from here instead of hardcoding strings across pages and components.

export const PERSON = {
	name: "Nick Karnik",
	email: "nick@karnik.io",
	location: "Seattle, WA",
	siteUrl: "https://nick.karnik.io",
	estYear: 1981,
	tagline: "Engineering · Writing · Cooking",
	profileImage: "/assets/images/profile/nick-karnik.jpeg",
} as const;

// The main lede shown in the hero on the home page and SSR hero component.
export const HERO_LEDE =
	"Nearly three decades of building software across search engines, disease models, data platforms, and AI tools. Serious about cooking, cocktails, travel, and building games with my three kids. Still figuring out what comes next and building it anyway.";

// HTML content for the About page bio section.
export const ABOUT_HTML = `
	<p>Nearly three decades of building software. Search engines, disease models, data platforms, AI tools. Not linear, not planned, all of it real.</p>
	<p>At Microsoft I spent six years on Bing search building relevance systems, data pipelines, and ML classifiers. I co-invented a patent on intent detection. At the Institute for Disease Modeling I built software that ended up in a Bill Gates TED Talk. At Tableau I led the data connectivity platform. At Google I led Gemini Code Assist from inception to millions of developers.</p>
	<p>I cook seriously, make cocktails, travel when I can, and build games with my three kids.</p>
	<p>Still figuring out what comes next and building it anyway.</p>
`;

// Short prose intro used in the About page sidebar.
export const ABOUT_SHORT =
	"I'm Nick Karnik. Lead Software Engineer at PitchBook. Previously Google, Microsoft, Tableau, Salesforce. Nearly three decades building software.";

// Per-page meta title and description used in both Helmet and SSR renderer.
export const META = {
	home: {
		title: "Nick Karnik",
		description:
			"Nearly three decades building software across search, AI, and developer tools. Engineering leader, writer, cook, dad of three.",
	},
	about: {
		title: "Nick Karnik | About",
		description:
			"Engineering leader. Writer. Nearly three decades building software across search, AI, and data.",
	},
	resume: {
		title: "Nick Karnik | Résumé",
		description:
			"Software engineer and engineering leader. Nearly three decades across Google (Gemini Code Assist), Microsoft (Bing), Tableau, Salesforce, and earlier startups.",
	},
	blog: {
		title: "Nick Karnik | Blog",
		description:
			"Writing about AI, search, developer tools, and what I learn building software.",
	},
} as const;
