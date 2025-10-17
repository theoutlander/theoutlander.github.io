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
import { createHash } from "node:crypto";
import { capitalizeFirstLetter } from "./utils/stringUtils";
import { loadAllBlogPosts, type BlogPost } from "./lib/content-server";

// Import our Panda CSS page components
import { HomePagePanda } from "./pages/HomePagePanda";
import { BlogPagePanda } from "./pages/BlogPagePanda";
import { AboutPagePanda } from "./pages/AboutPagePanda";
import { ResumePagePanda } from "./pages/ResumePagePanda";
import { BlogPostPagePanda } from "./pages/BlogPostPagePanda";
import { NotFoundPagePanda } from "./pages/NotFoundPagePanda";
import { CalendarPagePanda } from "./pages/CalendarPagePanda";

type Post = BlogPost;

type AboutData = {
	title: string;
	html: string;
};

// Very small CSS minifier suitable for production CSS built by Panda
function minifyCss(css: string) {
    // Remove comments
    let out = css.replace(/\/\*[^!*][\s\S]*?\*\//g, "");
    // Collapse whitespace
    out = out.replace(/\s+/g, " ");
    // Remove spaces around symbols
    out = out.replace(/\s*([{}:;,>~\+\(\)])\s*/g, "$1");
    // Remove final semicolons and extra spaces
    out = out.replace(/;}/g, "}").trim();
    return out;
}

