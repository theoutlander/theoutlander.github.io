import React from "react";
import { renderToString } from "react-dom/server";
import { readFileSync, writeFileSync, mkdirSync, join } from "fs";
import { HomePagePanda } from "./pages/HomePagePanda";
import { Post } from "./types/blog";

type AboutData = {
	title: string;
	html: string;
};

// Generate the base HTML template
const generateBaseHTML = (
	title: string,
	description: string,
	content: string,
	additionalHead?: string
) => {
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
    
    <!-- SEO Meta Tags -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://nick.karnik.io" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    
    <!-- RSS Feed -->
    <link rel="alternate" type="application/rss+xml" title="RSS" href="/rss" />
    
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-62FC7BDSGJ"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-62FC7BDSGJ');
    </script>
    
    ${additionalHead || ""}
    
    <!-- Panda CSS: this file is now fingerprinted by ssr-renderer at build time -->
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <div id="root">
      ${content}
    </div>
  </body>
</html>`;
};

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

// Main function to render all static pages using Panda CSS
export async function renderAllStaticPagesPanda() {
	console.log("🔄 Rendering all static pages with Panda CSS...");

	// Read the blog posts data
	const blogPostsData = JSON.parse(
		readFileSync("public/data/blog-posts.json", "utf8")
	) as Post[];

	// Generate CSS first
	console.log("🎨 Generating Panda CSS...");

	// Render home page
	console.log("📄 Rendering home page with Panda CSS...");
	const homeResult = renderPageToHTML(HomePagePanda, { posts: blogPostsData });
	const homeHTML = generateBaseHTML(
		"Nick Karnik | Engineering Leader & Software Engineer",
		"Engineering leader with 25+ years building software across Google, Microsoft, and startups. Helping teams ship reliable systems with clarity, speed, and modern tools.",
		homeResult.html,
		homeResult.helmet.title + homeResult.helmet.meta + homeResult.helmet.link
	);
	writeFileSync("dist/index.html", homeHTML);

	console.log("✅ All static pages rendered successfully with Panda CSS!");
}
