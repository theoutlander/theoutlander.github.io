import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";

type Post = {
	slug: string;
	title: string;
	date: string | null;
	cover: string | null;
	excerpt: string;
	html: string;
	url: string;
	tags: string[];
};

async function generateStaticPages() {
	console.log("🔄 Generating static pages for blog posts...");

	// Read the hashnode.json to get all posts
	const hashnodeData = JSON.parse(
		readFileSync("public/data/hashnode.json", "utf8")
	) as Post[];

	// Read the base HTML template
	const baseHtml = readFileSync("dist/index.html", "utf8");

	for (const post of hashnodeData) {
		console.log(`📄 Generating static page for: ${post.slug}`);

		// Create the blog post directory
		const blogDir = join("dist", "blog", post.slug);
		mkdirSync(blogDir, { recursive: true });

		// Generate the HTML content for this specific post
		const postHtml = baseHtml.replace(
			'<div id="root"></div>',
			`<div id="root"></div>
			<script>
				// Pre-populate the router with the post data
				window.__INITIAL_POST_DATA__ = ${JSON.stringify(post)};
			</script>`
		);

		// Write the static HTML file
		writeFileSync(join(blogDir, "index.html"), postHtml);
	}

	console.log(`✅ Generated ${hashnodeData.length} static blog post pages`);

	// Generate static about page
	console.log("📄 Generating static page for: about");
	const aboutDir = join("dist", "about");
	mkdirSync(aboutDir, { recursive: true });

	// Read the about page data
	const aboutData = JSON.parse(
		readFileSync("public/data/pages/about.json", "utf8")
	);

	// Generate the HTML content for the about page
	const aboutHtml = baseHtml.replace(
		'<div id="root"></div>',
		`<div id="root"></div>
		<script>
			// Pre-populate the router with the about page data
			window.__INITIAL_ABOUT_DATA__ = ${JSON.stringify(aboutData)};
		</script>`
	);

	// Write the static HTML file
	writeFileSync(join(aboutDir, "index.html"), aboutHtml);
	console.log("✅ Generated static about page");

	// Copy resume PDF to root for /resume.pdf access
	console.log("📄 Copying resume PDF to root...");
	copyFileSync(
		"public/assets/documents/resume-nick-karnik.pdf",
		"dist/resume.pdf"
	);
	// Also copy with SEO-friendly filename
	copyFileSync(
		"public/assets/documents/resume-nick-karnik.pdf",
		"dist/resume-nick-karnik.pdf"
	);
	console.log(
		"✅ Resume PDF copied to /resume.pdf and /resume-nick-karnik.pdf"
	);
}

generateStaticPages().catch(console.error);