function hashContent(content: string, length = 8) {
    return createHash("sha256").update(content).digest("hex").slice(0, length);
}

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
	blogData: Post[],
	aboutData: AboutData
) => {
	console.log("🎨 Generating comprehensive CSS...");

	// Render all pages to collect all CSS
	const pages: Array<{
		name: string;
		component: any;
		props: any;
	}> = [
		{ name: "home", component: HomePagePanda, props: { posts: blogData } },
		{ name: "blog", component: BlogPagePanda, props: { posts: blogData } },
		{ name: "about", component: AboutPagePanda, props: { aboutData } },
		{ name: "resume", component: ResumePagePanda, props: {} },
		{ name: "calendar", component: CalendarPagePanda, props: {} },
	];

	// Add blog post pages
	for (const post of blogData) {
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
    const html = generateBaseHTML("Test", "Test", result.html, "/styles.css", "");

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

	// Write to dist (legacy fallback used by subsequent step which will minify+hash)
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
	cssHref: string,
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
		<link rel="shortcut icon" type="image/x-icon" href="/favicon.ico?v=2">
		<link rel="icon" type="image/png" sizes="32x32" href="/favicon_32x32.png?v=2">
		<link rel="icon" type="image/png" sizes="16x16" href="/favicon_16x16.png?v=2">
		<link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />

		<!-- Google Analytics: lazy loader to reduce unused JS on initial load -->
		<script>
			(function(){
				function loadGA(){
					if (window.__gaLoaded) return;
					window.__gaLoaded = true;
					var s = document.createElement('script');
					s.async = true;
					s.src = 'https://www.googletagmanager.com/gtag/js?id=G-62FC7BDSGJ';
					document.head.appendChild(s);
					window.dataLayer = window.dataLayer || [];
					window.gtag = function(){ dataLayer.push(arguments); };
					gtag('js', new Date());
					gtag('config', 'G-62FC7BDSGJ', { anonymize_ip: true });
				}
				// If user previously granted consent, load after idle; otherwise on first interaction
				var consent = null;
				try { consent = localStorage.getItem('ga_consent'); } catch (e) {}
				if (consent === 'granted') {
					(window.requestIdleCallback || function(cb){ setTimeout(cb, 2000); })(loadGA);
				} else {
					window.addEventListener('click', function onFirst(){ loadGA(); window.removeEventListener('click', onFirst, { capture: false }); }, { once: true, passive: true });
				}
			})();
		</script>

		${additionalHead || ""}

		<!-- External CSS -->
		<link rel="stylesheet" href="${cssHref}" />
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

	// Load blog data from local markdown files
	const blogData = await loadAllBlogPosts();

	// Read the about page data
	const aboutData = JSON.parse(
		readFileSync("public/data/pages/about.json", "utf8")
	) as AboutData;

    // Prepare CSS asset: copy or generate, then minify and fingerprint
    console.log("📋 Preparing CSS asset…");
    let sourceCss = "";
    try {
        sourceCss = readFileSync("styled-system/styles.css", "utf8");
        console.log("✅ Loaded Panda CSS from styled-system/styles.css");
        // Also write a non-minified copy for reference/debugging
        writeFileSync("dist/styles.css", sourceCss);
    } catch (error) {
        console.warn(
            "⚠️  Could not read styled-system CSS, generating comprehensive CSS instead…"
        );
        await generateComprehensiveCSS(blogData, aboutData);
        sourceCss = readFileSync("dist/styles.css", "utf8");
    }

    const minCss = minifyCss(sourceCss);
    const cssHash = hashContent(minCss);
    const cssFileName = `styles.${cssHash}.css`;
    writeFileSync(`dist/${cssFileName}`, minCss);
    console.log(`✅ Minified + fingerprinted CSS -> dist/${cssFileName}`);
    const cssHref = `/${cssFileName}`;

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
	const staticFiles = [
		"robots.txt",
		"sitemap.xml",
		"favicon.svg",
		"favicon.ico",
		"favicon_32x32.png",
		"favicon_16x16.png",
		"404.html",
	];
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
	const homeResult = renderPageToHTML(HomePagePanda, { posts: blogData });
    const homeHTMLWithStyles = generateBaseHTML(
		"Nick Karnik | Engineering Leader & Software Engineer",
		"Engineering leader with 25+ years building software across Google, Microsoft, and startups. Helping teams ship reliable systems with clarity, speed, and modern tools.",
        homeResult.html,
        cssHref,
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
	const blogResult = renderPageToHTML(BlogPagePanda, { posts: blogData });
    const blogHTMLWithStyles = generateBaseHTML(
		"Nick Karnik Blog | Engineering, Leadership & AI",
		"Practical essays and reflections on software engineering, leadership, and AI. Lessons from shipping products at scale and helping teams move faster.",
        blogResult.html,
        cssHref,
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
	const blogsResult = renderPageToHTML(BlogPagePanda, { posts: blogData });
    const blogsHTMLWithStyles = generateBaseHTML(
		"Nick Karnik Blogs | Engineering, Leadership & AI",
		"Practical essays and reflections on software engineering, leadership, and AI. Lessons from shipping products at scale and helping teams move faster.",
        blogsResult.html,
        cssHref,
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
        cssHref,
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
        cssHref,
		resumeResult.helmet.title +
			resumeResult.helmet.meta +
			resumeResult.helmet.link,
		"https://nick.karnik.io/resume",
		"https://nick.karnik.io/assets/images/profile/nick-karnik.jpeg",
		"profile"
	);
	const resumeHTML = removeInlineStyles(resumeHTMLWithStyles);
	writeFileSync(join(resumeDir, "index.html"), resumeHTML);

	// Render calendar page
	console.log("📄 Rendering calendar page with SSR...");
	const calendarDir = join("dist", "calendar");
	mkdirSync(calendarDir, { recursive: true });
	const calendarResult = renderPageToHTML(CalendarPagePanda, {});
	const calendarHTMLWithStyles = generateBaseHTML(
		"Schedule time with Nick Karnik",
		"Book time with Nick directly via Google Calendar appointments.",
		calendarResult.html,
		cssHref,
		calendarResult.helmet.title + calendarResult.helmet.meta + calendarResult.helmet.link,
		"https://nick.karnik.io/calendar",
		"https://nick.karnik.io/assets/images/profile/nick-karnik.jpeg",
		"website"
	);
	const calendarHTML = removeInlineStyles(calendarHTMLWithStyles);
	writeFileSync(join(calendarDir, "index.html"), calendarHTML);

	// Render individual blog post pages
	console.log("📄 Rendering individual blog post pages with SSR...");
	for (const post of blogData) {
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
            cssHref,
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
        cssHref,
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

	const rssXml = generateRssXml(blogData);
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
