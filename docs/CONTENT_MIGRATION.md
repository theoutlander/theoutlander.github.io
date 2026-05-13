# Content migration: per-route copy verdicts

**Source of truth for "live today"** in this document is the previous, pre-Panda components still in this repository. Production was built from an earlier deploy of this same repo, so these files hold the canonical live copy and have **not** been scraped from the network.

| Route | "Live today" source files |
|-------|---------------------------|
| `/` | [`src/components/HeroSSR.tsx`](../src/components/HeroSSR.tsx), [`src/components/CoreCompetencies.tsx`](../src/components/CoreCompetencies.tsx), [`src/components/RecentWriting.tsx`](../src/components/RecentWriting.tsx) |
| `/about` | [`public/data/pages/about.json`](../public/data/pages/about.json) (also mirrored in [`src/routes/about.tsx`](../src/routes/about.tsx)) |
| `/resume` | [`src/components/Resume.tsx`](../src/components/Resume.tsx) (15 roles, 5 projects, education, patent, grouped skills, TED + patent links) |
| `/reviews` | [`src/components/CodementorReviews.tsx`](../src/components/CodementorReviews.tsx) + [`public/data/codementor-reviews.json`](../public/data/codementor-reviews.json) |
| `/kitchen` | n/a (live has no recipes) |
| `/calendar` | n/a (live had legacy `HeaderSSR` + `Footer` shell only) |
| `/blog` | [`src/components/BlogList`](../src/components) chrome + [`public/data/blog-posts.json`](../public/data/blog-posts.json) (data driven) |

Verdict legend: `keep-repo` · `replace-with-live` · `blend` · `new` (introduced by this migration).

---

## `/` — Home

Target file: [`src/pages/HomePagePanda.tsx`](../src/pages/HomePagePanda.tsx).

| Section | Repo today (Panda) | Live today (legacy) | Verdict | Final string |
|---------|---------------------|----------------------|---------|--------------|
| `<title>` | `Nick Karnik` | `Nick Karnik` | keep-repo | `Nick Karnik` |
| Meta description | `Engineering leader. Writer. Occasional cook. Twenty-five years building software across AI, search, and developer tools.` | `Twenty-five years building software across search, AI, and data. Engineer, builder, dad of three.` | blend | `Twenty-five years building software across search, AI, and developer tools. Engineering leader, writer, cook, dad of three.` |
| Hero eyebrow | `§ 00 Engineering · Writing · Cooking` | n/a (HeroSSR has none) | keep-repo | unchanged |
| Hero H1 | `Nick / Karnik.` (serif display) | `Nick Karnik` (NameHeader visual treatment) | keep-repo | unchanged |
| Hero lede | `Lead Software Engineer at PitchBook. Previously Google, Microsoft, Tableau, Salesforce. This site is where I write about engineering, leadership, and what I cook on weekends.` | `Twenty-five years of building software across search engines, disease models, data platforms, and AI tools. Serious about cooking, cocktails, travel, and building games with my three kids. Still figuring out what comes next and building it anyway.` | replace-with-live | `Twenty-five years of building software across search engines, disease models, data platforms, and AI tools. Serious about cooking, cocktails, travel, and building games with my three kids. Still figuring out what comes next and building it anyway.` |
| Hero CTAs | `Read the writing →`, `The Résumé` | n/a | keep-repo | unchanged |
| STAT 1 | `25+ · Years building software` | n/a (legacy has no stats strip) | keep-repo | unchanged |
| STAT 2 | `10+ · Years leading engineers` | n/a | keep-repo | unchanged |
| STAT 3 | `100+ · Engineers hired or grown` | n/a | keep-repo | unchanged |
| STAT 4 | `3 · Products shipped at scale` | n/a | keep-repo | unchanged |
| `Work` section eyebrow | `02 Work` (SectionTag) | `What I Work On` (CoreCompetencies H2) | blend | SectionTag `02 What I work on` |
| Work block 1 | `Engineering Leadership` / `Scaling teams. Hiring, performance, mentoring, the day-to-day craft of running a strong org.` | `AI and Developer Tools` / `Built Gemini Code Assist at Google. Writing about what I learned building it.` | replace-with-live | `AI and Developer Tools` / `Built Gemini Code Assist at Google. Writing about what I learned building it.` |
| Work block 2 | `AI & Developer Platforms` / `Shipping AI into developer tools. Eval, retrieval, model integration, IDE surfaces.` | `Search and Relevance` / `Six years on Bing search at Microsoft. A patent. A lot of labeled data.` | replace-with-live | `Search and Relevance` / `Six years on Bing search at Microsoft. A patent. A lot of labeled data.` |
| Work block 3 | `Technical Strategy` / `Roadmaps, architecture review, and the executive narrative around both.` | `Making Things` / `Currently building new tools. Making games with my three kids. Always something cooking.` | replace-with-live | `Making Things` / `Currently building new tools. Making games with my three kids. Always something cooking.` |
| Work block 4 | _absent_ | `Engineering Leadership` / `Led teams at Google, Microsoft, Tableau, and T-Mobile. Hired and scaled engineering organizations.` | replace-with-live | `Engineering Leadership` / `Led teams at Google, Microsoft, Tableau, and T-Mobile. Hired and scaled engineering organizations.` |
| Work grid columns | 3 | 4 (legacy `CoreCompetencies` uses 2×2) | replace-with-live | Use 4 blocks; render as `repeat(2, 1fr)` to keep parity with live |
| Margin note (Advisory) | `Advisory work runs through Plutonic Consulting: strategy, team review, and technical due diligence. Limited slots each quarter.` | n/a | keep-repo | unchanged |
| Recent writing heading | SectionTag `01 Recent writing · All essays →` | `Recent Writing` (RecentWriting H2) | keep-repo | unchanged (SectionTag form is the Panda idiom) |
| Recent writing rows | Top 3 posts from `loadAllBlogPosts()` | Top 3 posts (same source) | keep-repo | unchanged |
| Kitchen teaser eyebrow | `§ 03 The Kitchen` | n/a | keep-repo | unchanged |
| Kitchen teaser H2 | `The Kitchen.` | n/a | keep-repo | unchanged |
| Kitchen teaser lede | `Recipes for cooking, baking, and cocktails. Versioned, with notes on what changed between iterations.` | n/a | keep-repo | unchanged |
| Kitchen teaser CTA | `Browse recipes →` | n/a | keep-repo | unchanged |

