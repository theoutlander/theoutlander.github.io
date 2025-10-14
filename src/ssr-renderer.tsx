import React from "react";
import { renderToString } from "react-dom/server";
import {
	readFileSync,
	writeFileSync,
	mkdirSync,
	copyFileSync,
	readdirSync,
	statSync,
} from "node:fs";
import { join } from "node:path";
import { capitalizeFirstLetter } from "./utils/stringUtils";

// Import our Panda CSS page components
import { HomePagePanda } from "./pages/HomePagePanda";
import { BlogPagePanda } from "./pages/BlogPagePanda";
import { AboutPagePanda } from "./pages/AboutPagePanda";
import { ResumePagePanda } from "./pages/ResumePagePanda";
import { BlogPostPagePanda } from "./pages/BlogPostPagePanda";
import { NotFoundPagePanda } from "./pages/NotFoundPagePanda";

type Post = {
	id?: string;
	slug: string;
	title: string;
	excerpt: string;
	url: string;
	date: string;
	cover: string;
	tags: string[];
};

type AboutData = {
	title: string;
	html: string;
};

// Recursively copy directory contents, skipping system files
const copyDirectory = (src: string, dest: string) => {
	const items = readdirSync(src);

	for (const item of items) {
		// Skip system files and hidden files
		if (item.startsWith(".") || item === "Thumbs.db") {
			continue;
		}

		const srcPath = join(src, item);
		const destPath = join(dest, item);
		const stat = statSync(srcPath);

		if (stat.isDirectory()) {
			mkdirSync(destPath, { recursive: true });
			copyDirectory(srcPath, destPath);
		} else {
			try {
				copyFileSync(srcPath, destPath);
			} catch (error) {
				console.warn(
					`⚠️  Could not copy ${srcPath}:`,
					error instanceof Error ? error.message : String(error)
				);
			}
		}
	}
};

// Generate comprehensive CSS by rendering all pages and collecting all styles
const generateComprehensiveCSS = async (
	hashnodeData: Post[],
	aboutData: AboutData
) => {
	console.log("🎨 Generating comprehensive CSS...");

	// Render all pages to collect all CSS
	const pages: Array<{
		name: string;
		component: any;
		props: any;
	}> = [
		{ name: "home", component: HomePagePanda, props: { posts: hashnodeData } },
		{ name: "blog", component: BlogPagePanda, props: { posts: hashnodeData } },
		{ name: "about", component: AboutPagePanda, props: { aboutData } },
		{ name: "resume", component: ResumePagePanda, props: {} },
	];

	// Add blog post pages
	for (const post of hashnodeData) {
		const postDataPath = join("public", "data", "posts", `${post.slug}.json`);
		let fullPostData;
		try {
			fullPostData = JSON.parse(readFileSync(postDataPath, "utf8"));
		} catch {
			fullPostData = post;
		}
		pages.push({
			name: `post-${post.slug}`,
			component: BlogPostPagePanda as any,
			props: { post: fullPostData },
		});
	}

	// Collect all CSS from all pages
	const allCSS = new Set<string>();

	for (const page of pages) {
		console.log(`  📄 Collecting CSS from ${page.name}...`);
		const result = renderPageToHTML(page.component, page.props);
		const html = generateBaseHTML("Test", "Test", result.html, "");

		// Extract CSS from this page
		const styleRegex = /<style[^>]*>(.*?)<\/style>/gs;
		const matches = html.match(styleRegex);

		if (matches) {
			console.log(`    Found ${matches.length} style blocks`);
			matches.forEach((match) => {
				const css = match.replace(/<style[^>]*>/, "").replace(/<\/style>/, "");
				allCSS.add(css);
			});
		} else {
			console.log(`    No style blocks found`);
		}
	}

	// Combine all unique CSS
	const combinedCSS = Array.from(allCSS).join("\n\n");

	// Write to dist
	writeFileSync("dist/styles.css", combinedCSS);

	console.log(
		`✅ Generated comprehensive CSS file (${combinedCSS.length} characters)`
	);
};

