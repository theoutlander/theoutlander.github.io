# Environment Configuration

This document explains how to configure environment variables for the blog build process.

## Environment Variables

### Required Variables

- `HASHNODE_HOST` - Your Hashnode subdomain (e.g., `theoutlander.hashnode.dev`)
- `SITE_URL` - Your site's URL (e.g., `https://nick.karnik.io`)

### Optional Variables

- `NODE_ENV` - Node environment (`development` or `production`)

## Local Development

### Option 1: Environment File (Recommended)

Create a `.env.local` file in the project root:

```bash
# .env.local
HASHNODE_HOST=theoutlander.hashnode.dev
SITE_URL=http://localhost:5173
NODE_ENV=development
```

### Option 2: Export Variables

```bash
export HASHNODE_HOST=theoutlander.hashnode.dev
export SITE_URL=http://localhost:5173
export NODE_ENV=development
```

### Option 3: Inline Variables

```bash
HASHNODE_HOST=theoutlander.hashnode.dev SITE_URL=http://localhost:5173 pnpm dev
```

## Production Build

### GitHub Actions (Automatic)

The GitHub Actions workflow automatically sets these variables:

```yaml
env:
  HASHNODE_HOST: theoutlander.hashnode.dev
  SITE_URL: https://nick.karnik.io
  NODE_ENV: production
```

### Manual Build

```bash
HASHNODE_HOST=theoutlander.hashnode.dev SITE_URL=https://nick.karnik.io NODE_ENV=production pnpm build:prod
```

## Default Values

If environment variables are not set, the following defaults are used:

- `HASHNODE_HOST`: `theoutlander.hashnode.dev`
- `SITE_URL`: `https://nick.karnik.io`
- `NODE_ENV`: `production`

## Scripts

- `pnpm prebuild` - Fetches content from Hashnode
- `pnpm build` - Builds the application
- `pnpm postbuild` - Generates sitemap
- `pnpm build:prod` - Runs all build steps
- `pnpm dev` - Starts development server

## Troubleshooting

### Hashnode Content Not Loading

1. Check that `HASHNODE_HOST` is correct
2. Verify your Hashnode publication exists
3. Check network connectivity

### Sitemap Issues

1. Verify `SITE_URL` is set correctly
2. Check that the build completed successfully
3. Ensure `public/data/hashnode.json` exists

### Build Failures

1. Check all environment variables are set
2. Verify Node.js version (22+)
3. Clear `node_modules` and reinstall: `rm -rf node_modules && pnpm install`
