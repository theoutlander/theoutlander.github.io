# Deployment Guide for nick.karnik.io

## Complete Deployment Workflow

This site is configured for **GitHub Pages** deployment. Here's the complete workflow:

### Quick Deployment (Recommended)

```bash
pnpm deploy
```

This single command:
1. Generates blog data from markdown files
2. Builds the application for production
3. Generates SEO assets (sitemap, robots.txt, RSS feed)
4. Creates redirect files for all configured redirects
5. Pushes the built site to the `gh-pages` branch
6. Your site updates at `https://nick.karnik.io`

### Step-by-Step Manual Deployment

#### Step 1: Build for Production

```bash
NODE_ENV=production pnpm build
```

This will:

1. Generate blog data from markdown files
2. Build the application for production
3. Generate SEO assets (sitemap, robots.txt, RSS feed, redirects)
4. Output files to `dist/` folder

#### Step 2: Preview Production Build

Before deploying to production, verify the build looks correct:

```bash
pnpm run preview
```

This starts a local server at `http://localhost:5173` serving the production build.

**What to check**:
- [ ] All pages load correctly
- [ ] Blog posts display properly
- [ ] Images load correctly
- [ ] Navigation works
- [ ] No console errors

#### Step 3: Deploy to Production

```bash
pnpm deploy
```

This pushes the `dist/` folder to the `gh-pages` branch, which GitHub Pages automatically deploys.

## Hosting Configuration

### Current: GitHub Pages (Configured)

This site is configured to deploy to **GitHub Pages** via the `gh-pages` branch:

```bash
pnpm deploy  # Builds and pushes to gh-pages branch
```

Your site is available at: `https://nick.karnik.io`

### Alternative: Other Static Hosting

If you want to use a different hosting provider, you can deploy the `dist/` folder manually:

- **Vercel**: Connect your GitHub repo and deploy
- **Netlify**: Drag and drop the `dist/` folder
- **Cloudflare Pages**: Connect repo or upload `dist/` folder
- **Custom Server**: Serve the `dist/` folder as static files

## Domain Configuration

Your site will be available at: `https://nick.karnik.io`

Make sure to:

1. Point your domain to your hosting provider
2. Configure SSL certificate
3. Set up redirects if needed

## Build Output

The `dist/` folder contains:

- `index.html` - Main HTML file
- `assets/` - CSS, JS, and other assets
- `data/` - Blog data from markdown files

## Automated Deployment

For automated deployments, you can:

1. Set up GitHub Actions to run `NODE_ENV=production pnpm build` on push
2. Deploy the `dist/` folder to your hosting service
3. Configure your domain to point to the deployed site

## Troubleshooting Deployments

### Build Fails

1. Check that all environment variables are set correctly
2. Verify Node.js version (22+)
3. Clear cache: `rm -rf node_modules && pnpm install`
4. Check console output for specific error messages

### Site Not Updating After Deploy

1. Verify `pnpm deploy` completed successfully
2. Check GitHub Pages settings: Settings → Pages → Source should be `gh-pages` branch
3. Clear browser cache or use incognito mode
4. Wait 1-2 minutes for GitHub Pages to rebuild

### Preview Shows Different from Production

1. Ensure you're testing with `pnpm run preview` (production build)
2. Check environment variables match production settings in `.env.local`
3. Clear `dist/` folder: `rm -rf dist && pnpm build:prod`
