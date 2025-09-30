import { Plugin } from 'vite';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export function blogPlugin(): Plugin {
  return {
    name: 'blog-plugin',
    configureServer(server) {
      server.middlewares.use('/blog', (req, res, next) => {
        // Check if this is a blog post route
        const blogPostMatch = req.url?.match(/^\/blog\/([^\/]+)\/?$/);

        if (blogPostMatch) {
          const slug = blogPostMatch[1];
          const staticFilePath = join(
            process.cwd(),
            'dist',
            'blog',
            slug,
            'index.html'
          );

          if (existsSync(staticFilePath)) {
            // Serve the static file
            const content = readFileSync(staticFilePath, 'utf-8');
            res.setHeader('Content-Type', 'text/html');
            res.end(content);
            return;
          }
        }

        next();
      });
    },
  };
}
