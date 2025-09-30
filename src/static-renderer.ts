import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

type Post = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  url: string;
  date: string;
  cover: string;
  tags: string[];
};

type AboutData = {
  title: string;
  html: string;
};

// Static renderer - no React dependencies needed

// Generate CSS styles for Chakra UI
const generateChakraStyles = () => {
  return `
    <style>
      /* Chakra UI Reset and Base Styles */
      *, *::before, *::after {
        box-sizing: border-box;
      }
      
      html {
        line-height: 1.15;
        -webkit-text-size-adjust: 100%;
      }
      
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background-color: #f7fafc;
        color: #1a202c;
      }
      
      /* Chakra UI Component Styles */
      .chakra-ui-light {
        color-scheme: light;
      }
      
      /* Box component styles */
      .css-box {
        display: block;
      }
      
      /* Container styles */
      .css-container {
        width: 100%;
        margin-left: auto;
        margin-right: auto;
        padding-left: 1rem;
        padding-right: 1rem;
        max-width: 1200px;
      }
      
      /* Flex styles */
      .css-flex {
        display: flex;
      }
      
      .css-flex-column {
        flex-direction: column;
      }
      
      .css-align-center {
        align-items: center;
      }
      
      .css-justify-between {
        justify-content: space-between;
      }
      
      .css-justify-center {
        justify-content: center;
      }
      
      /* HStack styles */
      .css-hstack {
        display: flex;
        align-items: center;
        gap: 1.5rem;
      }
      
      /* Heading styles */
      .css-heading {
        font-weight: 600;
        line-height: 1.2;
        color: #1a202c;
      }
      
      .css-heading-lg {
        font-size: 2.25rem;
        line-height: 1.2;
      }
      
      .css-heading-md {
        font-size: 1.5rem;
        line-height: 1.2;
      }
      
      .css-heading-sm {
        font-size: 1.25rem;
        line-height: 1.2;
      }
      
      /* Text styles */
      .css-text {
        color: #4a5568;
        line-height: 1.5;
      }
      
      .css-text-lg {
        font-size: 1.125rem;
        line-height: 1.5;
      }
      
      .css-text-sm {
        font-size: 0.875rem;
        line-height: 1.5;
      }
      
      /* Link styles */
      .css-link {
        color: #3182ce;
        text-decoration: none;
        transition: color 0.2s;
      }
      
      .css-link:hover {
        color: #2c5282;
        text-decoration: underline;
      }
      
      /* Button styles */
      .css-button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s;
        border: 1px solid transparent;
        cursor: pointer;
      }
      
      .css-button-primary {
        background-color: #3182ce;
        color: white;
        border-color: #3182ce;
      }
      
      .css-button-primary:hover {
        background-color: #2c5282;
        border-color: #2c5282;
        color: white;
        text-decoration: none;
      }
      
      .css-button-secondary {
        background-color: white;
        color: #1a202c;
        border-color: #e2e8f0;
      }
      
      .css-button-secondary:hover {
        background-color: #f7fafc;
        border-color: #cbd5e0;
        color: #1a202c;
        text-decoration: none;
      }
      
      /* Card styles */
      .css-card {
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        overflow: hidden;
      }
      
      .css-card-body {
        padding: 1rem;
      }
      
      /* Grid styles */
      .css-grid {
        display: grid;
      }
      
      .css-grid-cols-1 {
        grid-template-columns: repeat(1, minmax(0, 1fr));
      }
      
      .css-grid-cols-2 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      
      .css-grid-cols-3 {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
      
      .css-grid-auto-fit {
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      }
      
      .css-gap-4 {
        gap: 1rem;
      }
      
      .css-gap-6 {
        gap: 1.5rem;
      }
      
      .css-gap-8 {
        gap: 2rem;
      }
      
      /* Spacing utilities */
      .css-p-4 { padding: 1rem; }
      .css-p-6 { padding: 1.5rem; }
      .css-p-8 { padding: 2rem; }
      .css-py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
      .css-py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
      .css-py-8 { padding-top: 2rem; padding-bottom: 2rem; }
      .css-px-4 { padding-left: 1rem; padding-right: 1rem; }
      .css-px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
      
      .css-mb-4 { margin-bottom: 1rem; }
      .css-mb-6 { margin-bottom: 1.5rem; }
      .css-mb-8 { margin-bottom: 2rem; }
      .css-mt-4 { margin-top: 1rem; }
      .css-mt-6 { margin-top: 1.5rem; }
      .css-mt-8 { margin-top: 2rem; }
      
      /* Responsive utilities */
      @media (min-width: 768px) {
        .css-md\\:grid-cols-2 {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        .css-md\\:py-10 {
          padding-top: 2.5rem;
          padding-bottom: 2.5rem;
        }
      }
      
      /* Layout specific styles */
      .css-header {
        position: sticky;
        top: 0;
        z-index: 10;
        background: white;
        border-bottom: 1px solid #e2e8f0;
        backdrop-filter: saturate(180%) blur(8px);
      }
      
      .css-main {
        min-height: 100vh;
        background-color: #f7fafc;
      }
      
      /* Hero section styles */
      .css-hero {
        padding: 4rem 0;
        background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        border-radius: 1.5rem;
        margin-bottom: 4rem;
        position: relative;
        overflow: hidden;
      }
      
      .css-hero-bg-1 {
        position: absolute;
        top: -50%;
        right: -20%;
        width: 300px;
        height: 300px;
        background: #bee3f8;
        border-radius: 50%;
        opacity: 0.3;
      }
      
      .css-hero-bg-2 {
        position: absolute;
        bottom: -30%;
        left: -10%;
        width: 200px;
        height: 200px;
        background: #e9d8fd;
        border-radius: 50%;
        opacity: 0.2;
      }
      
      /* Tag styles */
      .css-tag {
        background: #edf2f7;
        color: #4a5568;
        padding: 0.25rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.75rem;
        font-weight: 500;
      }
      
      .css-tag-primary {
        background: #3182ce;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
      }
      
      /* Avatar styles */
      .css-avatar {
        width: 4rem;
        height: 4rem;
        border-radius: 50%;
        background: #3182ce;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 1.5rem;
      }
      
      .css-avatar-lg {
        width: 8rem;
        height: 8rem;
        font-size: 3rem;
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        border: 4px solid white;
      }
      
      /* Stats card styles */
      .css-stats-card {
        border: 1px solid #e2e8f0;
        padding: 2rem;
        border-radius: 1rem;
        text-align: center;
        transition: all 0.2s;
      }
      
      .css-stats-number {
        font-size: 2.25rem;
        font-weight: bold;
        margin: 0 0 0.25rem 0;
      }
      
      .css-stats-label {
        font-size: 0.875rem;
        color: #718096;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }
      
      .css-stats-description {
        font-size: 0.875rem;
        color: #718096;
        margin: 0;
      }
      
      /* Blog card styles */
      .css-blog-card {
        border-radius: 1rem;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
        transition: all 0.2s;
      }
      
      .css-blog-card:hover {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        transform: translateY(-2px);
      }
      
      .css-blog-image {
        object-fit: cover;
        max-height: 260px;
        width: 100%;
      }
      
      .css-blog-title {
        font-weight: 600;
        font-size: 1.125rem;
        color: #2b6cb0;
        margin: 0 0 0.25rem 0;
        text-decoration: none;
      }
      
      .css-blog-title:hover {
        color: #2c5282;
        text-decoration: underline;
      }
      
      .css-blog-meta {
        font-size: 0.875rem;
        color: #718096;
        margin: 0.25rem 0 0.75rem 0;
      }
      
      .css-blog-excerpt {
        margin: 0.75rem 0 0 0;
        color: #1a202c;
        line-height: 1.6;
      }
      
      /* Contact card styles */
      .css-contact-card {
        border: 1px solid #e2e8f0;
        padding: 1rem;
        border-radius: 1rem;
        margin-bottom: 1rem;
      }
      
      .css-contact-title {
        font-size: 0.875rem;
        margin-bottom: 0.75rem;
        color: #1a202c;
      }
      
      .css-contact-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        text-decoration: none;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;
      }
      
      .css-contact-button-primary {
        background: #3182ce;
        color: white;
      }
      
      .css-contact-button-secondary {
        border: 1px solid #e2e8f0;
        color: #1a202c;
      }
      
      .css-contact-button-outline {
        border: 1px solid #3182ce;
        color: #3182ce;
      }
      
      /* Focus card styles */
      .css-focus-card {
        border: 1px solid #e2e8f0;
        padding: 1rem;
        border-radius: 1rem;
        margin-bottom: 1rem;
      }
      
      .css-focus-title {
        font-size: 0.875rem;
        margin-bottom: 0.75rem;
        color: #1a202c;
      }
      
      .css-focus-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      
      .css-focus-divider {
        border: none;
        border-top: 1px solid #e2e8f0;
        margin: 0.75rem 0;
      }
      
      .css-focus-description {
        font-size: 0.875rem;
        color: #718096;
        margin: 0;
        line-height: 1.5;
      }
      
      /* Currently card styles */
      .css-currently-card {
        border: 1px solid #e2e8f0;
        padding: 1rem;
        border-radius: 1rem;
      }
      
      .css-currently-title {
        font-size: 0.875rem;
        margin-bottom: 0.75rem;
        color: #1a202c;
      }
      
      .css-currently-item {
        font-size: 0.875rem;
        margin: 0;
        color: #1a202c;
      }
      
      /* Responsive design */
      @media (max-width: 768px) {
        .css-hero {
          padding: 2rem 0;
        }
        
        .css-hero-content {
          grid-template-columns: 1fr;
          gap: 2rem;
        }
        
        .css-stats-grid {
          grid-template-columns: 1fr;
        }
        
        .css-blog-grid {
          grid-template-columns: 1fr;
        }
        
        .css-about-layout {
          grid-template-columns: 1fr;
        }
      }
    </style>
  `;
};

