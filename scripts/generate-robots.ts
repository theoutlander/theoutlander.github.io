import { writeFile, mkdir } from "node:fs/promises";

const BASE = process.env.SITE_URL || "https://nick.karnik.io";

async function run() {
	// AI crawlers we explicitly welcome. Usage is permitted with attribution —
	// see /llms.txt for citation guidance. (All content is all-rights-reserved.)
	const aiAgents = [
		// OpenAI
		"GPTBot",
		"ChatGPT-User",
		"OAI-SearchBot",
		// Anthropic
		"ClaudeBot",
		"Claude-Web",
		"Claude-User",
		"Claude-SearchBot",
		"anthropic-ai",
		// Google / Apple
		"Google-Extended",
		"Applebot-Extended",
		// Perplexity
		"PerplexityBot",
		"Perplexity-User",
		// Others
		"CCBot",
		"Amazonbot",
		"Bytespider",
		"Meta-ExternalAgent",
		"cohere-ai",
		"DuckAssistBot",
		"YouBot",
	];

	const aiBlock = aiAgents
		.map((ua) => `User-agent: ${ua}\nAllow: /`)
		.join("\n\n");

	const robotsTxt = `User-agent: *
Allow: /

# AI crawlers and assistants are welcome. Content is © Nick Karnik, all
# rights reserved; reuse with attribution. Citation guidance: ${BASE}/llms.txt
${aiBlock}

# LLM-friendly index
# ${BASE}/llms.txt

# Sitemap
Sitemap: ${BASE}/sitemap.xml
`;

	await mkdir("dist", { recursive: true });
	await writeFile("dist/robots.txt", robotsTxt);
	console.log("robots.txt generated successfully");
}

run().catch((e) => {
	console.error(e);
	process.exit(1);
});