---

## `/about` — About

Target file: [`src/routes/about.tsx`](../src/routes/about.tsx) (passes `aboutData.html` into [`AboutPagePanda`](../src/pages/AboutPagePanda.tsx)).

| Section | Repo today | Live today | Verdict | Final string |
|---------|-------------|-------------|---------|--------------|
| `<title>` | `Nick Karnik \| About` | `Nick Karnik \| About` | keep-repo | unchanged |
| Meta description | `Engineering leader. Writer. Twenty-five years building software across search, AI, and data.` | same | keep-repo | unchanged |
| Section tag | `01 About · Bellevue, WA` | n/a | keep-repo | unchanged |
| Side dateline | `Currently · May 2026` | n/a | keep-repo | unchanged |
| Side blurb | `Lead Software Engineer at PitchBook. Writing about engineering and what I'm learning. Cooking, baking, and experimenting in the kitchen.` | n/a | keep-repo | unchanged |
| Featured work blurb | `Geospatial visualization of epidemiological modeling, featured in this TED Talk by Bill Gates.` | _(legacy lived in resume)_ | keep-repo | unchanged |
| Patents block | `US 8,918,354 — Intelligent intent detection from social network messages` / `Granted 2014 · Active until 2032` | same patent | keep-repo | unchanged |
| Body H1 | `About` | `About` | keep-repo | unchanged |
| Body P1 | `Twenty-five years of building software. Search engines, disease models, data platforms, AI tools. Not linear, not planned, all of it real.` | identical (sourced from `public/data/pages/about.json`) | keep-repo | unchanged |
| Body P2 | `At Microsoft I spent six years on Bing search ... At Google I led Gemini Code Assist from inception to millions of developers.` | identical | keep-repo | unchanged |
| Body P3 | `I cook seriously, make cocktails, travel when I can, and build games with my three kids.` | identical | keep-repo | unchanged |
| Body P4 | `Still figuring out what comes next and building it anyway.` | identical | keep-repo | unchanged |

