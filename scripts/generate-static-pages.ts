import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { BlogPostData } from '../src/types/blog';

async function generateStaticPages() {
  console.log('🔄 Generating static pages for blog posts...');

  // Read the blog-posts.json to get all posts
  const blogPostsData = JSON.parse(
    readFileSync('public/data/blog-posts.json', 'utf8')
  ) as BlogPostData[];

  // Read the base HTML template
  const baseHtml = readFileSync('dist/index.html', 'utf8');

  for (const post of blogPostsData) {
    console.log(`📄 Generating static page for: ${post.slug}`);

    // Create the blog post directory
    const blogDir = join('dist', 'blog', post.slug);
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
    writeFileSync(join(blogDir, 'index.html'), postHtml);
  }

  console.log(`✅ Generated ${blogPostsData.length} static blog post pages`);

  // Generate static blog index page
  console.log('📄 Generating static page for: blog');
  const blogDir = join('dist', 'blog');
  mkdirSync(blogDir, { recursive: true });

  // Generate the HTML content for the blog index page
  const blogHtml = baseHtml.replace(
    '<div id="root"></div>',
    `<div id="root"></div>
		<script>
			// Pre-populate the router with the blog posts data
			window.__INITIAL_BLOG_DATA__ = ${JSON.stringify(blogPostsData)};
		</script>`
  );

  // Write the static HTML file
  writeFileSync(join(blogDir, 'index.html'), blogHtml);
  console.log('✅ Generated static blog index page');

  // Generate static about page
  console.log('📄 Generating static page for: about');
  const aboutDir = join('dist', 'about');
  mkdirSync(aboutDir, { recursive: true });

  // Read the about page data
  const aboutData = JSON.parse(
    readFileSync('public/data/pages/about.json', 'utf8')
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
  writeFileSync(join(aboutDir, 'index.html'), aboutHtml);
  console.log('✅ Generated static about page');

  // Copy resume PDF to root for /resume.pdf access
  console.log('📄 Copying resume PDF to root...');
  copyFileSync(
    'public/assets/documents/resume-nick-karnik.pdf',
    'dist/resume.pdf'
  );
  // Also copy with SEO-friendly filename
  copyFileSync(
    'public/assets/documents/resume-nick-karnik.pdf',
    'dist/resume-nick-karnik.pdf'
  );
  console.log(
    '✅ Resume PDF copied to /resume.pdf and /resume-nick-karnik.pdf'
  );

  // Generate RSS feed
  console.log('📄 Generating RSS feed...');
  const rssDir = join('dist', 'rss');
  mkdirSync(rssDir, { recursive: true });

  // Generate RSS XML content
  const rssXml = generateRssXml(blogPostsData);
  writeFileSync(join(rssDir, 'index.html'), rssXml);
  console.log('✅ Generated RSS feed');
}

function generateRssXml(posts: Post[]) {
  const siteUrl = 'https://nick.karnik.io';
  const blogUrl = `${siteUrl}/blog`;
  const feedUrl = `${siteUrl}/rss`;

  const rssItems = posts
    .slice(0, 20) // Limit to 20 most recent posts
    .map(post => {
      const postUrl = `${blogUrl}/${post.slug}`;
      const pubDate = post.date
        ? new Date(post.date).toUTCString()
        : new Date().toUTCString();

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.excerpt || ''}]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      ${post.cover ? `<enclosure url="${post.cover}" type="image/jpeg" />` : ''}
      ${post.tags?.map(tag => `<category>${tag}</category>`).join('') || ''}
    </item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Nick Karnik - The Outlander</title>
    <description>Engineering insights, AI tools, and technical writing from Nick Karnik</description>
    <link>${blogUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>TanStack Router + Self-Hosted Blog</generator>
    <managingEditor>nick@karnik.io (Nick Karnik)</managingEditor>
    <webMaster>nick@karnik.io (Nick Karnik)</webMaster>
    <image>
      <url>${siteUrl}/assets/images/profile/nick-karnik.jpeg</url>
      <title>Nick Karnik - The Outlander</title>
      <link>${blogUrl}</link>
    </image>
${rssItems}
  </channel>
</rss>`;
}

generateStaticPages().catch(console.error);
