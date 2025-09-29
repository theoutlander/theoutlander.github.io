# Custom Redirects

This project includes custom redirects for social media and external links. The redirects are automatically generated during the build process.

## Redirects Configuration

All redirects are defined in `src/redirects.ts`. To add, modify, or remove redirects:

1. Edit the `redirects` array in `src/redirects.ts`
2. Run `pnpm run redirects` to regenerate the redirect files
3. The redirects will be automatically included in the next build

## Current Redirects

### Social Media

| Source Path      | Destination                                 | Status Code |
| ---------------- | ------------------------------------------- | ----------- |
| `/youtube`       | https://youtube.com/@nick-karnik            | 308         |
| `/yt`            | https://youtube.com/@nick-karnik            | 308         |
| `/linkedin`      | https://linkedin.com/in/theoutlander        | 308         |
| `/li`            | https://linkedin.com/in/theoutlander        | 308         |
| `/github`        | https://github.com/theoutlander             | 308         |
| `/gh`            | https://github.com/theoutlander             | 308         |
| `/twitter`       | https://twitter.com/theoutlander            | 308         |
| `/x`             | https://twitter.com/theoutlander            | 308         |
| `/stackoverflow` | https://stackoverflow.com/users/460472/nick | 308         |
| `/so`            | https://stackoverflow.com/users/460472/nick | 308         |

### Contact & Business

| Source Path   | Destination                      | Status Code |
| ------------- | -------------------------------- | ----------- |
| `/calendar`   | https://calendly.com/nick-karnik | 308         |
| `/email`      | mailto:nick@karnik.io            | 302         |
| `/contact`    | mailto:nick@karnik.io            | 302         |
| `/consulting` | https://plutonic.consulting      | 308         |

### Content & Resources

| Source Path | Destination                                                   | Status Code |
| ----------- | ------------------------------------------------------------- | ----------- |
| `/feed`     | https://nick.karnik.io/rss.xml                                | 308         |
| `/rss`      | https://nick.karnik.io/rss.xml                                | 308         |
| `/resume`   | https://nick.karnik.io/assets/Resume_Nick_Karnik_Sep_2025.pdf | 302         |
| `/cv`       | https://nick.karnik.io/assets/Resume_Nick_Karnik_Sep_2025.pdf | 302         |

## Generated Files

The redirect generation script creates the following files:

- `public/_redirects` - For Netlify and other platforms that support \_redirects
- `dist/_redirects` - For the built site (Netlify, etc.)
- `dist/{path}/index.html` - Individual HTML redirect files for GitHub Pages
- `vercel.json` - For Vercel deployment

## Commands

- `pnpm run redirects` - Generate \_redirects files manually
- `pnpm run redirects:html` - Generate HTML redirect files for GitHub Pages
- `pnpm run build:prod` - Build with redirects included
- `pnpm run deploy` - Build and prepare for deployment

## Status Codes

- **308** - Permanent redirect (recommended for social media links)
- **301** - Moved permanently
- **302** - Found (temporary redirect)

## Hosting Platform Support

- **Netlify**: Uses `_redirects` file
- **Vercel**: Uses `vercel.json` configuration
- **GitHub Pages**: Uses individual HTML redirect files (`dist/{path}/index.html`)
- **Cloudflare Pages**: Uses `_redirects` file

## GitHub Pages Solution

GitHub Pages doesn't natively support `_redirects` files, so this project generates individual HTML redirect files for each redirect path. Each redirect creates a directory with an `index.html` file that:

1. Uses `<meta http-equiv="refresh">` for immediate redirects
2. Includes JavaScript fallback for immediate permanent redirects
3. Provides a user-friendly loading page with manual link
4. Supports both light and dark themes
5. Is SEO-friendly with proper meta tags

The HTML redirect files are automatically generated during the build process and work seamlessly with GitHub Pages.
