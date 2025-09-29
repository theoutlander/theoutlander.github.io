// Custom redirects configuration
export interface Redirect {
	source: string;
	destination: string;
	statusCode: number;
}

export const redirects: Redirect[] = [
	// Social Media
	{
		source: "/youtube",
		destination: "https://youtube.com/@nick-karnik",
		statusCode: 308,
	},
	{
		source: "/yt",
		destination: "https://youtube.com/@nick-karnik",
		statusCode: 308,
	},
	{
		source: "/linkedin",
		destination: "https://linkedin.com/in/theoutlander",
		statusCode: 308,
	},
	{
		source: "/li",
		destination: "https://linkedin.com/in/theoutlander",
		statusCode: 308,
	},
	{
		source: "/github",
		destination: "https://github.com/theoutlander",
		statusCode: 308,
	},
	{
		source: "/gh",
		destination: "https://github.com/theoutlander",
		statusCode: 308,
	},
	{
		source: "/twitter",
		destination: "https://twitter.com/theoutlander",
		statusCode: 308,
	},
	{
		source: "/x",
		destination: "https://twitter.com/theoutlander",
		statusCode: 308,
	},
	{
		source: "/stackoverflow",
		destination: "https://stackoverflow.com/users/460472/nick",
		statusCode: 308,
	},
	{
		source: "/so",
		destination: "https://stackoverflow.com/users/460472/nick",
		statusCode: 308,
	},

	// Contact & Business
	{
		source: "/calendar",
		destination: "https://calendly.com/nick-karnik",
		statusCode: 308,
	},
	{
		source: "/email",
		destination: "mailto:nick@karnik.io",
		statusCode: 302,
	},
	{
		source: "/contact",
		destination: "mailto:nick@karnik.io",
		statusCode: 302,
	},
	{
		source: "/consulting",
		destination: "https://plutonic.consulting",
		statusCode: 308,
	},

	// Content & Resources
	{
		source: "/feed",
		destination: "https://nick.karnik.io/rss.xml",
		statusCode: 308,
	},
	{
		source: "/rss",
		destination: "https://nick.karnik.io/rss.xml",
		statusCode: 308,
	},
	// Resume routes now serve actual pages instead of redirecting to PDF
];

// Generate _redirects file content
export function generateRedirectsFile(): string {
	return redirects
		.map(
			(redirect) =>
				`${redirect.source} ${redirect.destination} ${redirect.statusCode}`
		)
		.join("\n");
}
