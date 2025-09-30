import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Static HTML Files', () => {
  const distPath = join(process.cwd(), 'dist');

  const expectedHtmlFiles = [
    'index.html',
    'about/index.html',
    'blog/index.html',
    'blog/how-engineers-can-use-ai-effectively/index.html',
    '404.html',
  ];

  const redirectHtmlFiles = [
    'calendar/index.html',
    'consulting/index.html',
    'contact/index.html',
    'email/index.html',
    'feed/index.html',
    'gh/index.html',
    'github/index.html',
    'li/index.html',
    'linkedin/index.html',
    'rss/index.html',
    'so/index.html',
    'stackoverflow/index.html',
    'twitter/index.html',
    'x/index.html',
    'youtube/index.html',
    'yt/index.html',
  ];

  describe('File Existence', () => {
    test.each([...expectedHtmlFiles, ...redirectHtmlFiles])(
      'should exist: %s',
      filePath => {
        const fullPath = join(distPath, filePath);
        expect(existsSync(fullPath)).toBe(true);
      }
    );
  });

  describe('HTML Structure Validation', () => {
    const validateMainAppStructure = (
      htmlContent: string,
      filePath: string
    ) => {
      // Check for DOCTYPE
      expect(htmlContent).toMatch(/<!doctype html>/i);

      // Check for html tag with lang attribute
      expect(htmlContent).toMatch(/<html lang="en">/i);

      // Check for head section
      expect(htmlContent).toMatch(/<head>/i);
      expect(htmlContent).toMatch(/<\/head>/i);

      // Check for body section
      expect(htmlContent).toMatch(/<body>/i);
      expect(htmlContent).toMatch(/<\/body>/i);

      // Check for root div
      expect(htmlContent).toMatch(/<div id="root"><\/div>/i);

      // Check for required meta tags
      expect(htmlContent).toMatch(/<meta charset="UTF-8" \/>/i);
      expect(htmlContent).toMatch(
        /<meta name="viewport" content="width=device-width, initial-scale=1.0" \/>/i
      );

      // Check for Content Security Policy
      expect(htmlContent).toMatch(
        /<meta\s+http-equiv="Content-Security-Policy"\s+content="upgrade-insecure-requests"\s+\/>/i
      );

      // Check for RSS link
      expect(htmlContent).toMatch(
        /<link\s+rel="alternate"\s+type="application\/rss\+xml"\s+title="RSS"\s+href="https:\/\/theoutlander\.hashnode\.dev\/rss\.xml"\s+\/>/i
      );

      // Check for Google Analytics
      expect(htmlContent).toMatch(
        /<script\s+async\s+src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-62FC7BDSGJ"\s+><\/script>/i
      );
      expect(htmlContent).toMatch(/gtag\('config', 'G-62FC7BDSGJ'\)/i);

      // Check for title tag
      expect(htmlContent).toMatch(/<title>.*<\/title>/i);

      // Check for main script tag
      expect(htmlContent).toMatch(
        /<script type="module" crossorigin src="\/assets\/index-[A-Za-z0-9]+\.js"><\/script>/i
      );
    };

    const validateRedirectStructure = (
      htmlContent: string,
      filePath: string
    ) => {
      // Check for DOCTYPE
      expect(htmlContent).toMatch(/<!doctype html>/i);

      // Check for html tag with lang attribute
      expect(htmlContent).toMatch(/<html lang="en">/i);

      // Check for head section
      expect(htmlContent).toMatch(/<head>/i);
      expect(htmlContent).toMatch(/<\/head>/i);

      // Check for body section
      expect(htmlContent).toMatch(/<body>/i);
      expect(htmlContent).toMatch(/<\/body>/i);

      // Check for redirect meta tag
      expect(htmlContent).toMatch(/<meta http-equiv="refresh"/i);

      // Check for title
      expect(htmlContent).toMatch(/<title>.*<\/title>/i);
    };

    const validate404Structure = (htmlContent: string, filePath: string) => {
      // Check for DOCTYPE
      expect(htmlContent).toMatch(/<!doctype html>/i);

      // Check for html tag with lang attribute
      expect(htmlContent).toMatch(/<html lang="en">/i);

      // Check for head section
      expect(htmlContent).toMatch(/<head>/i);
      expect(htmlContent).toMatch(/<\/head>/i);

      // Check for body section
      expect(htmlContent).toMatch(/<body>/i);
      expect(htmlContent).toMatch(/<\/body>/i);

      // Check for 404 specific content
      expect(htmlContent).toMatch(/Lost in Space/i);
      expect(htmlContent).toMatch(/Lost in Space|404|error/i);
    };

    test.each(expectedHtmlFiles.filter(f => f !== '404.html'))(
      'should have valid main app HTML structure: %s',
      filePath => {
        const fullPath = join(distPath, filePath);
        if (existsSync(fullPath)) {
          const htmlContent = readFileSync(fullPath, 'utf-8');
          validateMainAppStructure(htmlContent, filePath);
        }
      }
    );

    test.each(redirectHtmlFiles)(
      'should have valid redirect HTML structure: %s',
      filePath => {
        const fullPath = join(distPath, filePath);
        if (existsSync(fullPath)) {
          const htmlContent = readFileSync(fullPath, 'utf-8');
          validateRedirectStructure(htmlContent, filePath);
        }
      }
    );

    test('404.html should have valid 404 structure', () => {
      const fullPath = join(distPath, '404.html');
      if (existsSync(fullPath)) {
        const htmlContent = readFileSync(fullPath, 'utf-8');
        validate404Structure(htmlContent, '404.html');
      }
    });
  });

  describe('Page-Specific Content', () => {
    test('index.html should have correct title', () => {
      const htmlContent = readFileSync(join(distPath, 'index.html'), 'utf-8');
      expect(htmlContent).toMatch(/<title>blog<\/title>/i);
    });

    test('about/index.html should have pre-populated data', () => {
      const htmlContent = readFileSync(
        join(distPath, 'about/index.html'),
        'utf-8'
      );
      expect(htmlContent).toMatch(/window\.__INITIAL_ABOUT_DATA__/i);
      expect(htmlContent).toMatch(/"slug":"about"/i);
      expect(htmlContent).toMatch(/"title":"About"/i);
    });

    test('blog/index.html should have pre-populated blog data', () => {
      const htmlContent = readFileSync(
        join(distPath, 'blog/index.html'),
        'utf-8'
      );
      expect(htmlContent).toMatch(/window\.__INITIAL_BLOG_DATA__/i);
      expect(htmlContent).toMatch(/how-engineers-can-use-ai-effectively/i);
    });

    test('blog post should have pre-populated post data', () => {
      const htmlContent = readFileSync(
        join(distPath, 'blog/how-engineers-can-use-ai-effectively/index.html'),
        'utf-8'
      );
      expect(htmlContent).toMatch(/window\.__INITIAL_POST_DATA__/i);
      expect(htmlContent).toMatch(/how-engineers-can-use-ai-effectively/i);
    });
  });

  describe('Asset References', () => {
    test('should reference correct JavaScript bundle', () => {
      const htmlContent = readFileSync(join(distPath, 'index.html'), 'utf-8');
      const scriptMatch = htmlContent.match(
        /src="\/assets\/(index-[A-Za-z0-9]+\.js)"/
      );
      expect(scriptMatch).toBeTruthy();

      if (scriptMatch) {
        const jsFileName = scriptMatch[1];
        const jsPath = join(distPath, 'assets', jsFileName);
        expect(existsSync(jsPath)).toBe(true);
      }
    });
  });

  describe('SEO and Meta Tags', () => {
    test('should have proper meta tags for SEO', () => {
      const htmlContent = readFileSync(join(distPath, 'index.html'), 'utf-8');

      // Check for charset
      expect(htmlContent).toMatch(/<meta charset="UTF-8" \/>/i);

      // Check for viewport
      expect(htmlContent).toMatch(
        /<meta name="viewport" content="width=device-width, initial-scale=1.0" \/>/i
      );

      // Check for CSP
      expect(htmlContent).toMatch(
        /<meta\s+http-equiv="Content-Security-Policy"\s+content="upgrade-insecure-requests"\s+\/>/i
      );
    });
  });

  describe('Accessibility', () => {
    test('should have proper lang attribute', () => {
      const htmlContent = readFileSync(join(distPath, 'index.html'), 'utf-8');
      expect(htmlContent).toMatch(/<html lang="en">/i);
    });

    test('should have proper DOCTYPE', () => {
      const htmlContent = readFileSync(join(distPath, 'index.html'), 'utf-8');
      expect(htmlContent).toMatch(/<!doctype html>/i);
    });
  });

  describe('Performance', () => {
    test('should have async script loading', () => {
      const htmlContent = readFileSync(join(distPath, 'index.html'), 'utf-8');
      expect(htmlContent).toMatch(
        /<script\s+async\s+src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-62FC7BDSGJ"\s+><\/script>/i
      );
    });

    test('should have module type script', () => {
      const htmlContent = readFileSync(join(distPath, 'index.html'), 'utf-8');
      expect(htmlContent).toMatch(
        /<script type="module" crossorigin src="\/assets\/index-[A-Za-z0-9]+\.js"><\/script>/i
      );
    });
  });
});