// Generate the base HTML template
const generateBaseHTML = (
  title: string,
  description: string,
  content: string,
  additionalHead?: string
) => {
  return `<!doctype html>
<html lang="en" class="chakra-ui-light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests" />
    
    <!-- SEO Meta Tags -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://nick.karnik.io" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    
    <!-- RSS Feed -->
    <link rel="alternate" type="application/rss+xml" title="RSS" href="/rss" />
    
    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-62FC7BDSGJ"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      gtag('js', new Date());
      gtag('config', 'G-62FC7BDSGJ');
    </script>
    
    ${additionalHead || ''}
    
    <!-- Inline CSS -->
    ${generateChakraStyles()}
  </head>
  <body>
    <div id="root">
      ${content}
    </div>
  </body>
</html>`;
};

// Generate home page content
const generateHomePageContent = (posts: Post[]) => {
  const latestPosts = posts.slice(0, 2);

  return `
    <!-- Header -->
    <header class="css-header">
      <div class="css-container css-py-3">
        <div class="css-flex css-align-center css-justify-between css-gap-6">
          <a href="/" class="css-link">
            <h1 class="css-heading css-heading-md" style="color: #1a202c; margin: 0;">Nick Karnik</h1>
          </a>
          <div class="css-hstack">
            <a href="/blog" class="css-link">Blog</a>
            <a href="/about" class="css-link">About</a>
            <a href="/resume" class="css-link">Resume</a>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="css-main">
      <div class="css-container css-py-6">
        <!-- Hero Section -->
        <div class="css-hero">
          <div class="css-hero-bg-1"></div>
          <div class="css-hero-bg-2"></div>
          <div style="max-width: 1200px; margin: 0 auto; padding: 0 1.5rem; position: relative;">
            <div class="css-grid" style="grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center;">
              <div>
                <h1 class="css-heading css-heading-lg" style="margin-bottom: 1rem; color: #1a202c;">Hi, I'm Nick Karnik</h1>
                <p class="css-text css-text-lg" style="margin-bottom: 1.5rem; color: #718096;">
                  Engineer and EM, shipping fast with TypeScript. I help teams move faster with clear product bets, strong execution, and systems that are simple to maintain.
                </p>
                <div class="css-flex css-gap-4" style="margin-bottom: 1.5rem; flex-wrap: wrap;">
                  ${['TypeScript', 'React', 'DX', 'AI']
                    .map(tag => `<span class="css-tag-primary">${tag}</span>`)
                    .join('')}
                </div>
                <div class="css-flex css-gap-6" style="flex-wrap: wrap;">
                  <a href="/blog" class="css-button css-button-primary">Read My Blog →</a>
                  <a href="/about" class="css-button css-button-secondary">About Me</a>
                </div>
              </div>
              <div style="text-align: center;">
                <div class="css-avatar css-avatar-lg" style="margin: 0 auto 1.5rem;">NK</div>
                <p class="css-text css-text-lg" style="color: #718096; font-weight: 500;">Currently: Advising founders on pragmatic AI and DX</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Section -->
        <div style="margin-bottom: 4rem;">
          <h2 class="css-heading css-heading-lg" style="text-align: center; margin-bottom: 2.5rem; color: #1a202c;">Professional Experience</h2>
          <div class="css-grid css-grid-auto-fit css-gap-8">
            <div class="css-stats-card">
              <p class="css-stats-label">Years Experience</p>
              <h3 class="css-stats-number" style="color: #3182ce;">8+</h3>
              <p class="css-stats-description">Engineering & Leadership</p>
            </div>
            <div class="css-stats-card">
              <p class="css-stats-label">Technologies</p>
              <h3 class="css-stats-number" style="color: #38a169;">15+</h3>
              <p class="css-stats-description">TypeScript, React, Node, AI</p>
            </div>
            <div class="css-stats-card">
              <p class="css-stats-label">Teams Led</p>
              <h3 class="css-stats-number" style="color: #805ad5;">5+</h3>
              <p class="css-stats-description">Engineering Teams</p>
            </div>
          </div>
        </div>

        <!-- Latest Posts Section -->
        <div style="margin-bottom: 4rem;">
          <div style="text-align: center; margin-bottom: 2.5rem;">
            <h2 class="css-heading css-heading-lg" style="margin-bottom: 0.75rem; color: #1a202c;">Latest Thoughts</h2>
            <p class="css-text css-text-lg" style="color: #718096; max-width: 600px; margin: 0 auto;">
              Sharing insights on engineering, AI, and technology from my experience building and leading teams.
            </p>
          </div>
          <div class="css-grid css-grid-auto-fit css-gap-8">
            ${latestPosts
              .map(
                post => `
              <div class="css-blog-card">
                <div class="css-card-body css-p-8">
                  <a href="/blog/${post.slug}" class="css-blog-title">
                    <h3 style="font-size: 1.25rem; margin: 0 0 0.75rem 0;">${post.title}</h3>
                  </a>
                  <div class="css-flex css-gap-4" style="margin-bottom: 1rem;">
                    <span class="css-text css-text-sm" style="font-weight: 500;">
                      ${post.date ? new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                    </span>
                    <span style="color: #e2e8f0;">•</span>
                    <span class="css-text css-text-sm">
                      ${Math.max(1, Math.round(post.excerpt.split(' ').length / 200))} min read
                    </span>
                  </div>
                  ${post.excerpt ? `<p class="css-blog-excerpt">${post.excerpt}</p>` : ''}
                </div>
              </div>
            `
              )
              .join('')}
          </div>
          <div style="text-align: center; margin-top: 2rem;">
            <a href="/blog" class="css-button css-button-secondary">View All Posts →</a>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer style="background: white; border-top: 1px solid #e2e8f0; padding: 2rem 0; margin-top: 4rem;">
      <div class="css-container">
        <div class="css-flex css-align-center css-justify-between">
          <p class="css-text css-text-sm" style="margin: 0; color: #718096;">© 2024 Nick Karnik. All rights reserved.</p>
          <div class="css-hstack">
            <a href="https://github.com/theoutlander" class="css-link css-text-sm">GitHub</a>
            <a href="https://www.linkedin.com/in/theoutlander" class="css-link css-text-sm">LinkedIn</a>
            <a href="mailto:nick@karnik.io" class="css-link css-text-sm">Email</a>
          </div>
        </div>
      </div>
    </footer>
  `;
};

// Generate blog index page content
const generateBlogPageContent = (posts: Post[]) => {
  return `
    <!-- Header -->
    <header class="css-header">
      <div class="css-container css-py-3">
        <div class="css-flex css-align-center css-justify-between css-gap-6">
          <a href="/" class="css-link">
            <h1 class="css-heading css-heading-md" style="color: #1a202c; margin: 0;">Nick Karnik</h1>
          </a>
          <div class="css-hstack">
            <a href="/blog" class="css-link" style="color: #3182ce; font-weight: 500;">Blog</a>
            <a href="/about" class="css-link">About</a>
            <a href="/resume" class="css-link">Resume</a>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="css-main">
      <div class="css-container css-py-6">
        <div style="margin-bottom: 3rem;">
          <h1 class="css-heading css-heading-lg" style="margin-bottom: 1rem; color: #1a202c;">Blog</h1>
          <p class="css-text css-text-lg" style="color: #718096; max-width: 600px;">
            Thoughts on engineering, AI, and technology from my experience building and leading teams.
          </p>
        </div>
        
        <div class="css-grid css-grid-auto-fit css-gap-6">
          ${posts
            .map(
              post => `
            <div class="css-blog-card">
              ${post.cover ? `<img src="${post.cover}" alt="" class="css-blog-image" />` : ''}
              <div class="css-card-body">
                <a href="/blog/${post.slug}" class="css-blog-title">
                  <h2 style="font-size: 1.125rem; margin: 0 0 0.25rem 0;">${post.title}</h2>
                </a>
                <p class="css-blog-meta">
                  ${post.date ? new Date(post.date).toDateString() : ''}
                  ${post.excerpt ? ` · ${Math.max(1, Math.round(post.excerpt.split(' ').length / 200))} min read` : ''}
                </p>
                ${post.excerpt ? `<p class="css-blog-excerpt">${post.excerpt}</p>` : ''}
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer style="background: white; border-top: 1px solid #e2e8f0; padding: 2rem 0; margin-top: 4rem;">
      <div class="css-container">
        <div class="css-flex css-align-center css-justify-between">
          <p class="css-text css-text-sm" style="margin: 0; color: #718096;">© 2024 Nick Karnik. All rights reserved.</p>
          <div class="css-hstack">
            <a href="https://github.com/theoutlander" class="css-link css-text-sm">GitHub</a>
            <a href="https://www.linkedin.com/in/theoutlander" class="css-link css-text-sm">LinkedIn</a>
            <a href="mailto:nick@karnik.io" class="css-link css-text-sm">Email</a>
          </div>
        </div>
      </div>
    </footer>
  `;
};

// Generate about page content
const generateAboutPageContent = (aboutData: AboutData) => {
  return `
    <!-- Header -->
    <header class="css-header">
      <div class="css-container css-py-3">
        <div class="css-flex css-align-center css-justify-between css-gap-6">
          <a href="/" class="css-link">
            <h1 class="css-heading css-heading-md" style="color: #1a202c; margin: 0;">Nick Karnik</h1>
          </a>
          <div class="css-hstack">
            <a href="/blog" class="css-link">Blog</a>
            <a href="/about" class="css-link" style="color: #3182ce; font-weight: 500;">About</a>
            <a href="/resume" class="css-link">Resume</a>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="css-main">
      <div class="css-container css-py-6">
        <!-- Hero -->
        <div class="css-flex css-align-center css-gap-6" style="margin-bottom: 2.5rem;">
          <div class="css-avatar">NK</div>
          <div>
            <h1 class="css-heading css-heading-lg" style="margin: 0 0 0.5rem 0; color: #1a202c;">Nick Karnik</h1>
            <p class="css-text" style="color: #718096; margin: 0 0 0.5rem 0;">Engineering Leader & Staff Software Engineer, shipping fast with Node, React, and TypeScript</p>
            <div class="css-flex css-gap-4" style="flex-wrap: wrap;">
              ${['TypeScript', 'React', 'DX']
                .map(tech => `<span class="css-tag">${tech}</span>`)
                .join('')}
            </div>
          </div>
        </div>

        <!-- Layout -->
        <div class="css-grid css-about-layout" style="grid-template-columns: 2fr 1fr; gap: 2rem;">
          <!-- Main content -->
          <div>
            <h2 class="css-heading css-heading-sm" style="margin-bottom: 0.75rem; color: #1a202c;">About</h2>
            <div class="css-text" style="line-height: 1.8;">
              ${aboutData.html}
            </div>
          </div>

          <!-- Sidebar -->
          <div>
            <!-- Contact Card -->
            <div class="css-contact-card">
              <h3 class="css-contact-title">Contact</h3>
              <div class="css-flex css-flex-column css-gap-4">
                <a href="mailto:nick@karnik.io" class="css-contact-button css-contact-button-primary">
                  📧 Email
                </a>
                <a href="https://www.linkedin.com/in/theoutlander" target="_blank" class="css-contact-button css-contact-button-secondary">
                  LinkedIn 🔗
                </a>
                <a href="https://github.com/theoutlander" target="_blank" class="css-contact-button css-contact-button-secondary">
                  GitHub 🔗
                </a>
                <a href="/resume" class="css-contact-button css-contact-button-outline">
                  📄 Resume
                </a>
              </div>
            </div>

            <!-- Focus Card -->
            <div class="css-focus-card">
              <h3 class="css-focus-title">Focus</h3>
              <div class="css-focus-tags">
                ${[
                  'TypeScript',
                  'React',
                  'Vite',
                  'Chakra',
                  'Node',
                  'GraphQL',
                  'AI',
                ]
                  .map(tech => `<span class="css-tag">${tech}</span>`)
                  .join('')}
              </div>
              <hr class="css-focus-divider">
              <p class="css-focus-description">
                I help teams move faster with clear product bets, strong execution, and systems that are simple to maintain.
              </p>
            </div>

            <!-- Currently Card -->
            <div class="css-currently-card">
              <h3 class="css-currently-title">Currently</h3>
              <div class="css-flex css-flex-column css-gap-4">
                <p class="css-currently-item">Advising founders on pragmatic AI and DX.</p>
                <p class="css-currently-item">Building with React + Node, shipping weekly.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer style="background: white; border-top: 1px solid #e2e8f0; padding: 2rem 0; margin-top: 4rem;">
      <div class="css-container">
        <div class="css-flex css-align-center css-justify-between">
          <p class="css-text css-text-sm" style="margin: 0; color: #718096;">© 2024 Nick Karnik. All rights reserved.</p>
          <div class="css-hstack">
            <a href="https://github.com/theoutlander" class="css-link css-text-sm">GitHub</a>
            <a href="https://www.linkedin.com/in/theoutlander" class="css-link css-text-sm">LinkedIn</a>
            <a href="mailto:nick@karnik.io" class="css-link css-text-sm">Email</a>
          </div>
        </div>
      </div>
    </footer>
  `;
};

// Generate resume page content
const generateResumePageContent = () => {
  return `
    <!-- Header -->
    <header class="css-header">
      <div class="css-container css-py-3">
        <div class="css-flex css-align-center css-justify-between css-gap-6">
          <a href="/" class="css-link">
            <h1 class="css-heading css-heading-md" style="color: #1a202c; margin: 0;">Nick Karnik</h1>
          </a>
          <div class="css-hstack">
            <a href="/blog" class="css-link">Blog</a>
            <a href="/about" class="css-link">About</a>
            <a href="/resume" class="css-link" style="color: #3182ce; font-weight: 500;">Resume</a>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="css-main">
      <div class="css-container css-py-6">
        <div style="max-width: 4xl; margin: 0 auto; padding: 1.5rem;">
          <!-- Header Card -->
          <div class="css-card" style="padding: 2rem; margin-bottom: 2rem;">
            <div class="css-flex css-justify-between css-align-start" style="flex-wrap: wrap; gap: 1.5rem;">
              <div class="css-flex css-gap-6 css-align-start">
                <div class="css-avatar" style="width: 4rem; height: 4rem; font-size: 1.5rem;">
                  <img src="/assets/images/profile/nick-karnik.jpeg" alt="Nick Karnik" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
                </div>
                <div class="css-flex css-flex-column css-gap-2" style="align-items: flex-start;">
                  <h1 class="css-heading css-heading-lg" style="margin: 0;">Nick Karnik</h1>
                  <p class="css-text" style="color: #718096; margin: 0;">Staff Software Engineer & Engineering Leader</p>
                  <div class="css-flex css-gap-2" style="flex-wrap: wrap;">
                    <span class="css-tag" style="background: #e6f3ff; color: #3182ce;">TypeScript</span>
                    <span class="css-tag" style="background: #e6f7e6; color: #38a169;">React</span>
                    <span class="css-tag" style="background: #f3e6ff; color: #805ad5;">Developer Experience</span>
                    <span class="css-tag" style="background: #e6f7f7; color: #319795;">NodeJS</span>
                    <span class="css-tag" style="background: #fff2e6; color: #dd6b20;">AI</span>
                  </div>
                </div>
              </div>
              <div class="css-flex css-flex-column css-gap-3" style="align-items: flex-end;">
                <a href="/resume.pdf" target="_blank" download="resume-nick-karnik.pdf" class="css-button css-button-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                  📥 Download PDF
                </a>
                <div class="css-flex css-gap-2">
                  <a href="mailto:nick@karnik.io" class="css-button css-button-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                    📧 Email
                  </a>
                  <a href="https://www.linkedin.com/in/theoutlander" target="_blank" class="css-button css-button-secondary" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                    🔗 LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Main Content Grid -->
          <div class="css-grid" style="grid-template-columns: 2fr 1fr; gap: 2rem;">
            <!-- Left Column - Experience -->
            <div>
              <!-- Experience Section -->
              <div class="css-card" style="padding: 1.5rem; margin-bottom: 1.5rem;">
                <h2 class="css-heading css-heading-lg" style="margin-bottom: 1.5rem; color: #3182ce;">Experience</h2>

                <!-- Current Role -->
                <div style="margin-bottom: 1.5rem;">
                  <div class="css-flex css-justify-between css-align-start" style="margin-bottom: 0.5rem;">
                    <div class="css-flex css-flex-column css-gap-1" style="align-items: flex-start;">
                      <h3 class="css-heading css-heading-sm">Founder & Fractional CTO</h3>
                      <p class="css-text css-text-sm" style="color: #718096;">Plutonic Consulting</p>
                    </div>
                    <span class="css-tag" style="background: #e6f7e6; color: #38a169;">Current</span>
                  </div>
                  <p class="css-text css-text-sm" style="color: #718096; margin-bottom: 0.75rem;">May 2025 - Present</p>
                  <p class="css-text" style="margin-bottom: 0.75rem;">
                    Providing fractional CTO support, AI strategy, and scaling guidance to founders. Helping teams move faster with clear product bets, strong execution, and systems that are simple to maintain. Focus on pragmatic AI integration and developer experience optimization.
                  </p>
                  <div class="css-flex css-gap-2" style="flex-wrap: wrap;">
                    ${[
                      'AI Strategy',
                      'Technical Leadership',
                      'Fractional CTO',
                      'Team Scaling',
                    ]
                      .map(
                        skill =>
                          `<span class="css-tag" style="border: 1px solid #e2e8f0;">${skill}</span>`
                      )
                      .join('')}
                  </div>
                </div>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;">

                <!-- Google Role -->
                <div style="margin-bottom: 1.5rem;">
                  <div class="css-flex css-flex-column css-gap-1" style="margin-bottom: 0.5rem; align-items: flex-start;">
                    <img src="/assets/images/companies/google.svg" alt="Google" style="width: 60px; height: 20px; margin-bottom: 0.5rem;" />
                    <h3 class="css-heading css-heading-sm">Staff Software Engineer / Engineering Manager</h3>
                  </div>
                  <p class="css-text css-text-sm" style="color: #718096; margin-bottom: 0.75rem;">May 2022 - Apr 2025</p>
                  <p class="css-text" style="margin-bottom: 0.75rem;">
                    Led technical direction and hands-on engineering for Gemini Code Assist, integrated into VSCode and IntelliJ IDEs. Implemented a symbol table generator across multiple languages, increasing context for LLM, reducing tokens, and significantly improving code completion acceptance rates.
                  </p>
                  <div class="css-flex css-gap-2" style="flex-wrap: wrap;">
                    ${[
                      'Go',
                      'TypeScript',
                      'Node.js',
                      'Kubernetes',
                      'GCP',
                      'LLM',
                    ]
                      .map(
                        skill =>
                          `<span class="css-tag" style="border: 1px solid #e2e8f0;">${skill}</span>`
                      )
                      .join('')}
                  </div>
                </div>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;">

                <!-- Salesforce Role -->
                <div style="margin-bottom: 1.5rem;">
                  <div class="css-flex css-flex-column css-gap-1" style="margin-bottom: 0.5rem; align-items: flex-start;">
                    <img src="/assets/images/companies/salesforce.svg" alt="Salesforce" style="width: 60px; height: 20px; margin-bottom: 0.5rem;" />
                    <h3 class="css-heading css-heading-sm">Senior Engineering Manager</h3>
                  </div>
                  <p class="css-text css-text-sm" style="color: #718096; margin-bottom: 0.75rem;">Oct 2019 - Apr 2022</p>
                  <p class="css-text" style="margin-bottom: 0.75rem;">
                    Built CI pipeline (TACO) enabling 100+ partners to test connectors across Tableau/Salesforce stack. Delivered REST and native Salesforce connectors; owned Web Data Connector platform. Managed a team of 35+; drove hiring, mentoring, and technical strategy. Created Connector SDK adopted across the Tableau ecosystem.
                  </p>
                  <div class="css-flex css-gap-2" style="flex-wrap: wrap;">
                    ${[
                      'TypeScript',
                      'Node.js',
                      'Chromium',
                      'CI/CD',
                      'Team Leadership',
                    ]
                      .map(
                        skill =>
                          `<span class="css-tag" style="border: 1px solid #e2e8f0;">${skill}</span>`
                      )
                      .join('')}
                  </div>
                </div>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;">

                <!-- T-Mobile Role -->
                <div style="margin-bottom: 1.5rem;">
                  <div class="css-flex css-flex-column css-gap-1" style="margin-bottom: 0.5rem; align-items: flex-start;">
                    <img src="/assets/images/companies/tmobile.jpeg" alt="T-Mobile" style="width: 60px; height: 20px; margin-bottom: 0.5rem;" />
                    <h3 class="css-heading css-heading-sm">Director Of Engineering</h3>
                  </div>
                  <p class="css-text css-text-sm" style="color: #718096; margin-bottom: 0.75rem;">Nov 2018 - Oct 2019</p>
                  <p class="css-text" style="margin-bottom: 0.75rem;">
                    Hired a diverse team of 25 engineers in six weeks; managed four product teams totaling 35+ engineers across T-Mobile Retail Mobility. Delivered custom desktop & mobile applications for the T-Mobile / Sprint merger. Architected and implemented a portable Test Automation Framework that runs in-app.
                  </p>
                  <div class="css-flex css-gap-2" style="flex-wrap: wrap;">
                    ${[
                      'Team Leadership',
                      'Rapid Hiring',
                      'Mobile Development',
                      'Test Automation',
                      'Project Management',
                    ]
                      .map(
                        skill =>
                          `<span class="css-tag" style="border: 1px solid #e2e8f0;">${skill}</span>`
                      )
                      .join('')}
                  </div>
                </div>

                <!-- Additional roles would continue here... -->
                <!-- For brevity, I'll include a few more key roles -->

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1.5rem 0;">

                <!-- Microsoft Role -->
                <div style="margin-bottom: 1.5rem;">
                  <div class="css-flex css-flex-column css-gap-1" style="margin-bottom: 0.5rem; align-items: flex-start;">
                    <img src="/assets/images/companies/microsoft.png" alt="Microsoft" style="width: 60px; height: 20px; margin-bottom: 0.5rem;" />
                    <h3 class="css-heading css-heading-sm">Software Development Engineer</h3>
                  </div>
                  <p class="css-text css-text-sm" style="color: #718096; margin-bottom: 0.75rem;">Aug 2006 - Aug 2012</p>
                  <p class="css-text" style="margin-bottom: 0.75rem;">
                    Led multiple Bing teams including Bing Together, Task Framework, Ecosystem, Core Answers, Seasonal Answers, Structured Data, Commerce Relevance, and Commerce Data Pipeline. Architected Big Data Validation Framework (Engineering Excellence Award Nominee).
                  </p>
                  <div class="css-flex css-gap-2" style="flex-wrap: wrap;">
                    ${[
                      'Big Data',
                      'JavaScript',
                      'Machine Learning',
                      'Outlook Web Access',
                      'Bing',
                    ]
                      .map(
                        skill =>
                          `<span class="css-tag" style="border: 1px solid #e2e8f0;">${skill}</span>`
                      )
                      .join('')}
                  </div>
                </div>
              </div>

              <!-- Notable Projects Section -->
              <div class="css-card" style="padding: 1.5rem; margin-bottom: 1.5rem;">
                <h2 class="css-heading css-heading-lg" style="margin-bottom: 1.5rem; color: #3182ce;">Notable Projects</h2>

                <div style="margin-bottom: 1rem;">
                  <img src="/assets/images/companies/gemini-code-assist.png" alt="Gemini Code Assist" style="width: 60px; height: 20px; margin-bottom: 0.5rem;" />
                  <h3 class="css-heading css-heading-sm" style="margin-bottom: 0.5rem;">Gemini Code Assist</h3>
                  <p class="css-text css-text-sm" style="color: #718096; margin-bottom: 0.5rem;">2022 - 2025</p>
                  <p class="css-text" style="margin-bottom: 0.75rem;">
                    Led technical direction and hands-on engineering for Google's AI coding assistant, integrated into VSCode and IntelliJ IDEs. Implemented a symbol table generator across multiple languages, increasing context for LLM, reducing tokens, and significantly improving code completion acceptance rates.
                  </p>
                  <div class="css-flex css-gap-2" style="flex-wrap: wrap;">
                    ${[
                      'Go',
                      'TypeScript',
                      'Node.js',
                      'Kubernetes',
                      'GCP',
                      'LLM',
                    ]
                      .map(
                        tech =>
                          `<span class="css-tag" style="background: #f7fafc; color: #4a5568;">${tech}</span>`
                      )
                      .join('')}
                  </div>
                </div>

                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 1rem 0;">

                <div style="margin-bottom: 1rem;">
                  <img src="/assets/images/companies/wdc-3.png" alt="TACO Toolkit" style="width: 60px; height: 20px; margin-bottom: 0.5rem;" />
                  <h3 class="css-heading css-heading-sm" style="margin-bottom: 0.5rem;">TACO Toolkit & Connector SDK</h3>
                  <p class="css-text css-text-sm" style="color: #718096; margin-bottom: 0.5rem;">2019 - 2022</p>
                  <p class="css-text" style="margin-bottom: 0.75rem;">
                    Built a robust CI/CD pipeline (TACO) enabling over 100 partners to test and deploy Tableau connectors efficiently. Created a Connector SDK widely adopted across Tableau's ecosystem, simplifying web data connector development.
                  </p>
                  <div class="css-flex css-gap-2" style="flex-wrap: wrap;">
                    ${[
                      'TypeScript',
                      'Node.js',
                      'Chromium',
                      'CI/CD',
                      'SDK Development',
                    ]
                      .map(
                        tech =>
                          `<span class="css-tag" style="background: #f7fafc; color: #4a5568;">${tech}</span>`
                      )
                      .join('')}
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column - Skills & Info -->
            <div class="css-flex css-flex-column css-gap-6">
              <!-- Skills -->
              <div class="css-card" style="padding: 1.5rem;">
                <h2 class="css-heading css-heading-lg" style="margin-bottom: 1rem; color: #3182ce;">Technical Skills</h2>

                <div class="css-flex css-flex-column css-gap-4">
                  <div>
                    <p class="css-text" style="font-weight: 600; margin-bottom: 0.5rem;">Languages</p>
                    <div class="css-flex css-gap-2" style="flex-wrap: wrap;">
                      ${[
                        'TypeScript',
                        'JavaScript',
                        'Python',
                        'C#',
                        'Go',
                        'C++',
                        'Java',
                      ]
                        .map(
                          lang =>
                            `<span class="css-tag" style="border: 1px solid #e2e8f0;">${lang}</span>`
                        )
                        .join('')}
                    </div>
                  </div>

                  <div>
                    <p class="css-text" style="font-weight: 600; margin-bottom: 0.5rem;">Web & Mobile</p>
                    <div class="css-flex css-gap-2" style="flex-wrap: wrap;">
                      ${[
                        'NodeJS',
                        'Electron',
                        'Express',
                        'React',
                        'React Native',
                        'GraphQL',
                        'Playwright',
                        'VSCode Extensions',
                      ]
                        .map(
                          tech =>
                            `<span class="css-tag" style="border: 1px solid #e2e8f0;">${tech}</span>`
                        )
                        .join('')}
                    </div>
                  </div>

                  <div>
                    <p class="css-text" style="font-weight: 600; margin-bottom: 0.5rem;">Databases & Cloud</p>
                    <div class="css-flex css-gap-2" style="flex-wrap: wrap;">
                      ${[
                        'MongoDB',
                        'Docker',
                        'ElasticSearch',
                        'Neo4J',
                        'PostgreSQL',
                        'Redis',
                        'SQL Server',
                        'AWS',
                        'Google Cloud',
                      ]
                        .map(
                          tech =>
                            `<span class="css-tag" style="border: 1px solid #e2e8f0;">${tech}</span>`
                        )
                        .join('')}
                    </div>
                  </div>

                  <div>
                    <p class="css-text" style="font-weight: 600; margin-bottom: 0.5rem;">AI & Leadership</p>
                    <div class="css-flex css-gap-2" style="flex-wrap: wrap;">
                      ${[
                        'AI-Assisted Development',
                        'Large Language Models',
                        'Developer Tooling',
                        'Platform Architecture',
                        'Scalable Systems',
                        'Full-Stack Engineering',
                        'Mobile Development',
                      ]
                        .map(
                          tool =>
                            `<span class="css-tag" style="border: 1px solid #e2e8f0;">${tool}</span>`
                        )
                        .join('')}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Education -->
              <div class="css-card" style="padding: 1.5rem;">
                <h2 class="css-heading css-heading-lg" style="margin-bottom: 1rem; color: #3182ce;">Education</h2>
                <div>
                  <img src="/assets/images/companies/umd.jpeg" alt="University of Maryland" style="width: 60px; height: 20px; margin-bottom: 0.5rem;" />
                  <h3 class="css-heading css-heading-sm" style="margin-bottom: 0.25rem;">B.S., Computer Science</h3>
                  <p class="css-text css-text-sm" style="color: #718096; margin-bottom: 0.25rem;">University of Maryland, College Park</p>
                  <p class="css-text css-text-sm" style="color: #718096;">Minor in Business</p>
                </div>
              </div>

              <!-- Contact -->
              <div class="css-card" style="padding: 1.5rem;">
                <h2 class="css-heading css-heading-lg" style="margin-bottom: 1rem; color: #3182ce;">Contact</h2>
                <div class="css-flex css-flex-column css-gap-3">
                  <a href="mailto:nick@karnik.io" class="css-button css-button-secondary" style="display: flex; align-items: center; gap: 0.5rem; justify-content: flex-start;">
                    📧 nick@karnik.io
                  </a>
                  <a href="https://www.linkedin.com/in/theoutlander" target="_blank" class="css-button css-button-secondary" style="display: flex; align-items: center; gap: 0.5rem; justify-content: flex-start;">
                    🔗 LinkedIn
                  </a>
                  <a href="https://github.com/theoutlander" target="_blank" class="css-button css-button-secondary" style="display: flex; align-items: center; gap: 0.5rem; justify-content: flex-start;">
                    🔗 GitHub
                  </a>
                  <a href="https://calendly.com/nick-karnik" target="_blank" class="css-button css-button-secondary" style="display: flex; align-items: center; gap: 0.5rem; justify-content: flex-start;">
                    📅 Schedule Call
                  </a>
                </div>
              </div>

              <!-- Honors & Highlights -->
              <div class="css-card" style="padding: 1.5rem;">
                <h2 class="css-heading css-heading-lg" style="margin-bottom: 1rem; color: #3182ce;">Honors & Highlights</h2>
                <div class="css-flex css-flex-column css-gap-3">
                  <p class="css-text css-text-sm">• Patent: Intelligent Intent Detection from Social Network Messages</p>
                  <p class="css-text css-text-sm">• Microsoft Engineering Excellence Award Nominee</p>
                  <p class="css-text css-text-sm">• Winner: Bing Hackday Spring '10 for best idea</p>
                  <p class="css-text css-text-sm">• Bing Fall Hackday '10 project productized and patented</p>
                  <p class="css-text css-text-sm">• Accepted into Y Combinator (2007)</p>
                  <p class="css-text css-text-sm">• Mentor, blogger, open-source contributor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer style="background: white; border-top: 1px solid #e2e8f0; padding: 2rem 0; margin-top: 4rem;">
      <div class="css-container">
        <div class="css-flex css-align-center css-justify-between">
          <p class="css-text css-text-sm" style="margin: 0; color: #718096;">© 2024 Nick Karnik. All rights reserved.</p>
          <div class="css-hstack">
            <a href="https://github.com/theoutlander" class="css-link css-text-sm">GitHub</a>
            <a href="https://www.linkedin.com/in/theoutlander" class="css-link css-text-sm">LinkedIn</a>
            <a href="mailto:nick@karnik.io" class="css-link css-text-sm">Email</a>
          </div>
        </div>
      </div>
    </footer>
  `;
};

// Main function to render all static pages
export async function renderAllStaticPages() {
  console.log('🔄 Rendering all static pages...');

  // Read the hashnode data
  const hashnodeData = JSON.parse(
    readFileSync('public/data/hashnode.json', 'utf8')
  ) as Post[];

  // Read the about page data
  const aboutData = JSON.parse(
    readFileSync('public/data/pages/about.json', 'utf8')
  ) as AboutData;

  // Render home page
  console.log('📄 Rendering home page...');
  const homeContent = generateHomePageContent(hashnodeData);
  const homeHTML = generateBaseHTML(
    'Nick Karnik - Staff Software Engineer & Engineering Leader',
    'Staff software engineer and engineering leader sharing insights on engineering, AI, and technology. Read my blog for the latest thoughts and experiences.',
    homeContent
  );
  writeFileSync('dist/index.html', homeHTML);

  // Render blog index page
  console.log('📄 Rendering blog index page...');
  const blogDir = join('dist', 'blog');
  mkdirSync(blogDir, { recursive: true });
  const blogContent = generateBlogPageContent(hashnodeData);
  const blogHTML = generateBaseHTML(
    'Blog - Nick Karnik',
    'Thoughts on engineering, AI, and technology from my experience building and leading teams.',
    blogContent
  );
  writeFileSync(join(blogDir, 'index.html'), blogHTML);

  // Render about page
  console.log('📄 Rendering about page...');
  const aboutDir = join('dist', 'about');
  mkdirSync(aboutDir, { recursive: true });
  const aboutContent = generateAboutPageContent(aboutData);
  const aboutHTML = generateBaseHTML(
    'About - Nick Karnik',
    'Engineering Leader & Staff Software Engineer, shipping fast with Node, React, and TypeScript.',
    aboutContent
  );
  writeFileSync(join(aboutDir, 'index.html'), aboutHTML);

  // Render resume page
  console.log('📄 Rendering resume page...');
  const resumeDir = join('dist', 'resume');
  mkdirSync(resumeDir, { recursive: true });
  const resumeContent = generateResumePageContent();
  const resumeHTML = generateBaseHTML(
    'Resume — Nick Karnik',
    'Nick Karnik - Staff Software Engineer & Engineering Leader with 25+ years building scalable platforms at Google, Microsoft, Salesforce, Tableau, and startups',
    resumeContent,
    '<link rel="canonical" href="https://nick.karnik.io/resume" />'
  );
  writeFileSync(join(resumeDir, 'index.html'), resumeHTML);

  console.log('✅ All static pages rendered successfully!');
}
