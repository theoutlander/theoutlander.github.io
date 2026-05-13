# Content inventory: live site vs new design (repo)

**Baseline:** [https://nick.karnik.io](https://nick.karnik.io) is treated as the authoritative list of what must exist in production.  
**Captured:** 2026-05-12 (HTTP/RSS/sitemap checks via `/usr/bin/curl` against production).

This document maps each live URL to the **Panda** route/component in this repo and to the **files that supply text/data**. Use it before changing copy or migrating content.

### Deploy alignment (critical)

> **2026-05-13 update:** the content migration described in [`docs/CONTENT_MIGRATION.md`](./CONTENT_MIGRATION.md) has landed in this repository. The repo now contains the **canonical migrated content** (Panda shell on every route, live copy absorbed into Panda pages, résumé rebuilt from 5 → 15 roles, header brand swapped, sitemap extended). **Production still serves the older deploy** until the next push reaches Cloudflare Pages — the gap below is therefore expected to persist until that deploy ships.

A raw HTML fetch of `/` on production does **not** match the current Panda implementation in this repo for shell or home SEO copy:

| Check | Production HTML (snapshot, 2026-05-12) | This repo, post-migration ([`HomePagePanda`](../src/pages/HomePagePanda.tsx), [`__root`](../src/routes/__root.tsx)) |
|-------|---------------------------|-----------------------------------------------------------------------------------------------------|
| Home `<meta name="description">` | `Twenty-five years building software across search, AI, and data. Engineer, builder, dad of three.` | `Twenty-five years building software across search, AI, and developer tools. Engineering leader, writer, cook, dad of three.` (blended in Phase 3) |
| Layout classes | Chakra-style shell (`HeaderSSR`-like header/footer patterns; e.g. sticky header, `bg_white`); **no** `ds-site-nav` / `ds-page` in initial HTML | Panda design system: [`SiteNav`](../src/components/design/SiteNav.tsx) (`ds-site-nav`), `ds-page` content on every route including `/calendar` |

So **live** is still serving an older static/SSR bundle while **this repository** contains the newer Panda design with migrated copy. Blog **slugs and RSS** still line up with [`content/blog/`](../content/blog); the gap is **presentation shell and marketing copy** until a deploy ships the current build.

---

## 1. Live URL coverage

### 1.1 From `sitemap.xml`

Production `sitemap.xml` (same shape as [`scripts/make-sitemap.ts`](../scripts/make-sitemap.ts) output) includes:

| Path | Live HTTP |
|------|-----------|
| `/` | 200 |
| `/blog` | 200 |
| `/about` | 200 |
| `/resume` | 200 |
| `/blog/how-to-tell-if-a-model-is-good-enough` | 200 |
| `/blog/the-modern-attack-surface-how-computers-get-compromised` | 200 |
| `/blog/how-rag-works` | 200 |
| `/blog/build-for-speed` | 200 |
| `/blog/its-not-the-launch-its-the-landing` | 200 |
| `/blog/how-engineers-can-use-ai-effectively` | 200 |

### 1.2 In global nav / footer but **not** in sitemap

[`SiteNav`](../src/components/design/SiteNav.tsx) links: `/blog`, `/about`, `/resume`, `/reviews`, `/kitchen`.  
[`SiteFooter`](../src/components/design/SiteFooter.tsx) index adds `/calendar`. Schedule is not in the top nav.

| Path | Live HTTP | In sitemap |
|------|-----------|------------|
| `/reviews` | 200 | No |
| `/kitchen` | 200 | No |
| `/calendar` | 200 | No |

These routes work on production but are omitted from [`scripts/make-sitemap.ts`](../scripts/make-sitemap.ts) (`baseRoutes` only lists `/`, `/blog`, `/about`, `/resume` plus posts).

### 1.3 RSS and feeds

| Path | Live HTTP | Role |
|------|-----------|------|
| `/rss` | 200 | Channel lists the same six essay URLs as §2 |

### 1.4 Repo-only / optional routes

| Path | Live HTTP | Repo |
|------|-----------|------|
| `/design` | **404** | [`src/routes/design.tsx`](../src/routes/design.tsx) — design system playground; not intended for production discovery |

---

## 2. Blog essays (live RSS / sitemap ↔ repo)

RSS item `<title>` / `<link>` were matched to markdown sources. Visibility follows [`isPostPublicForSite`](../src/lib/content-server.ts): exclude `draft: true`, `published: false`, or calendar dates strictly **after** “today” in UTC when generating public JSON (`scripts/generate-blog-data.ts`).

| Live slug (RSS order) | RSS title | Repo markdown | Public on site |
|----------------------|-----------|----------------|----------------|
| `how-to-tell-if-a-model-is-good-enough` | How to Tell If a Model Is Good Enough | [`content/blog/how-to-tell-if-a-model-is-good-enough.md`](../content/blog/how-to-tell-if-a-model-is-good-enough.md) | Yes |
| `the-modern-attack-surface-how-computers-get-compromised` | The Modern Attack Surface: How Computers Get Compromised | [`content/blog/the-modern-attack-surface-how-computers-get-compromised.md`](../content/blog/the-modern-attack-surface-how-computers-get-compromised.md) | Yes |
| `how-rag-works` | A Practical Way to Think About RAG | [`content/blog/how-rag-works.md`](../content/blog/how-rag-works.md) | Yes |
| `build-for-speed` | How to Build for Speed: What It Actually Takes to Release Fast | [`content/blog/build-for-speed.md`](../content/blog/build-for-speed.md) | Yes |
| `its-not-the-launch-its-the-landing` | It's Not the Launch, It's the Landing | [`content/blog/its-not-the-launch-its-the-landing.md`](../content/blog/its-not-the-launch-its-the-landing.md) | Yes |
| `how-engineers-can-use-ai-effectively` | How Engineers Can Use AI Effectively | [`content/blog/how-engineers-can-use-ai-effectively.md`](../content/blog/how-engineers-can-use-ai-effectively.md) | Yes |

**Not shipped on live listing or JSON** (present on disk only):

| Markdown file | Reason |
|---------------|--------|
| [`content/blog/how-models-output-confidence-scores.md`](../content/blog/how-models-output-confidence-scores.md) | `draft: true` in front matter |

**Pipeline:** `content/blog/*.md` → [`src/lib/content-server.ts`](../src/lib/content-server.ts) → [`scripts/generate-blog-data.ts`](../scripts/generate-blog-data.ts) → [`public/data/blog-posts.json`](../public/data/blog-posts.json) and [`public/data/posts/<slug>.json`](../public/data/posts/). Client routing reads JSON via [`src/lib/content.ts`](../src/lib/content.ts).

**Blog status vs baseline:** **match** — six live essays correspond one-to-one with published markdown files.

---

## 3. Route-by-route: Panda implementation and content source

| Route | Live fingerprint (quick check) | Route file | Panda page | Content/data source | Status vs live baseline |
|-------|--------------------------------|------------|------------|---------------------|-------------------------|
| `/` | `<title>Nick Karnik</title>` | [`src/routes/index.tsx`](../src/routes/index.tsx) | [`HomePagePanda`](../src/pages/HomePagePanda.tsx) | Hero, stats, work blocks, kitchen teaser: **hardcoded** in component; “Recent writing”: **`loadAllBlogPosts()`** → JSON/markdown | **match** (posts subset); marketing copy is TSX-only |
| `/blog` | Writing index | [`src/routes/blog/index.tsx`](../src/routes/blog/index.tsx) | [`BlogPagePanda`](../src/pages/BlogPagePanda.tsx) | Same loader as home | **match** |
| `/blog/:slug` | Per-post title in RSS | [`src/routes/blog/$slug.tsx`](../src/routes/blog/$slug.tsx) | [`BlogPostPagePanda`](../src/pages/BlogPostPagePanda.tsx) | `content/blog/<slug>.md` via loader | **match** for six slugs |
| `/about` | About page | [`src/routes/about.tsx`](../src/routes/about.tsx) | [`AboutPagePanda`](../src/pages/AboutPagePanda.tsx) | **Hardcoded** HTML object in `about.tsx` (not `content/`) | **match** (single source in repo) |
| `/resume` | Résumé | [`src/routes/resume.tsx`](../src/routes/resume.tsx) | [`ResumePagePanda`](../src/pages/ResumePagePanda.tsx) | Roles/projects/education/patents/skills in [`src/data/resume.ts`](../src/data/resume.ts); rendered with Panda idioms | **match** (post-migration: 15 roles, 5 projects, education, patent, grouped skills) |
| `/reviews` | Codementor reviews | [`src/routes/reviews.tsx`](../src/routes/reviews.tsx) | [`ReviewsPagePanda`](../src/pages/ReviewsPagePanda.tsx) | [`public/data/codementor-reviews.json`](../public/data/codementor-reviews.json) (generated by build script) | **match** |
| `/kitchen` | Kitchen page | [`src/routes/kitchen.tsx`](../src/routes/kitchen.tsx) | [`KitchenPagePanda`](../src/pages/KitchenPagePanda.tsx) | **Hardcoded** shell; body shows “Coming soon.” | **partial** — [`HomePagePanda`](../src/pages/HomePagePanda.tsx) still promises “Recipes…” and “Browse recipes →” |
| `/calendar` | `Schedule time with Nick Karnik` | [`src/routes/calendar.tsx`](../src/routes/calendar.tsx) | [`CalendarPagePanda`](../src/pages/CalendarPagePanda.tsx) | Google Calendar embed URL **hardcoded** in TSX; layout now uses `ds-page` shell with `SectionTag` + `ds-h1` + `ds-lede` | **match** (post-migration: legacy [`HeaderSSR`](../src/components/HeaderSSR.tsx) + [`Footer`](../src/components/Footer.tsx) removed; shell now comes from [`__root.tsx`](../src/routes/__root.tsx)) |

**Shell:** In **this repo**, [`src/routes/__root.tsx`](../src/routes/__root.tsx) wraps every route — including [`CalendarPagePanda`](../src/pages/CalendarPagePanda.tsx) — with [`SiteNav`](../src/components/design/SiteNav.tsx) + [`SiteFooter`](../src/components/design/SiteFooter.tsx). The legacy [`HeaderSSR`](../src/components/HeaderSSR.tsx) / [`Footer`](../src/components/Footer.tsx) embeds were removed from `CalendarPagePanda` in Phase 5b, so no Panda route renders duplicate chrome. Production HTML for `/` and `/calendar` still resembles the legacy header/footer pattern only because the older deploy is still live.

**Nav labels:** [`SiteNav`](../src/components/design/SiteNav.tsx) uses the label **Writing** for `/blog`; production HTML snapshots used **Blog** for the same href — treat as another sign deploy output may differ from this branch until verified after release.

---

## 4. Gaps and follow-ups (design / IA)

| Topic | Notes |
|-------|--------|
| **Sitemap completeness** | Add `/reviews`, `/kitchen`, `/calendar` (and optionally `/rss`) to [`scripts/make-sitemap.ts`](../scripts/make-sitemap.ts) if SEO should reflect everything linked in the footer. |
| **Kitchen** | Align home teaser with `/kitchen` reality or add recipe content under `content/` (or another data source) and wire `KitchenPagePanda` to it. |
| **Calendar** | Decide whether to refactor [`CalendarPagePanda`](../src/pages/CalendarPagePanda.tsx) to sit under the same root layout as other Panda pages (single nav/footer story). |
| **Draft post** | Publishing [`how-models-output-confidence-scores.md`](../content/blog/how-models-output-confidence-scores.md) requires removing `draft: true` and rebuilding generated JSON; optional `<!-- build-todo -->` block in the metrics essay ties to that slug. |

---

## 5. Out of scope for this inventory

- Ghost archives under [`content/ghost/`](../content/ghost/) (historical export; not compared to live baseline).
- External properties (e.g. maya.karnik.io) linked from the footer only.

---

## Revision log

| Date | Change |
|------|--------|
| 2026-05-12 | Initial inventory from live sitemap, RSS, HTTP checks, and repo mapping |
| 2026-05-13 | Phase 3–5 migration landed: Panda copy migrated from legacy components (home hero/work blocks, meta description); [`ResumePagePanda`](../src/pages/ResumePagePanda.tsx) rebuilt around 15 roles + 5 projects + education + patents + grouped skills (data extracted to [`src/data/resume.ts`](../src/data/resume.ts)); [`CalendarPagePanda`](../src/pages/CalendarPagePanda.tsx) refactored to `ds-page` Panda shell (legacy `HeaderSSR`/`Footer` removed); header brand swapped from Monogram to profile JPEG via new `BrandMark` in [`Marks.tsx`](../src/components/design/Marks.tsx) (A/B preview on [`/design`](../src/pages/DesignSystemPage.tsx)); blog excerpts cleaned in [`its-not-the-launch-its-the-landing.md`](../content/blog/its-not-the-launch-its-the-landing.md) + [`how-engineers-can-use-ai-effectively.md`](../content/blog/how-engineers-can-use-ai-effectively.md) and JSON regenerated; [`scripts/make-sitemap.ts`](../scripts/make-sitemap.ts) extended with `/reviews`, `/kitchen`, `/calendar`. |
