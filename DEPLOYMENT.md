# Deployment Guide for nick.karnik.io

## Production Build

To build for production:

```bash
NODE_ENV=production pnpm build
```

This will:

1. Fetch latest blog posts from Hashnode
2. Build the application for production
3. Output files to `dist/` folder

## Deployment Options

### Option 1: Static Hosting (Recommended)

Deploy the `dist/` folder to any static hosting service:

- **Vercel**: Connect your GitHub repo and deploy
- **Netlify**: Drag and drop the `dist/` folder
- **GitHub Pages**: Push `dist/` contents to `gh-pages` branch
- **Cloudflare Pages**: Connect repo or upload `dist/` folder

### Option 2: Custom Server

If using a custom server, serve the `dist/` folder as static files.

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
- `data/` - Blog data from Hashnode

## Automated Deployment

For automated deployments, you can:

1. Set up GitHub Actions to run `NODE_ENV=production pnpm build` on push
2. Deploy the `dist/` folder to your hosting service
3. Configure your domain to point to the deployed site

## Testing

Before deploying, test locally:

```bash
NODE_ENV=production pnpm build
pnpm run preview
```

Visit `http://localhost:4173` to verify everything works correctly.