About is already canonical. No edits needed in Phase 3.

---

## `/resume` — Résumé

Target file: [`src/pages/ResumePagePanda.tsx`](../src/pages/ResumePagePanda.tsx).

Verdict for the route as a whole: **replace-with-live** — the rich [`Resume.tsx`](../src/components/Resume.tsx) content is the canonical résumé and must be absorbed into the Panda page. Layout idioms (`ds-page`, `SectionTag`, serif headings, mono dateline, accent ticks) are preserved. Data is extracted to [`src/data/resume.ts`](../src/data/resume.ts) to keep the page file small.

### Summary section

| Section | Repo today | Live today | Verdict | Final string |
|---------|-------------|-------------|---------|--------------|
| `<title>` | `Nick Karnik \| Résumé` | same | keep-repo | unchanged |
| Meta description | `Software engineer and engineering leader with 25 years across Google, Microsoft, Salesforce, and startups.` | live emphasises Bing/IDM/Tableau/Gemini story | blend | `Software engineer and engineering leader. Twenty-five years across Google (Gemini Code Assist), Microsoft (Bing), Tableau, Salesforce, and earlier startups.` |
| Top contact line | `nick@karnik.io · Bellevue, WA` | LinkedIn/GitHub/Email/Resume PDF buttons in `NameHeader` | blend | Keep `nick@karnik.io · Bellevue, WA` mono lockup; add Download PDF CTA in the SectionTag right slot (already present) |
| Summary paragraph | _none_ | `Twenty-five years building software across search, data, and AI. At Microsoft I spent six years on Bing search building relevance systems, data pipelines, and ML classifiers. At the Institute for Disease Modeling I built epidemiological software featured in a Bill Gates TED Talk. At Tableau I led the data connectivity platform. At Google I led Gemini Code Assist from inception to adoption by millions of developers.` | new (replace-with-live) | adopt verbatim as a new Summary block above Experience |

### Experience — expand from 5 → 15 roles

Verdict for every row: **replace-with-live**. All 15 entries come from `Resume.tsx#experience`, including the TED Talk link in the IDM blurb and the patent link in the Microsoft blurb.

| # | Years | Company | Role | Tags |
|---|-------|---------|------|------|
| 1 | Mar 2026 — Present | PitchBook (Morningstar) | Lead Software Engineer | Data Infrastructure, Search, FinTech |
| 2 | May 2022 — Apr 2025 | Google | Engineering Manager (Gemini Code Assist) | Go, TypeScript, Node.js, Kubernetes, GCP, LLM |
| 3 | Apr 2020 — Apr 2022 | Salesforce | Senior Engineering Manager | TypeScript, Node.js, Chromium, CI/CD, Team Leadership |
| 4 | Oct 2019 — Apr 2020 | Tableau | Senior Engineering Manager | TypeScript, Node.js, Chromium, CI/CD, Team Leadership |
| 5 | Nov 2018 — Oct 2019 | T-Mobile | Director of Engineering | Team Leadership, Rapid Hiring, Mobile Development, Test Automation |
| 6 | Mar 2018 — Nov 2018 | Fullstack Consulting | Principal / Founder | React Native, GraphQL, Training, Consulting, Mobile Apps |
| 7 | Sep 2017 — Mar 2018 | Treasure Technologies | CTO | FinTech, Plaid API, Banking Integration, Technical Leadership |
| 8 | Apr 2017 — Aug 2017 | Jobbatical | CTO | Microservices, CI/CD, Platform Architecture, DevOps |
| 9 | Sep 2012 — Oct 2016 | Institute for Disease Modeling (Gates Foundation) | Senior Software Engineer (includes TED Talk link) | Data Visualization, Simulation, Global Health, Scientific Computing |
| 10 | Aug 2006 — Aug 2012 | Microsoft | Software Development Engineer (includes patent link) | Big Data, JavaScript, Machine Learning, Outlook Web Access, Bing |
| 11 | Nov 2005 — Aug 2006 | COMPASS Technologies | Lead Software Engineer | C++, C#, TCP/IP, Distributed Systems, Team Leadership |
| 12 | Jul 2003 — Oct 2003 | Blue Hippo Funding | Software Engineer | VB.NET, C#, ASP.NET, SQL Server, CRM Systems |
| 13 | Jan 2002 — Jul 2003 | The Globalist | Software Engineer | C#, SQL Server, Outlook Integration, Crystal Reports, XML Web Services |
| 14 | May 2000 — May 2001 | Meds Publishing | Web Application Developer | VB 6, ASP, Web Development, Application Migration |
| 15 | Oct 1999 — May 2000 | University of Maryland | Web Developer | ASP, Access 2000, Web Development, Database Design |

