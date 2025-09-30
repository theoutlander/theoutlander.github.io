import React from 'react';
import { renderToString } from 'react-dom/server';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

// Import our Panda CSS page components
import { HomePagePanda } from './pages/HomePagePanda';
import { BlogPagePanda } from './pages/BlogPagePanda';
import { AboutPagePanda } from './pages/AboutPagePanda';
import { ResumePagePanda } from './pages/ResumePagePanda';
import { BlogPostPagePanda } from './pages/BlogPostPagePanda';

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

// Generate comprehensive CSS by rendering all pages and collecting all styles
const generateComprehensiveCSS = async (
  hashnodeData: Post[],
  aboutData: AboutData
) => {
  console.log('🎨 Generating comprehensive CSS...');

  // Render all pages to collect all CSS
  const pages: Array<{
    name: string;
    component: any;
    props: any;
  }> = [
    { name: 'home', component: HomePagePanda, props: { posts: hashnodeData } },
    { name: 'blog', component: BlogPagePanda, props: { posts: hashnodeData } },
    { name: 'about', component: AboutPagePanda, props: { aboutData } },
    { name: 'resume', component: ResumePagePanda, props: {} },
  ];

  // Add blog post pages
  for (const post of hashnodeData) {
    const postDataPath = join('public', 'data', 'posts', `${post.slug}.json`);
    let fullPostData;
    try {
      fullPostData = JSON.parse(readFileSync(postDataPath, 'utf8'));
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
    const html = generateBaseHTML('Test', 'Test', result.html, '');

    // Extract CSS from this page
    const styleRegex = /<style[^>]*>(.*?)<\/style>/gs;
    const matches = html.match(styleRegex);

    if (matches) {
      console.log(`    Found ${matches.length} style blocks`);
      matches.forEach(match => {
        const css = match.replace(/<style[^>]*>/, '').replace(/<\/style>/, '');
        allCSS.add(css);
      });
    } else {
      console.log(`    No style blocks found`);
    }
  }

  // Combine all unique CSS
  const combinedCSS = Array.from(allCSS).join('\n\n');

  // Write to dist
  writeFileSync('dist/styles.css', combinedCSS);

  console.log(
    `✅ Generated comprehensive CSS file (${combinedCSS.length} characters)`
  );
};

// Remove inline styles from HTML and return clean HTML
const removeInlineStyles = (html: string) => {
  return html.replace(/<style[^>]*>.*?<\/style>/gs, '');
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
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-62FC7BDSGJ"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-62FC7BDSGJ');
    </script>
    
    ${additionalHead || ''}
    
    <!-- External CSS -->
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <div id="root">
      ${content}
    </div>
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
      title: '',
      meta: '',
      link: '',
    },
  };
};

