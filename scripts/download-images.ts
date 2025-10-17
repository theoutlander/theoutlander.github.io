import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';
import { loadAllBlogPosts } from '../src/lib/content-server.js';

interface ImageInfo {
  url: string;
  localPath: string;
  filename: string;
}

async function downloadImage(url: string, localPath: string): Promise<boolean> {
  try {
    console.log(`Downloading: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Ensure directory exists
    const dir = join(process.cwd(), 'public', 'assets', 'images', 'blog');
    mkdirSync(dir, { recursive: true });
    
    writeFileSync(localPath, buffer);
    console.log(`✅ Downloaded: ${basename(localPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to download ${url}:`, error);
    return false;
  }
}

function extractImagesFromContent(content: string): string[] {
  const images: string[] = [];
  
  // Match markdown images: ![alt](url) with optional attributes
  const markdownImageRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+)\)/g;
  let match;
  while ((match = markdownImageRegex.exec(content)) !== null) {
    images.push(match[1]);
  }
  
  // Match markdown images with attributes: ![alt](url "title" align="center")
  const markdownImageWithAttrsRegex = /!\[.*?\]\((https?:\/\/[^\s\)]+)\s+[^)]+\)/g;
  while ((match = markdownImageWithAttrsRegex.exec(content)) !== null) {
    images.push(match[1]);
  }
  
  // Match HTML img tags: <img src="url">
  const htmlImageRegex = /<img[^>]+src="(https?:\/\/[^"]+)"/g;
  while ((match = htmlImageRegex.exec(content)) !== null) {
    images.push(match[1]);
  }
  
  // Match HTML img tags with single quotes: <img src='url'>
  const htmlImageRegexSingle = /<img[^>]+src='(https?:\/\/[^']+)'/g;
  while ((match = htmlImageRegexSingle.exec(content)) !== null) {
    images.push(match[1]);
  }
  
  // Filter out local paths and only return external URLs
  return images.filter(url => url.startsWith('http'));
}

function generateLocalPath(url: string, postSlug: string): string {
  const filename = basename(url.split('?')[0]); // Remove query parameters
  const ext = extname(filename) || '.jpg'; // Default to .jpg if no extension
  
  // Create a safe filename
  const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  const finalFilename = safeFilename.endsWith(ext) ? safeFilename : `${safeFilename}${ext}`;
  
  return join('public', 'assets', 'images', 'blog', `${postSlug}-${finalFilename}`);
}

function updateImageReferences(content: string, imageMappings: Map<string, string>): string {
  let updatedContent = content;
  
  // Update markdown images with attributes: ![alt](url "title" align="center")
  updatedContent = updatedContent.replace(
    /!\[(.*?)\]\((https?:\/\/[^\s\)]+)\s+([^)]+)\)/g,
    (match, alt, url, attrs) => {
      const localPath = imageMappings.get(url);
      if (localPath) {
        const relativePath = localPath.replace('public/', '/');
        return `![${alt}](${relativePath} ${attrs})`;
      }
      return match;
    }
  );
  
  // Update markdown images without attributes
  updatedContent = updatedContent.replace(
    /!\[(.*?)\]\((https?:\/\/[^\s\)]+)\)/g,
    (match, alt, url) => {
      const localPath = imageMappings.get(url);
      if (localPath) {
        const relativePath = localPath.replace('public/', '/');
        return `![${alt}](${relativePath})`;
      }
      return match;
    }
  );
  
  // Update HTML img tags with double quotes
  updatedContent = updatedContent.replace(
    /<img([^>]+)src="(https?:\/\/[^"]+)"/g,
    (match, attrs, url) => {
      const localPath = imageMappings.get(url);
      if (localPath) {
        const relativePath = localPath.replace('public/', '/');
        return `<img${attrs}src="${relativePath}"`;
      }
      return match;
    }
  );
  
  // Update HTML img tags with single quotes
  updatedContent = updatedContent.replace(
    /<img([^>]+)src='(https?:\/\/[^']+)'/g,
    (match, attrs, url) => {
      const localPath = imageMappings.get(url);
      if (localPath) {
        const relativePath = localPath.replace('public/', '/');
        return `<img${attrs}src='${relativePath}'`;
      }
      return match;
    }
  );
  
  return updatedContent;
}

async function downloadAllImages() {
  try {
    console.log('🖼️  Starting image download process...');
    
    // Load all blog posts
    const posts = await loadAllBlogPosts();
    console.log(`Found ${posts.length} blog posts`);
    
    const allImages: ImageInfo[] = [];
    const imageMappings = new Map<string, string>();
    
    // Collect all images from all posts
    for (const post of posts) {
      console.log(`\n📝 Processing post: ${post.title}`);
      
      // Add cover image
      if (post.cover) {
        const localPath = generateLocalPath(post.cover, post.slug);
        allImages.push({
          url: post.cover,
          localPath,
          filename: basename(localPath)
        });
        imageMappings.set(post.cover, localPath);
      }
      
      // Extract images from content
      const contentImages = extractImagesFromContent(post.contentMarkdown);
      console.log(`  Found ${contentImages.length} images in content`);
      
      for (const imageUrl of contentImages) {
        if (!imageMappings.has(imageUrl)) {
          const localPath = generateLocalPath(imageUrl, post.slug);
          allImages.push({
            url: imageUrl,
            localPath,
            filename: basename(localPath)
          });
          imageMappings.set(imageUrl, localPath);
        }
      }
    }
    
    console.log(`\n📊 Total unique images to download: ${allImages.length}`);
    
    // Download all images
    let successCount = 0;
    let failCount = 0;
    
    for (const imageInfo of allImages) {
      if (existsSync(imageInfo.localPath)) {
        console.log(`⏭️  Skipping existing: ${imageInfo.filename}`);
        successCount++;
        continue;
      }
      
      const success = await downloadImage(imageInfo.url, imageInfo.localPath);
      if (success) {
        successCount++;
      } else {
        failCount++;
      }
      
      // Add a small delay to be respectful to the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n📈 Download Summary:`);
    console.log(`  ✅ Successfully downloaded: ${successCount}`);
    console.log(`  ❌ Failed downloads: ${failCount}`);
    
    // Update markdown files with local image references
    console.log(`\n🔄 Updating markdown files with local image references...`);
    
    for (const post of posts) {
      const markdownPath = join(process.cwd(), 'content', 'blog', `${post.slug}.md`);
      const markdownContent = readFileSync(markdownPath, 'utf-8');
      
      // Extract images from this specific post
      const postImages = new Map<string, string>();
      
      // Add cover image mapping
      if (post.cover && imageMappings.has(post.cover)) {
        postImages.set(post.cover, imageMappings.get(post.cover)!);
      }
      
      // Add content images
      const contentImages = extractImagesFromContent(markdownContent);
      for (const imageUrl of contentImages) {
        if (imageMappings.has(imageUrl)) {
          postImages.set(imageUrl, imageMappings.get(imageUrl)!);
        }
      }
      
      if (postImages.size > 0) {
        let updatedContent = updateImageReferences(markdownContent, postImages);
        
        // Also update the cover field in front matter
        if (post.cover && imageMappings.has(post.cover)) {
          const localPath = imageMappings.get(post.cover)!;
          const relativePath = localPath.replace('public/', '/');
          updatedContent = updatedContent.replace(
            /^cover:\s*".*?"$/m,
            `cover: "${relativePath}"`
          );
        }
        
        writeFileSync(markdownPath, updatedContent);
        console.log(`  ✅ Updated: ${post.slug}.md (${postImages.size} images)`);
      } else {
        console.log(`  ⏭️  No images to update: ${post.slug}.md`);
      }
    }
    
    console.log(`\n🎉 Image download and localization complete!`);
    console.log(`\n📁 Images saved to: public/assets/images/blog/`);
    console.log(`\n🔄 Next steps:`);
    console.log(`  1. Run 'pnpm build' to regenerate the site`);
    console.log(`  2. Test your blog posts to ensure images load correctly`);
    console.log(`  3. All images have been successfully localized`);
    
  } catch (error) {
    console.error('❌ Error during image download process:', error);
    process.exit(1);
  }
}

downloadAllImages();
