import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

describe('Static Assets', () => {
  const distPath = join(process.cwd(), 'dist');

  describe('Sitemap', () => {
    test('sitemap.xml should exist', () => {
      const sitemapPath = join(distPath, 'sitemap.xml');
      expect(existsSync(sitemapPath)).toBe(true);
    });

    test('sitemap.xml should be valid XML', () => {
      const sitemapPath = join(distPath, 'sitemap.xml');
      const sitemapContent = readFileSync(sitemapPath, 'utf-8');

      // Check for XML declaration
      expect(sitemapContent).toMatch(
        /<\?xml version="1\.0" encoding="UTF-8"\?>/i
      );

      // Check for urlset root element
      expect(sitemapContent).toMatch(/<urlset/i);
      expect(sitemapContent).toMatch(/<\/urlset>/i);

      // Check for namespace
      expect(sitemapContent).toMatch(
        /xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/i
      );
    });

    test('sitemap.xml should contain expected URLs', () => {
      const sitemapPath = join(distPath, 'sitemap.xml');
      const sitemapContent = readFileSync(sitemapPath, 'utf-8');

      // Check for main pages
      expect(sitemapContent).toMatch(
        /<loc>https:\/\/nick\.karnik\.io\/<\/loc>/i
      );
      expect(sitemapContent).toMatch(
        /<loc>https:\/\/nick\.karnik\.io\/about<\/loc>/i
      );
      expect(sitemapContent).toMatch(
        /<loc>https:\/\/nick\.karnik\.io\/blog<\/loc>/i
      );
      expect(sitemapContent).toMatch(
        /<loc>https:\/\/nick\.karnik\.io\/blog\/how-engineers-can-use-ai-effectively<\/loc>/i
      );
    });
  });

  describe('Robots.txt', () => {
    test('robots.txt should exist', () => {
      const robotsPath = join(distPath, 'robots.txt');
      expect(existsSync(robotsPath)).toBe(true);
    });

    test('robots.txt should have proper content', () => {
      const robotsPath = join(distPath, 'robots.txt');
      const robotsContent = readFileSync(robotsPath, 'utf-8');

      // Check for User-agent
      expect(robotsContent).toMatch(/User-agent:\s*\*/i);

      // Check for Allow directive
      expect(robotsContent).toMatch(/Allow:\s*\/\s*$/im);

      // Check for Sitemap reference
      expect(robotsContent).toMatch(
        /Sitemap:\s*https:\/\/nick\.karnik\.io\/sitemap\.xml/i
      );
    });
  });

  describe('Redirects', () => {
    test('_redirects should exist', () => {
      const redirectsPath = join(distPath, '_redirects');
      expect(existsSync(redirectsPath)).toBe(true);
    });

    test('_redirects should have proper format', () => {
      const redirectsPath = join(distPath, '_redirects');
      const redirectsContent = readFileSync(redirectsPath, 'utf-8');

      // Check that it's not empty
      expect(redirectsContent.trim()).not.toBe('');

      // Check for common redirect patterns
      const lines = redirectsContent.split('\n').filter(line => line.trim());
      expect(lines.length).toBeGreaterThan(0);

      // Each line should have a source and destination
      lines.forEach(line => {
        const parts = line.split(/\s+/);
        expect(parts.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Data Files', () => {
    test('hashnode.json should exist and be valid JSON', () => {
      const hashnodePath = join(distPath, 'data', 'hashnode.json');
      expect(existsSync(hashnodePath)).toBe(true);

      const hashnodeContent = readFileSync(hashnodePath, 'utf-8');
      expect(() => JSON.parse(hashnodeContent)).not.toThrow();
    });

    test('about.json should exist and be valid JSON', () => {
      const aboutPath = join(distPath, 'data', 'pages', 'about.json');
      expect(existsSync(aboutPath)).toBe(true);

      const aboutContent = readFileSync(aboutPath, 'utf-8');
      expect(() => JSON.parse(aboutContent)).not.toThrow();
    });

    test('blog post JSON should exist and be valid', () => {
      const postPath = join(
        distPath,
        'data',
        'posts',
        'how-engineers-can-use-ai-effectively.json'
      );
      expect(existsSync(postPath)).toBe(true);

      const postContent = readFileSync(postPath, 'utf-8');
      expect(() => JSON.parse(postContent)).not.toThrow();
    });
  });

  describe('Assets Directory', () => {
    test('assets directory should exist', () => {
      const assetsPath = join(distPath, 'assets');
      expect(existsSync(assetsPath)).toBe(true);
    });

    test('should have JavaScript bundle', () => {
      const assetsPath = join(distPath, 'assets');
      const files = require('fs').readdirSync(assetsPath);
      const jsFiles = files.filter((file: string) => file.endsWith('.js'));
      expect(jsFiles.length).toBeGreaterThan(0);
    });

    test('should have images directory', () => {
      const imagesPath = join(distPath, 'assets', 'images');
      expect(existsSync(imagesPath)).toBe(true);
    });

    test('should have documents directory', () => {
      const documentsPath = join(distPath, 'assets', 'documents');
      expect(existsSync(documentsPath)).toBe(true);
    });
  });
});
