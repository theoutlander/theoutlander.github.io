# Step-by-Step Guide: Creating and Publishing Articles

This guide walks you through the complete process of creating a blog article from start to finish and publishing it to your site.

## 📋 Pre-Publication Checklist

Before you start, ensure you have:
- [ ] A development environment set up (`pnpm` installed)
- [ ] Your article content written or outlined
- [ ] A cover image (optional, but recommended: 1200x630px)
- [ ] 2-3 relevant tags for categorization
- [ ] A brief excerpt (1-2 sentences)

---

## ✍️ Step 1: Create the Markdown File

Create a new `.md` file in the `content/blog/` directory with a descriptive, URL-friendly filename (lowercase, hyphens instead of spaces):

```bash
touch content/blog/your-article-slug.md
```

**Example filenames:**
- `getting-started-with-typescript.md`
- `debugging-react-performance.md`
- `api-design-best-practices.md`

---

## 📝 Step 2: Add the Front Matter

Add metadata at the top of your file between `---` markers. This is YAML format and is required for your article to be published.

### Required Fields:

```markdown
---
id: "unique-post-id"
title: "Your Article Title"
date: "2025-05-15T10:30:00.000Z"
excerpt: "A brief 1-2 sentence description of your article that appears in listings and social media previews."
category: "Category Name"
tags: ["tag1", "tag2", "tag3"]
---
```

### Optional Fields:

```markdown
cover: "https://example.com/cover-image.jpg"
slug: "your-article-slug"
```

### Field Descriptions:

| Field | Required | Format | Notes |
|-------|----------|--------|-------|
| `id` | ✅ | String | Unique identifier (use UUID or timestamp). Example: `"74d3f98cbf9823e6a9c2a457"` |
| `title` | ✅ | String | Your article title. Be concise but descriptive. |
| `date` | ✅ | ISO 8601 | Publication date. Format: `"YYYY-MM-DDTHH:MM:SS.000Z"`. Use UTC timezone. |
| `excerpt` | ✅ | String | Short summary for previews. 1-2 sentences, under 160 characters recommended. |
| `category` | ✅ | String | Article category (e.g., "Engineering", "Tutorial", "Opinion"). |
| `tags` | ✅ | Array | Related topics. 2-5 tags recommended. Example: `["React", "TypeScript", "Performance"]` |
| `cover` | ❌ | URL | Cover image URL. Should be absolute URL. Recommended size: 1200x630px. |
| `slug` | ❌ | String | URL slug (optional, derived from filename if not specified). |

### Complete Example:

```markdown
---
id: "getting-started-typescript"
title: "Getting Started with TypeScript: A Beginner's Guide"
date: "2025-05-15T14:30:00.000Z"
excerpt: "Learn how to set up TypeScript in your project and understand the basics of static typing."
category: "Tutorial"
tags: ["TypeScript", "JavaScript", "Beginner"]
cover: "https://example.com/images/typescript-cover.jpg"
slug: "getting-started-typescript"
---
```

---

## ✏️ Step 3: Write Your Article Content

Write your article content below the front matter using Markdown. Here are the supported formats:

### Headings
```markdown
# Heading 1 (Article title, usually skip this since title is in front matter)
## Heading 2 (Main sections)
### Heading 3 (Subsections)
#### Heading 4 (Sub-subsections)
```

### Text Formatting
```markdown
**Bold text** - Use for emphasis
*Italic text* - Use for secondary emphasis
~~Strikethrough~~ - Use for deleted content
`inline code` - Use for code snippets
```

### Code Blocks
Use triple backticks with language syntax highlighting:

````markdown
```javascript
function hello() {
  console.log("Hello, World!");
}
```

```python
def hello():
    print("Hello, World!")
```

```bash
echo "Hello, World!"
```
````

### Lists

**Unordered lists:**
```markdown
- Point 1
- Point 2
  - Nested point
  - Another nested point
```

**Ordered lists:**
```markdown
1. First step
2. Second step
3. Third step
```

**Task lists:**
```markdown
- [ ] Uncompleted task
- [x] Completed task
```

### Blockquotes
```markdown
> This is a blockquote
> It can span multiple lines
> Use for highlighting important thoughts or quotes
```

### Links and Images
```markdown
[Link text](https://example.com)
![Alt text](https://example.com/image.jpg)
```

### Tables
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
```

### Complete Content Example:

```markdown
---
id: "getting-started-typescript"
title: "Getting Started with TypeScript"
date: "2025-05-15T14:30:00.000Z"
excerpt: "Learn how to set up TypeScript in your project."
category: "Tutorial"
tags: ["TypeScript", "JavaScript"]
---

TypeScript adds static typing to JavaScript, helping catch errors before runtime.

## Why TypeScript?

TypeScript provides:
- Type safety
- Better IDE support
- Improved code documentation

## Installation

```bash
npm install -D typescript
npm install -D @types/node
```

## Basic Usage

```typescript
const greeting: string = "Hello";
const count: number = 42;
```

## Next Steps

Now you're ready to write typed JavaScript!
```

---

## 🧪 Step 4: Test Locally

### Start the Development Server

```bash
pnpm dev
```

The server will start at `http://localhost:5173` (or similar).

### View Your Article

Navigate to your article:
```
http://localhost:5173/blog/your-article-slug
```

### What to Check:

