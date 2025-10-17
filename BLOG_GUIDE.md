# Blog Post Guide

This guide explains how to create and manage blog posts for your self-hosted blog.

## 📝 Creating a New Blog Post

### 1. Create a Markdown File

Create a new `.md` file in the `content/blog/` directory with a descriptive filename (this becomes the URL slug):

```bash
# Example: content/blog/my-awesome-post.md
touch content/blog/my-awesome-post.md
```

### 2. Add Front Matter

Every blog post must start with front matter (metadata) between `---` markers:

```markdown
---
id: "unique-post-id"
title: "Your Amazing Blog Post Title"
date: "2025-01-15T10:30:00.000Z"
cover: "https://example.com/your-cover-image.jpg"
excerpt: "A brief description of your post that will appear in listings and social media previews..."
tags: ["tag1", "tag2", "tag3"]
---

Your blog post content starts here...
```

### 3. Front Matter Fields

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| `id` | ✅ | Unique identifier for the post | `"my-awesome-post-2025"` |
| `title` | ✅ | The post title | `"How to Build Amazing Things"` |
| `date` | ✅ | Publication date (ISO 8601 format) | `"2025-01-15T10:30:00.000Z"` |
| `excerpt` | ✅ | Short description for previews | `"Learn the secrets of building..."` |
| `cover` | ❌ | Cover image URL | `"https://example.com/image.jpg"` |
| `tags` | ❌ | Array of tags | `["React", "TypeScript", "Tutorial"]` |

### 4. Write Your Content

Write your blog post content in Markdown below the front matter:

```markdown
# Your Post Title (optional - title from front matter is used)

Your introduction paragraph here...

## Section Heading

More content with **bold text** and *italic text*.

### Code Examples

```javascript
function hello() {
  console.log("Hello, World!");
}
```

### Lists

- Bullet point 1
- Bullet point 2
  - Nested bullet
  - Another nested bullet

1. Numbered item 1
2. Numbered item 2

### Links and Images

[Link to external site](https://example.com)

![Alt text](https://example.com/image.jpg)

### Blockquotes

> This is a blockquote
> that can span multiple lines

### Tables

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
```

## 🚀 Publishing Your Post

### Development

1. **Start the development server:**
   ```bash
   pnpm dev
   ```

2. **View your post:**
   - Visit `https://localhost:5176/blog/your-post-slug`
   - The post will be automatically generated from your markdown file

### Production

1. **Build the site:**
   ```bash
   pnpm build
   ```

2. **Deploy:**
   ```bash
   pnpm deploy
   ```

## 📁 File Structure

```
content/
└── blog/
    ├── my-first-post.md
    ├── another-awesome-post.md
    └── yet-another-post.md
```

## 🎨 Styling and Features

### Automatic Features

- **SEO Optimization**: Meta tags, Open Graph, Twitter Cards
- **RSS Feed**: Automatically included in `/rss`
- **Sitemap**: Automatically included in `/sitemap.xml`
- **Reading Time**: Automatically calculated
- **Syntax Highlighting**: Code blocks are automatically highlighted
- **Responsive Images**: Cover images are responsive
- **Social Sharing**: Open Graph tags for social media

### Custom Styling

The blog uses Panda CSS for styling. You can customize:

- **Typography**: Headings, paragraphs, lists
- **Code Blocks**: Syntax highlighting and styling
- **Blockquotes**: Styled with left border and background
- **Tables**: Responsive table styling
- **Images**: Responsive image handling

## 🔧 Troubleshooting

### Common Issues

1. **Post not appearing:**
   - Check that the filename matches the slug in the URL
   - Ensure front matter is properly formatted
   - Verify the file is in `content/blog/` directory

2. **Build errors:**
   - Check for syntax errors in front matter
   - Ensure all required fields are present
   - Verify markdown syntax is correct

3. **Images not loading:**
   - Use absolute URLs for cover images
   - Ensure image URLs are accessible
   - Check for typos in image URLs

### Front Matter Validation

The front matter must be valid YAML. Common issues:

```yaml
# ❌ Wrong - missing quotes around values with special characters
tags: [React, TypeScript, "My Tag"]

# ✅ Correct - proper YAML formatting
tags: ["React", "TypeScript", "My Tag"]
```

## 📚 Markdown Reference

### Basic Syntax

```markdown
# Heading 1
## Heading 2
### Heading 3

**Bold text**
*Italic text*
~~Strikethrough~~

`Inline code`

[Link text](https://example.com)
![Image alt text](https://example.com/image.jpg)
```

### Advanced Features

```markdown
> Blockquote
> Can span multiple lines

```javascript
// Code block with syntax highlighting
function example() {
  return "Hello, World!";
}
```

| Table | Header |
|-------|--------|
| Cell 1 | Cell 2 |

- [ ] Unchecked task
- [x] Checked task
```

## 🎯 Best Practices

1. **Use descriptive filenames** that match your intended URL slug
2. **Write compelling excerpts** that encourage clicks
3. **Add relevant tags** for better categorization
4. **Use high-quality cover images** (recommended: 1200x630px)
5. **Keep titles concise** but descriptive
6. **Use proper heading hierarchy** (H1 → H2 → H3)
7. **Test your post** in development before publishing
8. **Optimize images** for web performance

## 🔄 Updating Existing Posts

To update an existing post:

1. Edit the markdown file in `content/blog/`
2. Update the `date` field if you want to change the publication date
3. Run `pnpm dev` to see changes in development
4. Run `pnpm build` to generate the updated static site

## 📊 Analytics and SEO

Your blog posts automatically include:

- **Meta descriptions** from the excerpt field
- **Open Graph tags** for social media sharing
- **Twitter Card tags** for Twitter sharing
- **Structured data** (JSON-LD) for search engines
- **Canonical URLs** for SEO
- **Reading time estimates**

## 🆘 Need Help?

If you encounter issues:

1. Check the console for error messages
2. Verify your markdown syntax
3. Ensure front matter is properly formatted
4. Test with a simple post first
5. Check the generated files in `public/data/` to see if your post was processed correctly
