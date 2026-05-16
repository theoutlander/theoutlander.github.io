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

// Canonical social profile URLs. Update here and everywhere reflects automatically.
export const SOCIAL_LINKS = {
	github: "https://github.com/theoutlander",
	linkedin: "https://linkedin.com/in/theoutlander",
	youtube: "https://youtube.com/@nick-karnik",
	codementor: "https://www.codementor.io/@theoutlander",
	twitter: "https://x.com/theoutlander",
	stackoverflow: "https://stackoverflow.com/users/460472/nick",
} as const;

// Current status shown in the About page sidebar. Update when role changes.
export const CURRENTLY = {
	label: "Currently · May 2026",
	description:
		"Lead Software Engineer at PitchBook. Writing about engineering and what I'm learning. Cooking, baking, and experimenting in the kitchen.",
} as const;

// The main lede shown in the hero on the home page and SSR hero component.
export const HERO_LEDE =
	"Nearly three decades of building software across search engines, disease models, data platforms, and AI tools. Serious about cooking, cocktails, travel, and building games with my three kids. Still figuring out what comes next and building it anyway.";

// Advisory/consulting blurb used in Home and About pages.
export const ADVISORY_BLURB =
	"Advisory work runs through Plutonic Consulting — strategy, team review, and technical due diligence. Limited slots each quarter.";

// Stats strip on the home page.
export const STATS = [
	{ n: "27+", l: "Years building software" },
	{ n: "10+", l: "Years leading engineers" },
	{ n: "100+", l: "Engineers hired or grown" },
	{ n: "10+", l: "Products shipped" },
] as const;

// Work blocks on the home page.
export const WORK_BLOCKS = [
	{ t: "AI and Developer Tools", d: "Built Gemini Code Assist at Google. Writing about what I learned building it." },
	{ t: "Search and Relevance", d: "Six years on Bing search at Microsoft. A patent. A lot of labeled data." },
	{ t: "Making Things", d: "Currently building new tools. Making games with my three kids. Always something cooking." },
	{ t: "Engineering Leadership", d: "Led Gemini Code Assist at Google — three years, VS Code and IntelliJ. Senior EM at Tableau and Salesforce. Twice a startup CTO. Now leading a product team at PitchBook." },
] as const;

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

// Fallback prose sections used in About page when aboutData.html is not set.
export const ABOUT_SITE_DESCRIPTION =
	"This site is where I write down what I'm learning. The essays mostly cover engineering, leadership, and the practice of shipping software. The résumé is here too, formatted to read rather than scan. Recipes live in The Kitchen — a side project I treat with the same rigor as my day job.";

export const ABOUT_WORK_DESCRIPTION =
	"Developer tooling, data platforms, and software at scale.";

export const ABOUT_OUTSIDE_WORK =
	"Cooking, mostly. I keep a versioned recipe log because I think the discipline of writing things down applies as well to dinner as it does to software.";

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
	kitchen: {
		title: "Nick Karnik | The Kitchen",
		description:
			"Recipes for cooking, baking, and cocktails. Versioned, with notes on what changed between iterations.",
	},
	calendar: {
		title: "Schedule time with Nick Karnik",
		description:
			"Book time with Nick directly via Google Calendar appointments.",
	},
	reviews: {
		title: "Nick Karnik | Reviews",
		description: "Reviews from people I have mentored and worked with.",
	},
} as const;
