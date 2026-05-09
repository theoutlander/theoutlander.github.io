# Available Commands

This document describes all available commands for development, building, testing, and deployment.

## 🚀 Core Commands

### Development

```bash
pnpm dev
```

Starts the development server with hot reload.

**What it does:**
- Generates blog data from markdown files
- Builds the application in development mode
- Starts Vite dev server at `http://localhost:5173`
- Watches files for changes and auto-reloads

**When to use**: During development and writing blog posts

---

### Build

```bash
pnpm build
```

Builds the application for production.

**What it does:**
- Generates blog data from markdown files
- Generates sitemap from blog posts
- Generates robots.txt with AI crawler rules
- Generates RSS feed
- Generates redirect rules
- Bundles and optimizes code and assets
- Outputs to `dist/` folder

**When to use**: Before deploying or when you want to check production build

---

```bash
pnpm build:prod
```

Alias for `NODE_ENV=production pnpm build` - builds with production optimizations.

**When to use**: Same as `pnpm build`, but ensures production environment

---

### Deploy

```bash
pnpm deploy
```

Builds for production and deploys to GitHub Pages.

**What it does:**
- Runs `pnpm build`
- Pushes the `dist/` folder to the `gh-pages` branch
- GitHub Pages automatically rebuilds and deploys
- Site updates at `https://nick.karnik.io`

**When to use**: When you're ready to publish changes to production

**Note**: Requires Git to be set up and push access to the repository

---

## 🔍 Preview & Testing Commands

### Preview Production Build

```bash
pnpm run preview
```

Builds for production and starts a local preview server.

**What it does:**
- Runs `pnpm build:prod`
- Starts local server at `http://localhost:5173`
- Serves the production build

**When to use**: Before deploying, to verify production build looks correct

---

### Run Unit Tests

```bash
pnpm test
```

Runs all unit tests with coverage report.

**What it does:**
- Runs Vitest in coverage mode
- Tests individual components and functions
- Displays coverage report

**When to use**: When you've made changes and want to verify tests pass

---

```bash
pnpm test:watch
```

Runs unit tests in watch mode (re-runs on file changes).

**When to use**: During development when making changes

---

```bash
pnpm test:unit
```

Runs only unit tests (same as `pnpm test`).

---

### Integration Tests

```bash
pnpm test:integration
```

Runs only integration tests.

**What it does:**
- Tests data fetching and API interactions
- Uses mock server for testing

**When to use**: When testing API interactions and data loading

---

### End-to-End Tests

```bash
pnpm test:e2e
```

Runs E2E tests against a running development server.

**Prerequisites**: Must have `pnpm dev` running in another terminal

**When to use**: Testing complete user flows

---

```bash
pnpm test:e2e:dev
```

Runs E2E tests with automatic development server startup.

**What it does:**
- Automatically starts `pnpm dev`
- Runs E2E tests
- Cleans up when done

**When to use**: Quick E2E testing without manual server management

---

```bash
pnpm test:e2e:dev:port
```

Runs E2E tests with automatic server startup on a specific port.

**When to use**: If port 5173 is already in use

---

```bash
pnpm test:all
```

Runs all test suites: unit, integration, and E2E.

**When to use**: Complete test verification before deploying

---

### Link Validation

```bash
pnpm run test:links
```

Validates all external links on the live website.

**What it does:**
- Crawls `https://nick.karnik.io`
- Checks all links for validity
- Skips known external domains (LinkedIn, Tableau, etc.)

**When to use**: Before deployment to verify no broken links

---

```bash
pnpm run test:links:local
```

Validates links on local production build.

**What it does:**
- Builds the site
- Serves it locally
- Checks all links
- Cleans up after

**When to use**: Quick local link validation without deploying

---

```bash
pnpm run test:links:dist
```

Validates links in the `dist/` folder.

**When to use**: Testing final deployment files

---

## 📚 Utility Commands

### Scripts (Build Utilities)

These are called automatically during build but can be run manually:

```bash
tsx scripts/generate-blog-data.ts
```

Generates `blog-posts.json` from markdown files.

---

```bash
tsx scripts/generate-codementor-reviews.ts
```

Generates reviews data (if configured).

---

```bash
tsx scripts/make-sitemap.ts
```

Generates `sitemap.xml` for SEO.

---

```bash
tsx scripts/generate-robots.ts
```

Generates `robots.txt` with AI crawler rules.

---

```bash
tsx scripts/generate-redirects.ts
```

Generates redirect rules in various formats.

---

```bash
tsx scripts/generate-redirect-html.ts
```

Generates HTML redirect files for GitHub Pages.

---

```bash
tsx scripts/render-static-pages.ts
```

Pre-renders static pages.

---

## 🔄 Workflow Examples

### Writing and Publishing a Blog Post

```bash
# 1. Create and edit article
touch content/blog/my-article.md
# (edit file with your content)

# 2. Test locally
pnpm dev
# Visit http://localhost:5173/blog/my-article

# 3. Make corrections as needed (dev server auto-reloads)

# 4. Build for production
pnpm build

# 5. Preview production build
pnpm run preview
# Visit http://localhost:5173/blog/my-article

# 6. Deploy
pnpm deploy
```

### Making Code Changes

```bash
# 1. Make changes to source code
# (edit .tsx, .ts files)

# 2. Run tests as you develop
pnpm test:watch

# 3. Test in development
pnpm dev
# Visit http://localhost:5173

# 4. Run full test suite
pnpm test:all

# 5. Verify production build
pnpm run preview

# 6. Deploy
pnpm deploy
```

### Pre-Deployment Checklist

```bash
# 1. Run all tests
pnpm test:all

# 2. Check links
pnpm run test:links:local

# 3. Preview production build
pnpm run preview

# 4. Deploy
pnpm deploy
```

---

## 🔧 Environment Variables

Commands can be prefixed with environment variables:

```bash
NODE_ENV=production pnpm build
```

Sets Node environment to production for optimization.

```bash
SITE_URL=https://example.com pnpm build
```

Sets site URL for absolute URLs in generated files.

See [ENVIRONMENT.md](./ENVIRONMENT.md) for details.

---

## 📖 Quick Reference Table

| Command | Purpose | When to Use |
|---------|---------|------------|
| `pnpm dev` | Development server | Writing code/posts |
| `pnpm build` | Production build | Before deployment |
| `pnpm build:prod` | Production build (explicit) | Before deployment |
| `pnpm deploy` | Build + deploy to GitHub Pages | Publishing changes |
| `pnpm run preview` | Preview production locally | Testing before deploy |
| `pnpm test` | Run all tests | Verifying changes |
| `pnpm test:watch` | Tests in watch mode | During development |
| `pnpm test:all` | All test types | Pre-deployment check |
| `pnpm run test:links` | Check all links | Before deployment |

---

## 🆘 Troubleshooting

### Port Already in Use

If you get "port 5173 already in use":

```bash
# Find and kill process
lsof -i :5173
kill -9 <PID>

# Or use different port
PORT=5174 pnpm dev
```

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules dist
pnpm install
pnpm build
```

### Tests Fail

```bash
# Clear test cache
rm -rf .vitest
pnpm test
```

### Deployment Issues

```bash
# Verify build works
pnpm build

# Verify can preview
pnpm run preview

# Check git status
git status

# Check remote
git remote -v
```

---

## 📚 Related Documentation

- [ENVIRONMENT.md](./ENVIRONMENT.md) - Environment configuration
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [ARTICLE_CREATION_GUIDE.md](./ARTICLE_CREATION_GUIDE.md) - Publishing articles
- [BLOG_GUIDE.md](./BLOG_GUIDE.md) - Blog management
