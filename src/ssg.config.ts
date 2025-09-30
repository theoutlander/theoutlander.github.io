import { readFileSync } from 'node:fs';

type Post = { slug: string };

export async function paths(): Promise<string[]> {
  const base = ['/', '/blog', '/about', '/rss'];
  let posts: Post[] = [];
  try {
    const raw = readFileSync('public/data/hashnode.json', 'utf8');
    posts = JSON.parse(raw) as Post[];
    return [...base, ...posts.map(p => `/blog/${p.slug}`)];
  } catch {
    return base;
  }
}
