import { marked } from 'marked';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  url: string;
  date: string;
  cover: string | null;
  tags: string[];
  contentMarkdown: string;
  contentHtml: string;
}

// Client-side functions that fetch from the generated JSON files
export async function loadAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await fetch('/data/blog-posts.json');
    if (!response.ok) {
      throw new Error('Failed to fetch blog posts');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to load blog posts:', error);
    return [];
  }
}

export async function loadBlogPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(`/data/posts/${slug}.json`);
    if (!response.ok) {
      return null;
    }
    const post = await response.json();
    return {
      id: post.id,
      slug: slug, // Use the provided slug
      title: post.title,
      excerpt: post.excerpt,
      url: post.url,
      date: post.date,
      cover: post.cover,
      tags: post.tags,
      contentMarkdown: '', // Not available in individual post files
      contentHtml: post.html
    };
  } catch (error) {
    console.error('Failed to load blog post:', error);
    return null;
  }
}

export function getBlogPostSlugs(): string[] {
  // This would need to be implemented differently for client-side
  // For now, return empty array as it's mainly used server-side
  return [];
}