// Remove inline styles from HTML and return clean HTML
const removeInlineStyles = (html: string) => {
	return html.replace(/<style[^>]*>.*?<\/style>/gs, "");
};

// Generate the base HTML template
const generateBaseHTML = (
	title: string,
	description: string,
	content: string,
	additionalHead?: string,
	canonicalUrl?: string,
	ogImage?: string,
	ogType?: string,
	articleData?: {
		publishedTime?: string;
		modifiedTime?: string;
		author?: string;
		section?: string;
		tags?: string[];
	}
) => {
	const siteUrl = "https://nick.karnik.io";
	const defaultOgImage = `${siteUrl}/assets/images/profile/nick-karnik.jpeg`;
	const finalOgImage = ogImage || defaultOgImage;
	const finalOgType = ogType || "website";
	const finalCanonicalUrl = canonicalUrl || siteUrl;

	return `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta
			name="viewport"
			content="width=device-width, initial-scale=1.0"
		/>
		<meta
			http-equiv="Content-Security-Policy"
			content="upgrade-insecure-requests"
		/>

		<!-- Preload critical fonts -->
		<link
			rel="preconnect"
			href="https://fonts.googleapis.com"
		/>
		<link
			rel="preconnect"
			href="https://fonts.gstatic.com"
			crossorigin
		/>
		<link
			rel="preload"
			href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
			as="style"
			onload="this.onload=null;this.rel='stylesheet'"
		/>
		<noscript
			><link
				rel="stylesheet"
				href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
		/></noscript>

		<!-- SEO Meta Tags -->
		<title>${title}</title>
		<meta name="description" content="${description}" />
		<link rel="canonical" href="${finalCanonicalUrl}" />

		<!-- Open Graph Meta Tags -->
		<meta property="og:title" content="${title}" />
		<meta property="og:description" content="${description}" />
		<meta property="og:type" content="${finalOgType}" />
		<meta property="og:url" content="${finalCanonicalUrl}" />
		<meta property="og:image" content="${finalOgImage}" />
		<meta property="og:image:alt" content="${title}" />
		<meta property="og:site_name" content="Nick Karnik" />
		<meta property="og:locale" content="en_US" />

		<!-- Twitter Card Meta Tags -->
		<meta name="twitter:card" content="summary_large_image" />
		<meta name="twitter:site" content="@theoutlander" />
		<meta name="twitter:creator" content="@theoutlander" />
		<meta name="twitter:title" content="${title}" />
		<meta name="twitter:description" content="${description}" />
		<meta name="twitter:image" content="${finalOgImage}" />
		<meta name="twitter:image:alt" content="${title}" />

		<!-- Additional SEO Meta Tags -->
		<meta name="robots" content="index, follow" />
		<meta name="author" content="Nick Karnik" />
		<meta name="theme-color" content="#ffffff" />
		${
			articleData
				? `
		<!-- Article-specific meta tags -->
		${
			articleData.publishedTime
				? `<meta property="article:published_time" content="${articleData.publishedTime}" />`
				: ""
		}
		${
			articleData.modifiedTime
				? `<meta property="article:modified_time" content="${articleData.modifiedTime}" />`
				: ""
		}
		${
			articleData.author
				? `<meta property="article:author" content="${articleData.author}" />`
				: ""
		}
		${
			articleData.section
				? `<meta property="article:section" content="${articleData.section}" />`
				: ""
		}
		${
			articleData.tags
				? articleData.tags
						.map(
							(tag) =>
								`<meta property="article:tag" content="${capitalizeFirstLetter(
									tag
								)}" />`
						)
						.join("\n\t\t")
				: ""
		}
		`
				: ""
		}

		<!-- RSS Feed -->
		<link
			rel="alternate"
			type="application/rss+xml"
			title="RSS"
			href="${siteUrl}/rss"
		/>

		<!-- Favicon -->
		<link rel="icon" type="image/svg+xml" href="/vite.svg" />

		<!-- Google Analytics -->
		<script
			async
			src="https://www.googletagmanager.com/gtag/js?id=G-62FC7BDSGJ"
		></script>
		<script>
			window.dataLayer = window.dataLayer || [];
			function gtag() {
				dataLayer.push(arguments);
			}
			gtag("js", new Date());
			gtag("config", "G-62FC7BDSGJ");
		</script>

		${additionalHead || ""}

		<!-- External CSS -->
		<link rel="stylesheet" href="/styles.css" />
	</head>
	<body>
		<div id="root">
			${content}
		</div>
		
		<!-- Dark mode detection script - DISABLED for mobile compatibility -->
		<!-- <script>
			// Check for saved theme preference or default to 'light'
			const theme = localStorage.getItem('theme') || 
				(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
			
			// Apply theme immediately to prevent flash
			if (theme === 'dark') {
				document.documentElement.classList.add('dark');
			}
			
			// Listen for system theme changes
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
				if (!localStorage.getItem('theme')) {
					if (e.matches) {
						document.documentElement.classList.add('dark');
					} else {
						document.documentElement.classList.remove('dark');
					}
				}
			});
		</script> -->
	</body>
</html>`;
};