- [ ] Article title appears correctly
- [ ] Cover image displays properly
- [ ] All formatting is correct (bold, italics, code blocks)
- [ ] Links work correctly
- [ ] Images display with proper sizing
- [ ] Code syntax highlighting works
- [ ] Tables render properly
- [ ] Reading time is calculated correctly

### Make Corrections

If you find issues:
1. Edit your `.md` file in `content/blog/`
2. Save the file
3. The dev server will hot-reload automatically
4. Refresh your browser to see changes

---

## 📦 Step 5: Build for Production

Once you're satisfied with your article:

```bash
pnpm build
```

This will:
1. Generate blog data from all markdown files
2. Build the application for production
3. Generate SEO metadata (sitemap, RSS feed, etc.)
4. Output to the `dist/` folder

### Verify the Build

```bash
pnpm run preview
```

Visit `http://localhost:4173` to preview the production build.

---

## 🚀 Step 6: Deploy to Production

Deploy your site to make it live:

```bash
pnpm deploy
```

This command will:
1. Build the production site (`pnpm build`)
2. Deploy to GitHub Pages (if configured)
3. Update your live website

Your article will now be accessible at:
```
https://nick.karnik.io/blog/your-article-slug
```

---

## 🔄 Updating an Existing Article

To update an article:

1. Edit the markdown file in `content/blog/`
2. Update the `date` field if you want to change the publication date
3. Save the file
4. Test locally: `pnpm dev`
5. Rebuild and deploy: `pnpm build && pnpm deploy`

---

## 🎨 Automatic Features

Your articles automatically include:

- **SEO Optimization**: Meta tags, Open Graph tags, Twitter Cards
- **RSS Feed**: Article included in `/rss.xml`
- **Sitemap**: Article added to `/sitemap.xml`
- **Reading Time**: Automatically calculated and displayed
- **Syntax Highlighting**: Code blocks are automatically highlighted
- **Responsive Images**: Cover images adapt to different screen sizes
- **Social Sharing**: Open Graph tags for sharing on social media

---

## 🔍 Front Matter Validation

Common front matter mistakes:

```yaml
# ❌ WRONG - Missing quotes on multi-word values
category: My Category
tags: [React, TypeScript, My Tag]

# ✅ CORRECT - Properly quoted
category: "My Category"
tags: ["React", "TypeScript", "My Tag"]
```

```yaml
# ❌ WRONG - Missing Z in date (timezone indicator)
date: "2025-05-15T14:30:00"

# ✅ CORRECT - Includes timezone
date: "2025-05-15T14:30:00.000Z"
```

---

## 🆘 Troubleshooting

### Article Not Appearing

- Check that the markdown file exists in `content/blog/`
- Verify front matter is correctly formatted (no typos, proper quotes)
- Ensure all required fields are present: `id`, `title`, `date`, `excerpt`, `category`, `tags`
- Run `pnpm build` and check `public/data/blog-posts.json` to see if your article was processed

### Build Errors

- Check the console output for specific error messages
- Verify YAML syntax in front matter (use a YAML validator if needed)
- Ensure date format is ISO 8601: `"YYYY-MM-DDTHH:MM:SS.000Z"`
- Check for typos in field names

### Images Not Loading

- Use absolute URLs for cover images
- Ensure image URLs are accessible from your browser
- Check image file permissions
- Verify image URLs have no typos

### Deployment Fails

- Verify `pnpm build` completes successfully locally
- Check that the `dist/` folder is created
- Ensure you have push access to the repository
- Check GitHub Actions logs for deployment errors

---

## 📚 Template File

A template is available at `content/blog/_template.md`. Copy and modify it to create new articles:

```bash
cp content/blog/_template.md content/blog/your-article-slug.md
```

---

## 📊 Best Practices

1. **Filenames**: Use lowercase, hyphens, and descriptive names
2. **Titles**: Be specific and compelling (50-60 characters ideal)
3. **Excerpts**: Write compelling previews that encourage clicks
4. **Tags**: Use consistent, lowercase tags for better categorization
5. **Dates**: Use actual publication date/time in UTC
6. **Headings**: Start with H2 (`##`), use proper hierarchy (H2 → H3 → H4)
7. **Cover Images**: Use high-quality images (1200x630px recommended)
8. **Code Examples**: Include runnable examples when possible
9. **Links**: Test all links before publishing
10. **Preview**: Always test locally before deploying

---

## 🎯 Quick Reference

### Complete Workflow:

```bash
# 1. Create file
touch content/blog/my-article.md

# 2. Edit file with front matter and content
# (use your preferred editor)

# 3. Test locally
pnpm dev
# Visit http://localhost:5173/blog/my-article

# 4. Build for production
pnpm build

# 5. Preview production build
pnpm run preview
# Visit http://localhost:4173/blog/my-article

# 6. Deploy
pnpm deploy
```

### Front Matter Template:

```markdown
---
id: "article-id"
title: "Article Title"
date: "2025-05-15T14:30:00.000Z"
excerpt: "Brief description of your article."
category: "Category"
tags: ["tag1", "tag2", "tag3"]
cover: "https://example.com/image.jpg"
slug: "article-slug"
---
```

---

## 📖 Additional Resources

- [BLOG_GUIDE.md](./BLOG_GUIDE.md) - Comprehensive blog management guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment options and instructions
- [ENVIRONMENT.md](./ENVIRONMENT.md) - Environment configuration
- [Markdown Reference](https://www.markdownguide.org/)

---

**Ready to publish?** Start with Step 1 and follow through to Step 6!
