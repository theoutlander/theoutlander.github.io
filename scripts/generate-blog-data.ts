import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { loadAllBlogPosts, loadBlogPost } from '../src/lib/content-server.js';

async function generateBlogData() {
  try {
    console.log('Generating blog data from local markdown files...');

    // Load all blog posts
    const posts = await loadAllBlogPosts();
    console.log(`Found ${posts.length} blog posts`);

    // Create public/data directory if it doesn't exist
    const dataDir = join(process.cwd(), 'public', 'data');
    mkdirSync(dataDir, { recursive: true });

    // Write all posts to blog-posts.json
    const blogPostsData = posts.map(post => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      url: post.url,
      date: post.date,
      cover: post.cover,
      tags: post.tags,
      contentMarkdown: post.contentMarkdown,
      contentHtml: post.contentHtml
    }));

    writeFileSync(
      join(dataDir, 'blog-posts.json'),
      JSON.stringify(blogPostsData, null, 2)
    );
    console.log('Generated public/data/blog-posts.json');

    // Create individual post files
    const postsDir = join(dataDir, 'posts');
    mkdirSync(postsDir, { recursive: true });

    for (const post of posts) {
      const postData = {
        id: post.id,
        slug: post.slug,
        title: post.title,
        date: post.date,
        cover: post.cover,
        excerpt: post.excerpt,
        html: post.contentHtml,
        url: post.url,
        tags: post.tags
      };

      writeFileSync(
        join(postsDir, `${post.slug}.json`),
        JSON.stringify(postData, null, 2)
      );
    }

    console.log(`Generated ${posts.length} individual post files in public/data/posts/`);
    console.log('Blog data generation complete!');

  } catch (error) {
    console.error('Error generating blog data:', error);
    process.exit(1);
  }
}

generateBlogData();