// SSR wrapper component
// Render a page component to HTML string
const renderPageToHTML = (
	PageComponent: React.ComponentType<any>,
	props: any
) => {
	const element = React.createElement(PageComponent, props);
	const html = renderToString(element);

	return {
		html,
		helmet: {
			title: "",
			meta: "",
			link: "",
		},
	};
};

// Main function to render all static pages using SSR
export async function renderAllStaticPagesSSR() {
	console.log("🔄 Rendering all static pages with SSR...");

	// Create dist directory if it doesn't exist
	mkdirSync("dist", { recursive: true });

	// Read the hashnode data
	const hashnodeData = JSON.parse(
		readFileSync("public/data/hashnode.json", "utf8")
	) as Post[];

	// Read the about page data
	const aboutData = JSON.parse(
		readFileSync("public/data/pages/about.json", "utf8")
	) as AboutData;

	// Copy Panda CSS to dist folder
	console.log("📋 Copying Panda CSS to dist folder...");
	try {
		const pandaCSS = readFileSync("styled-system/styles.css", "utf8");
		writeFileSync("dist/styles.css", pandaCSS);
		console.log("✅ Panda CSS copied to dist/styles.css");
	} catch (error) {
		console.warn(
			"⚠️  Could not copy Panda CSS, generating comprehensive CSS instead..."
		);
		await generateComprehensiveCSS(hashnodeData, aboutData);
	}

	// Copy assets from public to dist
	console.log("📁 Copying assets from public to dist...");
	try {
		copyDirectory("public/assets", "dist/assets");
		console.log("✅ Assets copied to dist/assets");
	} catch (error) {
		console.warn("⚠️  Could not copy assets:", error);
	}

	// Copy other static files from public to dist
	console.log("📁 Copying static files from public to dist...");
	const staticFiles = ["robots.txt", "sitemap.xml", "vite.svg", "404.html"];
	for (const file of staticFiles) {
		try {
			copyFileSync(`public/${file}`, `dist/${file}`);
		} catch (error) {
			console.warn(
				`⚠️  Could not copy ${file}:`,
				error instanceof Error ? error.message : String(error)
			);
		}
	}
	console.log("✅ Static files copied to dist");

	// Render home page
	console.log("📄 Rendering home page with SSR...");
	const homeResult = renderPageToHTML(HomePagePanda, { posts: hashnodeData });
	const homeHTMLWithStyles = generateBaseHTML(
		"Nick Karnik | Engineering Leader & Software Engineer",
		"Engineering leader with 25+ years building software across Google, Microsoft, and startups. Helping teams ship reliable systems with clarity, speed, and modern tools.",
		homeResult.html,
		homeResult.helmet.title + homeResult.helmet.meta + homeResult.helmet.link,
		"https://nick.karnik.io",
		"https://nick.karnik.io/assets/images/profile/nick-karnik.jpeg",
		"website"
	);
	const homeHTML = removeInlineStyles(homeHTMLWithStyles);
	writeFileSync("dist/index.html", homeHTML);

	// Render blog index page
	console.log("📄 Rendering blog index page with SSR...");
	const blogDir = join("dist", "blog");
	mkdirSync(blogDir, { recursive: true });
	const blogResult = renderPageToHTML(BlogPagePanda, { posts: hashnodeData });
	const blogHTMLWithStyles = generateBaseHTML(
		"Nick Karnik Blog | Engineering, Leadership & AI",
		"Practical essays and reflections on software engineering, leadership, and AI. Lessons from shipping products at scale and helping teams move faster.",
		blogResult.html,
		blogResult.helmet.title + blogResult.helmet.meta + blogResult.helmet.link,
		"https://nick.karnik.io/blog",
		"https://nick.karnik.io/assets/images/profile/nick-karnik.jpeg",
		"website"
	);
	const blogHTML = removeInlineStyles(blogHTMLWithStyles);
	writeFileSync(join(blogDir, "index.html"), blogHTML);

	// Render blogs index page (plural)
	console.log("📄 Rendering blogs index page with SSR...");
	const blogsDir = join("dist", "blogs");
	mkdirSync(blogsDir, { recursive: true });
	const blogsResult = renderPageToHTML(BlogPagePanda, { posts: hashnodeData });
	const blogsHTMLWithStyles = generateBaseHTML(
		"Nick Karnik Blogs | Engineering, Leadership & AI",
		"Practical essays and reflections on software engineering, leadership, and AI. Lessons from shipping products at scale and helping teams move faster.",
		blogsResult.html,
		blogsResult.helmet.title +
			blogsResult.helmet.meta +
			blogsResult.helmet.link,
		"https://nick.karnik.io/blogs",
		"https://nick.karnik.io/assets/images/profile/nick-karnik.jpeg",
		"website"
	);
	const blogsHTML = removeInlineStyles(blogsHTMLWithStyles);
	writeFileSync(join(blogsDir, "index.html"), blogsHTML);

	// Render about page
	console.log("📄 Rendering about page with SSR...");
	const aboutDir = join("dist", "about");
	mkdirSync(aboutDir, { recursive: true });
	const aboutResult = renderPageToHTML(AboutPagePanda, { aboutData });
	const aboutHTMLWithStyles = generateBaseHTML(
		"About Nick Karnik | Engineering Leader & Advisor",
		"Nick Karnik is a software engineer and leader with decades of experience across Big Tech and startups. Advisor to founders on AI, developer experience, and reliable systems.",
		aboutResult.html,
		aboutResult.helmet.title +
			aboutResult.helmet.meta +
			aboutResult.helmet.link,
		"https://nick.karnik.io/about",
		"https://nick.karnik.io/assets/images/profile/nick-karnik.jpeg",
		"profile"
	);
	const aboutHTML = removeInlineStyles(aboutHTMLWithStyles);
	writeFileSync(join(aboutDir, "index.html"), aboutHTML);

	// Render resume page
	console.log("📄 Rendering resume page with SSR...");
	const resumeDir = join("dist", "resume");
	mkdirSync(resumeDir, { recursive: true });
	const resumeResult = renderPageToHTML(ResumePagePanda, {});
	const resumeHTMLWithStyles = generateBaseHTML(
		"Nick Karnik Resume | Engineering Leadership & Expertise",
		"Explore Nick Karnik's professional background: 10+ years leading teams, 25+ years building software, and a track record of delivering reliable, scalable systems.",
		resumeResult.html,
		resumeResult.helmet.title +
			resumeResult.helmet.meta +
			resumeResult.helmet.link,
		"https://nick.karnik.io/resume",
		"https://nick.karnik.io/assets/images/profile/nick-karnik.jpeg",
		"profile"
	);
	const resumeHTML = removeInlineStyles(resumeHTMLWithStyles);
	writeFileSync(join(resumeDir, "index.html"), resumeHTML);

	// Render individual blog post pages
	console.log("📄 Rendering individual blog post pages with SSR...");
	for (const post of hashnodeData) {
		const postDir = join("dist", "blog", post.slug);
		mkdirSync(postDir, { recursive: true });

		// Read the full post data from the individual JSON file
		const postDataPath = join("public", "data", "posts", `${post.slug}.json`);
		let fullPostData;
		try {
			fullPostData = JSON.parse(readFileSync(postDataPath, "utf8"));
		} catch (error) {
			console.warn(
				`⚠️  Could not read post data for ${post.slug}, using basic data`
			);
			fullPostData = post;
		}

		const postResult = renderPageToHTML(BlogPostPagePanda, {
			post: fullPostData,
		});

		// Use post cover image if available, otherwise use profile image
		const postOgImage =
			post.cover ||
			"https://nick.karnik.io/assets/images/profile/nick-karnik.jpeg";
		const postDescription =
			post.excerpt ||
			`Read ${post.title} on Nick Karnik's blog about engineering, AI, and technology.`;

		// Prepare article-specific data
		const articleData = {
			publishedTime: post.date ? new Date(post.date).toISOString() : undefined,
			modifiedTime: post.date ? new Date(post.date).toISOString() : undefined,
			author: "Nick Karnik",
			section: "Technology",
			tags: post.tags || ["engineering", "technology", "software development"],
		};

		const postHTMLWithStyles = generateBaseHTML(
			`${post.title} - Nick Karnik`,
			postDescription,
			postResult.html,
			postResult.helmet.title + postResult.helmet.meta + postResult.helmet.link,
			`https://nick.karnik.io/blog/${post.slug}`,
			postOgImage,
			"article",
			articleData
		);
		const postHTML = removeInlineStyles(postHTMLWithStyles);
		writeFileSync(join(postDir, "index.html"), postHTML);
	}

	// Render 404 page
	console.log("📄 Rendering 404 page with SSR...");
	const notFoundResult = renderPageToHTML(NotFoundPagePanda, {});
	const notFoundHTMLWithStyles = generateBaseHTML(
		"404 - Page Not Found - Nick Karnik",
		"The page you're looking for doesn't exist. Return to the homepage or explore the blog.",
		notFoundResult.html,
		notFoundResult.helmet.title +
			notFoundResult.helmet.meta +
			notFoundResult.helmet.link,
		"https://nick.karnik.io/404",
		"https://nick.karnik.io/assets/images/profile/nick-karnik.jpeg",
		"website"
	);
	const notFoundHTML = removeInlineStyles(notFoundHTMLWithStyles);
	writeFileSync("dist/404.html", notFoundHTML);

	// Generate RSS feed
	console.log("📄 Generating RSS feed...");
	const rssDir = join("dist", "rss");
	mkdirSync(rssDir, { recursive: true });

	const rssXml = generateRssXml(hashnodeData);
	writeFileSync(join(rssDir, "index.html"), rssXml);
	console.log("✅ Generated RSS feed");

	console.log("✅ All static pages rendered successfully with SSR!");
}