Each row preserves its blurb verbatim from `Resume.tsx`. The IDM blurb retains the TED-talk anchor; the Microsoft blurb retains the patent anchor. Company logos render via the existing [`CompanyLogo`](../src/components/CompanyLogo.tsx) component.

### Notable Projects (NEW section in Panda page)

Verdict: **replace-with-live / new**. Sourced from `Resume.tsx#projects` (5 entries).

| Project | Company | Years | Linked? |
|---------|---------|-------|---------|
| Gemini Code Assist | Google | 2022 – 2025 | Yes → `https://codeassist.google/` |
| TACO Toolkit & Connector SDK | Tableau (Salesforce) | 2019 – 2022 | Yes → Tableau docs page |
| Disease Modeling Tools | Institute for Disease Modeling (Gates Foundation) | 2012 – 2016 | Yes → `https://www.idmod.org/tools/`; TED-talk link inside description |
| Videoly Platform | Videoly | 2007 – 2009 | No (text only) |
| RoomToday Platform | RoomToday | 2014 – 2016 | No (text only) |

### Education (NEW section)

| Field | Value |
|-------|-------|
| Institution | University of Maryland (with link to `https://www.umd.edu` and `umd` logo) |
| Degree | B.S., Computer Science |
| Location | University of Maryland, College Park |
| Minor | Business |

### Patents (NEW section)

| Field | Value |
|-------|-------|
| Title | `US Patent 8,918,354` |
| Subtitle | `Intelligent intent detection from social network messages` |
| Status line | `Granted 2014 · Active until 2032` |
| Link | `https://patents.google.com/patent/US8918354B2/en` |

### Skills — replace flat list with grouped object

Repo today: 6 flat skill rows. **Replace** with the grouped object from `Resume.tsx#skills`:

| Group | Skills |
|-------|--------|
| Languages | TypeScript, JavaScript, Python, C#, Go, C++, Java |
| Web & Mobile | NodeJS, Electron, Express, React, React Native, GraphQL, Playwright, VSCode Extensions |
| Databases & Cloud | MongoDB, Docker, ElasticSearch, Neo4J, PostgreSQL, Redis, SQL Server, AWS, Google Cloud |
| AI & Leadership | AI-Assisted Development, Large Language Models, Team Scaling, DX |

No section from the legacy résumé is dropped.

---

## `/reviews` — Reviews

Target file: [`src/pages/ReviewsPagePanda.tsx`](../src/pages/ReviewsPagePanda.tsx). Card data continues to come from [`public/data/codementor-reviews.json`](../public/data/codementor-reviews.json).

| Section | Repo today | Live today | Verdict | Final string |
|---------|-------------|-------------|---------|--------------|
| `<title>` | `Nick Karnik \| Reviews` | same | keep-repo | unchanged |
| Meta description | `Reviews from people I have mentored and worked with.` | same | keep-repo | unchanged |
| SectionTag | `01 Mentoring reviews · via Codementor` | n/a (legacy had no SectionTag) | keep-repo | unchanged |
| H1 | `What people say after we actually work together.` | legacy used a generic page header | keep-repo | unchanged |
| Lede | `Reviews from mentoring sessions on Codementor. Unedited.` | n/a | keep-repo | unchanged |
| Empty state | `No reviews yet.` | `No reviews available at this time.` | keep-repo | unchanged |

---

## `/kitchen` — The Kitchen

Target file: [`src/pages/KitchenPagePanda.tsx`](../src/pages/KitchenPagePanda.tsx).

