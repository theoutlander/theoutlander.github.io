import { createFileRoute } from '@tanstack/react-router';
import { fetchAllPosts } from '../lib/hashnode';

export const Route = createFileRoute('/rss')({
  component: RssFeed,
  loader: async () => {
    const posts = await fetchAllPosts();
    return { posts };
  },
});

function RssFeed() {
  const { posts } = Route.useLoaderData();

  const rssXml = generateRssXml(posts);

  // Set the content type to XML
  if (typeof document !== 'undefined') {
    document.documentElement.innerHTML = rssXml;
  }

  return (
    <div>
      <pre>{rssXml}</pre>
    </div>
  );
}

type RssPost = {
  slug: string;
  title: string;
  brief?: string;
  publishedAt?: string;
  coverImage?: {
    url?: string | null;
  } | null;
  tags?: Array<{
    name: string;
  }>;
};

function generateRssXml(posts: RssPost[]) {
  const siteUrl = 'https://nick.karnik.io';
  const blogUrl = `${siteUrl}/blog`;
  const feedUrl = `${siteUrl}/rss`;

  const rssItems = posts
    .slice(0, 20) // Limit to 20 most recent posts
    .map(post => {
      const postUrl = `${blogUrl}/${post.slug}`;
      const pubDate = post.publishedAt
        ? new Date(post.publishedAt).toUTCString()
        : new Date().toUTCString();

      return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.brief || ''}]]></description>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      ${post.coverImage?.url ? `<enclosure url="${post.coverImage.url}" type="image/jpeg" />` : ''}
      ${post.tags?.map(tag => `<category>${tag.name}</category>`).join('') || ''}
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
    <generator>TanStack Router + Hashnode</generator>
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