function generateRssXml(posts: Post[]) {
	const siteUrl = "https://nick.karnik.io";
	const blogUrl = `${siteUrl}/blog`;
	const feedUrl = `${siteUrl}/rss`;

	const rssItems = posts
		.slice(0, 20) // Limit to 20 most recent posts
		.map((post) => {
			const postUrl = `${blogUrl}/${post.slug}`;
			const pubDate = post.date
				? new Date(post.date).toUTCString()
				: new Date().toUTCString();

			return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt || ""}]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      ${post.cover ? `<enclosure url="${post.cover}" type="image/jpeg" />` : ""}
      ${
				post.tags
					?.map((tag) => `<category>${capitalizeFirstLetter(tag)}</category>`)
					.join("") || ""
			}
    </item>`;
		})
		.join("");

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nick Karnik - The Outlander</title>
    <description>Engineering insights, AI tools, and technical writing from Nick Karnik</description>
    <link>${blogUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <language>en-US</language>
    <managingEditor>nick@karnik.io (Nick Karnik)</managingEditor>
    <webMaster>nick@karnik.io (Nick Karnik)</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Custom RSS Generator</generator>
    <image>
      <url>${siteUrl}/assets/images/profile/nick-karnik.jpeg</url>
      <title>Nick Karnik - The Outlander</title>
      <link>${blogUrl}</link>
    </image>
${rssItems}
  </channel>
</rss>`;
}