| Section | Repo today | Live today | Verdict | Final string |
|---------|-------------|-------------|---------|--------------|
| `<title>` | `Nick Karnik \| The Kitchen` | same | keep-repo | unchanged |
| Meta description | `Recipes for cooking, baking, and cocktails. Versioned, with notes on what changed between iterations.` | same | keep-repo | unchanged |
| SectionTag | `01 The Kitchen · A weekend logbook` | n/a | keep-repo | unchanged |
| H1 | `The Kitchen.` (with italic accent) | same | keep-repo | unchanged |
| Lede | `A logbook of dinners, bread, and cocktails. Written like a software engineer would — measurements, ratios, and notes from each iteration.` | n/a | keep-repo | unchanged |
| Category chips | `All`, `Cooking`, `Baking`, `Cocktails` | same | keep-repo | unchanged |
| Body state | `Coming soon.` | live has no recipes | keep-repo | unchanged |

---

## `/calendar` — Schedule

Target file: [`src/pages/CalendarPagePanda.tsx`](../src/pages/CalendarPagePanda.tsx).

| Section | Repo today | Live today | Verdict | Final string |
|---------|-------------|-------------|---------|--------------|
| `<title>` | `Schedule time with Nick Karnik` | same | keep-repo | unchanged |
| Meta description | `Book time with Nick directly via Google Calendar appointments.` | same | keep-repo | unchanged |
| SectionTag | _absent_ | n/a | new | `01 Schedule · via Google Calendar` |
| H1 | `Schedule a call` | same | keep-repo | unchanged |
| Instruction copy | `Pick a time that works for you. Prefer a new tab? Open in Google Calendar.` | same | keep-repo | unchanged (rendered with Panda idioms) |
| Shell | embeds legacy `HeaderSSR` + `Footer` | legacy chrome | replace-with-live (Phase 5b) | wrap in `ds-page ds-page-fade`; remove `HeaderSSR`/`Footer`; let `__root.tsx` supply `SiteNav`/`SiteFooter` |
| Layout CSS | Chakra-style `css()` + `container()` calls | n/a | replace-with-live (Phase 5b) | inline styles consistent with other Panda pages |

---

## `/blog` — Writing

Target file: [`src/pages/BlogPagePanda.tsx`](../src/pages/BlogPagePanda.tsx).

| Section | Repo today | Live today | Verdict | Final string |
|---------|-------------|-------------|---------|--------------|
| `<title>` | `Nick Karnik \| Writing` | same | keep-repo | unchanged |
| Meta description | `Writing about AI, engineering leadership, developer tools, and what I learn building software.` | same | keep-repo | unchanged |
| SectionTag eyebrow | `01 Writing · {N} essays · since 2018` | n/a | keep-repo | unchanged |
| H1 | `Writing about what I know, from someone who built it.` | n/a | keep-repo | unchanged |
| Lede | `No schedule, no cadence. Just things worth writing down.` | n/a | keep-repo | unchanged |
| Index rows | from `public/data/blog-posts.json` | same | keep-repo | unchanged |

Blog list rows come from the JSON pipeline (out of scope; Phase 4 worker).

---

## Summary of files this migration edits

| File | Why |
|------|-----|
| [`src/pages/HomePagePanda.tsx`](../src/pages/HomePagePanda.tsx) | Hero lede, work blocks (3 → 4), section label, meta description |
| [`src/pages/ResumePagePanda.tsx`](../src/pages/ResumePagePanda.tsx) | Rebuild around 15 roles + 5 projects + education + patents + grouped skills |
| [`src/data/resume.ts`](../src/data/resume.ts) | New file — data for ResumePagePanda (kept small/focused) |
| [`src/pages/CalendarPagePanda.tsx`](../src/pages/CalendarPagePanda.tsx) | Drop legacy chrome; switch to `ds-page` shell |
| [`scripts/make-sitemap.ts`](../scripts/make-sitemap.ts) | Extend `baseRoutes` with `/reviews`, `/kitchen`, `/calendar` |

Pages **not** edited: BlogPagePanda, AboutPagePanda, ReviewsPagePanda, KitchenPagePanda, the about route.
