import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

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

function generateAboutPageHTML(aboutData: { title: string; html: string }) {
  return `
    <div>
      <!-- Hero -->
      <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 40px;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: #3182ce; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px;">NK</div>
        <div>
          <h1 style="font-size: 24px; margin: 0 0 8px 0; color: #1a202c;">Nick Karnik</h1>
          <p style="color: #718096; margin: 0 0 8px 0;">Engineering Leader & Staff Software Engineer, shipping fast with Node, React, and TypeScript</p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <span style="background: #edf2f7; color: #4a5568; padding: 4px 8px; border-radius: 4px; font-size: 12px;">TypeScript</span>
            <span style="background: #edf2f7; color: #4a5568; padding: 4px 8px; border-radius: 4px; font-size: 12px;">React</span>
            <span style="background: #edf2f7; color: #4a5568; padding: 4px 8px; border-radius: 4px; font-size: 12px;">DX</span>
          </div>
        </div>
      </div>

      <!-- Layout -->
      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 32px;">
        <!-- Main content -->
        <div>
          <h2 style="font-size: 18px; margin-bottom: 12px; color: #1a202c;">About</h2>
          <div style="line-height: 1.8;">
            ${aboutData.html}
          </div>
        </div>

        <!-- Sidebar -->
        <div>
          <!-- Contact Card -->
          <div style="border: 1px solid #e2e8f0; padding: 16px; border-radius: 16px; margin-bottom: 16px;">
            <h3 style="font-size: 14px; margin-bottom: 12px; color: #1a202c;">Contact</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <a href="mailto:nick@karnik.io" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: #3182ce; color: white; border-radius: 8px; text-decoration: none; font-size: 14px;">
                📧 Email
              </a>
              <a href="https://www.linkedin.com/in/theoutlander" target="_blank" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #1a202c; font-size: 14px;">
                LinkedIn 🔗
              </a>
              <a href="https://github.com/theoutlander" target="_blank" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #1a202c; font-size: 14px;">
                GitHub 🔗
              </a>
              <a href="/resume" style="display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: 1px solid #3182ce; border-radius: 8px; text-decoration: none; color: #3182ce; font-size: 14px;">
                📄 Resume
              </a>
            </div>
          </div>

          <!-- Focus Card -->
          <div style="border: 1px solid #e2e8f0; padding: 16px; border-radius: 16px; margin-bottom: 16px;">
            <h3 style="font-size: 14px; margin-bottom: 12px; color: #1a202c;">Focus</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px;">
              ${[
                'TypeScript',
                'React',
                'Vite',
                'Chakra',
                'Node',
                'GraphQL',
                'AI',
              ]
                .map(
                  tech =>
                    `<span style="background: #edf2f7; color: #4a5568; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${tech}</span>`
                )
                .join('')}
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 12px 0;">
            <p style="font-size: 14px; color: #718096; margin: 0; line-height: 1.5;">
              I help teams move faster with clear product bets, strong execution, and systems that are simple to maintain.
            </p>
          </div>

          <!-- Currently Card -->
          <div style="border: 1px solid #e2e8f0; padding: 16px; border-radius: 16px;">
            <h3 style="font-size: 14px; margin-bottom: 12px; color: #1a202c;">Currently</h3>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <p style="font-size: 14px; margin: 0; color: #1a202c;">Advising founders on pragmatic AI and DX.</p>
              <p style="font-size: 14px; margin: 0; color: #1a202c;">Building with React + Node, shipping weekly.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateBlogListHTML(posts: Post[]) {
  return `
    <div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px;">
        ${posts
          .map(
            post => `
          <div style="border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; transition: all 120ms;">
            ${
              post.cover
                ? `
              <img src="${post.cover}" alt="" style="object-fit: cover; max-height: 260px; width: 100%;" />
            `
                : ''
            }
            <div style="padding: 16px;">
              <a href="/blog/${post.slug}" style="text-decoration: none;">
                <h2 style="font-weight: 600; font-size: 18px; color: #2b6cb0; margin: 0 0 4px 0;">${post.title}</h2>
              </a>
              <p style="font-size: 14px; color: #718096; margin: 4px 0 12px 0;">
                ${post.date ? new Date(post.date).toDateString() : ''}
                ${post.excerpt ? ` · ${Math.max(1, Math.round(post.excerpt.split(' ').length / 200))} min read` : ''}
              </p>
              ${
                post.excerpt
                  ? `
                <p style="margin: 12px 0 0 0; color: #1a202c; line-height: 1.6;">${post.excerpt}</p>
              `
                  : ''
              }
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    </div>
  `;
}

function generateHomePageHTML(posts: Post[]) {
  const latestPosts = posts.slice(0, 2);

  return `
    <div>
      <!-- Hero Section -->
      <div style="padding: 64px 0; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 24px; margin-bottom: 64px; position: relative; overflow: hidden;">
        <div style="position: absolute; top: -50%; right: -20%; width: 300px; height: 300px; background: #bee3f8; border-radius: 50%; opacity: 0.3;"></div>
        <div style="position: absolute; bottom: -30%; left: -10%; width: 200px; height: 200px; background: #e9d8fd; border-radius: 50%; opacity: 0.2;"></div>
        
        <div style="max-width: 1200px; margin: 0 auto; padding: 0 24px; position: relative;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;">
            <div>
              <h1 style="font-size: 48px; margin-bottom: 16px; color: #1a202c;">Hi, I'm Nick Karnik</h1>
              <p style="font-size: 20px; color: #718096; margin-bottom: 24px; line-height: 1.6;">
                Engineer and EM, shipping fast with TypeScript. I help teams move faster with clear product bets, strong execution, and systems that are simple to maintain.
              </p>
              <div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">
                ${['TypeScript', 'React', 'DX', 'AI']
                  .map(
                    tag =>
                      `<span style="background: #3182ce; color: white; padding: 8px 16px; border-radius: 8px; font-size: 14px;">${tag}</span>`
                  )
                  .join('')}
              </div>
              <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                <a href="/blog" style="background: #3182ce; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Read My Blog →</a>
                <a href="/about" style="border: 1px solid #e2e8f0; color: #1a202c; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">About Me</a>
              </div>
            </div>
            <div style="text-align: center;">
              <div style="width: 128px; height: 128px; border-radius: 50%; background: #3182ce; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px; font-weight: bold; margin: 0 auto 24px; box-shadow: 0 8px 25px rgba(0,0,0,0.15); border: 4px solid white;">NK</div>
              <p style="font-size: 18px; color: #718096; font-weight: 500;">Currently: Advising founders on pragmatic AI and DX</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div style="margin-bottom: 64px;">
        <h2 style="font-size: 36px; text-align: center; margin-bottom: 40px; color: #1a202c;">Professional Experience</h2>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 32px;">
          <div style="border: 1px solid #e2e8f0; padding: 32px; border-radius: 16px; text-align: center; transition: all 200ms;">
            <p style="font-size: 14px; color: #718096; margin-bottom: 8px; font-weight: 500;">Years Experience</p>
            <h3 style="font-size: 36px; color: #3182ce; margin: 0 0 4px 0;">8+</h3>
            <p style="font-size: 14px; color: #718096; margin: 0;">Engineering & Leadership</p>
          </div>
          <div style="border: 1px solid #e2e8f0; padding: 32px; border-radius: 16px; text-align: center; transition: all 200ms;">
            <p style="font-size: 14px; color: #718096; margin-bottom: 8px; font-weight: 500;">Technologies</p>
            <h3 style="font-size: 36px; color: #38a169; margin: 0 0 4px 0;">15+</h3>
            <p style="font-size: 14px; color: #718096; margin: 0;">TypeScript, React, Node, AI</p>
          </div>
          <div style="border: 1px solid #e2e8f0; padding: 32px; border-radius: 16px; text-align: center; transition: all 200ms;">
            <p style="font-size: 14px; color: #718096; margin-bottom: 8px; font-weight: 500;">Teams Led</p>
            <h3 style="font-size: 36px; color: #805ad5; margin: 0 0 4px 0;">5+</h3>
            <p style="font-size: 14px; color: #718096; margin: 0;">Engineering Teams</p>
          </div>
        </div>
      </div>

      <!-- Latest Posts Section -->
      <div style="margin-bottom: 64px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h2 style="font-size: 36px; margin-bottom: 12px; color: #1a202c;">Latest Thoughts</h2>
          <p style="font-size: 18px; color: #718096; max-width: 600px; margin: 0 auto;">
            Sharing insights on engineering, AI, and technology from my experience building and leading teams.
          </p>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;">
          ${latestPosts
            .map(
              post => `
            <div style="border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; transition: all 200ms;">
              <div style="padding: 32px;">
                <a href="/blog/${post.slug}" style="text-decoration: none;">
                  <h3 style="font-size: 20px; color: #2b6cb0; margin: 0 0 12px 0; font-weight: 600;">${post.title}</h3>
                </a>
                <div style="display: flex; gap: 8px; margin-bottom: 16px;">
                  <span style="font-size: 14px; color: #718096; font-weight: 500;">
                    ${post.date ? new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                  </span>
                  <span style="color: #e2e8f0;">•</span>
                  <span style="font-size: 14px; color: #718096;">
                    ${Math.max(1, Math.round(post.excerpt.split(' ').length / 200))} min read
                  </span>
                </div>
                ${
                  post.excerpt
                    ? `
                  <p style="color: #1a202c; font-size: 16px; line-height: 1.6; margin: 0;">${post.excerpt}</p>
                `
                    : ''
                }
              </div>
            </div>
          `
            )
            .join('')}
        </div>
        <div style="text-align: center; margin-top: 32px;">
          <a href="/blog" style="border: 1px solid #e2e8f0; color: #1a202c; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">View All Posts →</a>
        </div>
      </div>
    </div>
  `;
}

async function renderStaticPages() {
  console.log('🔄 Rendering truly static HTML pages...');

  // Read the hashnode data
  const hashnodeData = JSON.parse(
    readFileSync('public/data/hashnode.json', 'utf8')
  ) as Post[];

  // Read the about page data
  const aboutData = JSON.parse(
    readFileSync('public/data/pages/about.json', 'utf8')
  );

  // Read the base HTML template
  const baseHtml = readFileSync('dist/index.html', 'utf8');

  // Render home page
  console.log('📄 Rendering home page...');
  const homeHtml = generateHomePageHTML(hashnodeData);
  const homeFinalHtml = baseHtml.replace(
    '<div id="root"></div>',
    `<div id="root">${homeHtml}</div>`
  );
  writeFileSync('dist/index.html', homeFinalHtml);

  // Render blog index page
  console.log('📄 Rendering blog index page...');
  const blogDir = join('dist', 'blog');
  mkdirSync(blogDir, { recursive: true });
  const blogHtml = generateBlogListHTML(hashnodeData);
  const blogFinalHtml = baseHtml.replace(
    '<div id="root"></div>',
    `<div id="root">${blogHtml}</div>`
  );
  writeFileSync(join(blogDir, 'index.html'), blogFinalHtml);

  // Render about page
  console.log('📄 Rendering about page...');
  const aboutDir = join('dist', 'about');
  mkdirSync(aboutDir, { recursive: true });
  const aboutPageHtml = generateAboutPageHTML(aboutData);
  const aboutFinalHtml = baseHtml.replace(
    '<div id="root"></div>',
    `<div id="root">${aboutPageHtml}</div>`
  );
  writeFileSync(join(aboutDir, 'index.html'), aboutFinalHtml);

  console.log('✅ All truly static HTML pages rendered successfully!');
}

renderStaticPages().catch(console.error);
