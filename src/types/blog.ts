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

// For components that might not need all fields
export type Post = Pick<BlogPost, 'id' | 'slug' | 'title' | 'excerpt' | 'url' | 'date' | 'cover' | 'tags'> & {
  contentMarkdown?: string;
  contentHtml?: string;
  html?: string; // Legacy field for backward compatibility
};

// For scripts that might have slightly different requirements
export type BlogPostData = Pick<BlogPost, 'slug' | 'title' | 'excerpt' | 'url' | 'date' | 'cover' | 'tags'> & {
  html: string;
};