// Main function to render all static pages using SSR
export async function renderAllStaticPagesSSR() {
  console.log('🔄 Rendering all static pages with SSR...');

  // Read the hashnode data
  const hashnodeData = JSON.parse(
    readFileSync('public/data/hashnode.json', 'utf8')
  ) as Post[];

  // Read the about page data
  const aboutData = JSON.parse(
    readFileSync('public/data/pages/about.json', 'utf8')
  ) as AboutData;

  // Copy Panda CSS to dist folder
  console.log('📋 Copying Panda CSS to dist folder...');
  try {
    const pandaCSS = readFileSync('styled-system/styles.css', 'utf8');
    writeFileSync('dist/styles.css', pandaCSS);
    console.log('✅ Panda CSS copied to dist/styles.css');
  } catch (error) {
    console.warn(
      '⚠️  Could not copy Panda CSS, generating comprehensive CSS instead...'
    );
    await generateComprehensiveCSS(hashnodeData, aboutData);
  }

  // Render home page
  console.log('📄 Rendering home page with SSR...');
  const homeResult = renderPageToHTML(HomePagePanda, { posts: hashnodeData });
  const homeHTMLWithStyles = generateBaseHTML(
    'Nick Karnik - Staff Software Engineer & Engineering Leader',
    'Staff software engineer and engineering leader sharing insights on engineering, AI, and technology. Read my blog for the latest thoughts and experiences.',
    homeResult.html,
    homeResult.helmet.title + homeResult.helmet.meta + homeResult.helmet.link
  );
  const homeHTML = removeInlineStyles(homeHTMLWithStyles);
  writeFileSync('dist/index.html', homeHTML);

  // Render blog index page
  console.log('📄 Rendering blog index page with SSR...');
  const blogDir = join('dist', 'blog');
  mkdirSync(blogDir, { recursive: true });
  const blogResult = renderPageToHTML(BlogPagePanda, { posts: hashnodeData });
  const blogHTMLWithStyles = generateBaseHTML(
    'Blog - Nick Karnik',
    'Thoughts on engineering, AI, and technology from my experience building and leading teams.',
    blogResult.html,
    blogResult.helmet.title + blogResult.helmet.meta + blogResult.helmet.link
  );
  const blogHTML = removeInlineStyles(blogHTMLWithStyles);
  writeFileSync(join(blogDir, 'index.html'), blogHTML);

  // Render about page
  console.log('📄 Rendering about page with SSR...');
  const aboutDir = join('dist', 'about');
  mkdirSync(aboutDir, { recursive: true });
  const aboutResult = renderPageToHTML(AboutPagePanda, { aboutData });
  const aboutHTMLWithStyles = generateBaseHTML(
    'About - Nick Karnik',
    'Engineering Leader & Staff Software Engineer, shipping fast with Node, React, and TypeScript.',
    aboutResult.html,
    aboutResult.helmet.title + aboutResult.helmet.meta + aboutResult.helmet.link
  );
  const aboutHTML = removeInlineStyles(aboutHTMLWithStyles);
  writeFileSync(join(aboutDir, 'index.html'), aboutHTML);

  // Render resume page
  console.log('📄 Rendering resume page with SSR...');
  const resumeDir = join('dist', 'resume');
  mkdirSync(resumeDir, { recursive: true });
  const resumeResult = renderPageToHTML(ResumePagePanda, {});
  const resumeHTMLWithStyles = generateBaseHTML(
    'Resume — Nick Karnik',
    'Nick Karnik - Staff Software Engineer & Engineering Leader with 25+ years building scalable platforms at Google, Microsoft, Salesforce, Tableau, and startups',
    resumeResult.html,
    resumeResult.helmet.title +
      resumeResult.helmet.meta +
      resumeResult.helmet.link +
      '<link rel="canonical" href="https://nick.karnik.io/resume" />'
  );
  const resumeHTML = removeInlineStyles(resumeHTMLWithStyles);
  writeFileSync(join(resumeDir, 'index.html'), resumeHTML);

  // Render individual blog post pages
  console.log('📄 Rendering individual blog post pages with SSR...');
  for (const post of hashnodeData) {
    const postDir = join('dist', 'blog', post.slug);
    mkdirSync(postDir, { recursive: true });

    // Read the full post data from the individual JSON file
    const postDataPath = join('public', 'data', 'posts', `${post.slug}.json`);
    let fullPostData;
    try {
      fullPostData = JSON.parse(readFileSync(postDataPath, 'utf8'));
    } catch (error) {
      console.warn(
        `⚠️  Could not read post data for ${post.slug}, using basic data`
      );
      fullPostData = post;
    }

    const postResult = renderPageToHTML(BlogPostPagePanda, {
      post: fullPostData,
    });
    const postHTMLWithStyles = generateBaseHTML(
      `${post.title} - Nick Karnik`,
      post.excerpt ||
        `Read ${post.title} on Nick Karnik's blog about engineering, AI, and technology.`,
      postResult.html,
      postResult.helmet.title +
        postResult.helmet.meta +
        postResult.helmet.link +
        `<link rel="canonical" href="https://nick.karnik.io/blog/${post.slug}" />`
    );
    const postHTML = removeInlineStyles(postHTMLWithStyles);
    writeFileSync(join(postDir, 'index.html'), postHTML);
  }

  console.log('✅ All static pages rendered successfully with SSR!');
}
