# Environment Configuration

This document explains how to configure environment variables for the blog build process.

## Environment Variables

### Required Variables

- `SITE_URL` - Your site's URL (e.g., `https://nick.karnik.io`)

### Optional Variables

- `NODE_ENV` - Node environment (`development` or `production`)

## Local Development

### Option 1: Environment File (Recommended)

Create a `.env.local` file in the project root:

```bash
# .env.local
SITE_URL=http://localhost:5173
NODE_ENV=development
```

### Option 2: Export Variables

```bash
export SITE_URL=http://localhost:5173
export NODE_ENV=development
```

### Option 3: Inline Variables

```bash
SITE_URL=http://localhost:5173 pnpm dev
```

## Production Build

### GitHub Actions (Automatic)

The GitHub Actions workflow automatically sets these variables:

```yaml
env:
  SITE_URL: https://nick.karnik.io
  NODE_ENV: production
```

### Manual Build

```bash
SITE_URL=https://nick.karnik.io NODE_ENV=production pnpm build
```

## Default Values

If environment variables are not set, the following defaults are used:

- `SITE_URL`: `https://nick.karnik.io`
- `NODE_ENV`: `production`

## Scripts

- `pnpm prebuild` - Generates blog data from markdown files
- `pnpm build` - Builds the application
- `pnpm postbuild` - Generates sitemap
- `NODE_ENV=production pnpm build` - Runs all build steps for production
- `pnpm dev` - Starts development server

## Troubleshooting

### Blog Content Not Loading

1. Check that markdown files exist in `content/blog/`
2. Verify that `pnpm prebuild` completed successfully
3. Check that `public/data/blog-posts.json` exists

### Sitemap Issues

1. Verify `SITE_URL` is set correctly
2. Check that the build completed successfully
3. Ensure `public/data/blog-posts.json` exists

### Build Failures

1. Check all environment variables are set
2. Verify Node.js version (22+)
3. Clear `node_modules` and reinstall: `rm -rf node_modules && pnpm install`
