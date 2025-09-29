// Comments configuration
export const COMMENTS_CONFIG = {
	// Default comment system to use
	defaultSystem: "hashnode" as const,

	// GitHub repository settings
	githubRepo: "theoutlander/theoutlander.github.io",

	// Giscus configuration
	giscus: {
		repoId: "R_kgDOKQZqJQ",
		category: "General",
		categoryId: "DIC_kwDOKQZqJc4CbQZJ",
		mapping: "pathname",
		strict: "0",
		reactionsEnabled: "1",
		emitMetadata: "0",
		inputPosition: "bottom",
		theme: "light",
		lang: "en",
		loading: "lazy",
	},

	// Utterances configuration
	utterances: {
		theme: "github-light",
		issueTerm: "pathname",
	},

	// URLs
	urls: {
		discussions:
			"https://github.com/theoutlander/theoutlander.github.io/discussions",
		issues: "https://github.com/theoutlander/theoutlander.github.io/issues",
	},
} as const;

export type CommentSystem = keyof typeof COMMENTS_CONFIG extends
	| "defaultSystem"
	| "githubRepo"
	| "giscus"
	| "utterances"
	| "urls"
	? never
	: keyof typeof COMMENTS_CONFIG;
