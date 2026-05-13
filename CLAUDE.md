# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs blog data generation + full build + vite dev server)
pnpm dev

# Production build (multi-step: blog data → panda codegen → vite build → SSR static render → sitemap/robots/redirects)
pnpm build

# Tests
pnpm test              # unit tests with coverage
pnpm test:watch        # watch mode
pnpm test:integration  # integration tests only
pnpm test:e2e          # e2e (requires dev server running)

# Single test file
pnpm vitest run src/components/blog/__tests__/BlogCard.test.tsx

# Deploy
./scripts/deploy.sh
```

## Architecture

This is a personal site with a **hybrid SPA + static SSR** rendering model. Understanding this dual system is the most important thing to know before making changes.

### Rendering pipeline

1. `scripts/generate-blog-data.ts` reads markdown from `content/blog/*.md` and outputs JSON to `dist/data/`.
2. Vite builds the React SPA bundle.
3. `src/ssr-renderer.tsx` runs via `tsx` post-build, calling `renderToString` on each page component and writing static HTML to `dist/`. These static files are what gets served and indexed.
4. The client JS hydrates the static HTML into a full SPA on load.

When you add a new page, you must: (a) create a route in `src/routes/`, (b) create a page component in `src/pages/`, and (c) add a render call in `src/ssr-renderer.tsx`.

### Two parallel style systems

The codebase has two coexisting styling approaches:

- **Design system** (preferred for new work): CSS custom properties defined in `src/styles/design-system.css` (`--accent`, `--ink`, `--ink-2`, `--paper`, `--rule`, `--gap-*`). Components use these via inline styles or `className="ds-*"` utility classes. All `src/pages/*Panda.tsx` and `src/components/design/` use this system.
- **Panda CSS** (legacy): `css()` calls from `../../styled-system/css/index.mjs`. Used in older components: `Resume.tsx`, `HeroSSR.tsx`, `NameHeader.tsx`. Avoid expanding usage of this system.

### Routing

TanStack Router with file-based routes in `src/routes/`. Routes auto-generate `src/routeTree.gen.ts` — do not edit that file manually. Each route file imports its corresponding page component from `src/pages/`.

### Content and data

- **Blog posts**: Markdown files in `content/blog/*.md` with YAML frontmatter. Processed by `scripts/generate-blog-data.ts` at build time. On the client, posts are loaded from inline JSON injected by the SSR renderer or fetched from `/data/blog-posts.json`.
- **Resume data**: `src/data/resume.ts` — all roles, projects, education, patents, and skills. This is the source of truth for the resume page.
- **Personal identity and bio copy**: `src/data/person.ts` — single source of truth for name, location, site URL, hero lede, about HTML, meta descriptions, and EST year. Import from here; do not hardcode these strings in components.

### Blog content loading

`src/lib/content.ts` handles client-side blog loading with a caching layer. During SSR (`import.meta.env.SSR === true`), it delegates to `src/lib/content-server.ts` which reads markdown from disk. On the client, it reads from inline JSON (`__ALL_POSTS__` / `__POST_DATA__` script tags injected by the SSR renderer) or falls back to fetching `/data/*.json`.

### Key scripts

All in `scripts/`:
- `generate-blog-data.ts` — parses markdown, outputs `dist/data/blog-posts.json` and per-post JSON
- `render-static-pages.ts` — entry point that runs `src/ssr-renderer.tsx`
- `make-sitemap.ts` — generates `dist/sitemap.xml`
- `generate-redirects.ts` / `generate-redirect-html.ts` — handles legacy URL redirects defined in `src/redirects.ts`

### Vite plugins

- `vite-blog-plugin.ts` — serves blog JSON during dev without a full build
- `vite-redirect-plugin.ts` — handles redirects in dev mode
- `vite-maya-dev-plugin.ts` — serves content from the `maya/` directory (local dev tooling)
