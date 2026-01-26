import { Plugin } from 'vite';
import type { ViteDevServer } from 'vite';
import { readFileSync, existsSync, watch } from 'fs';
import { join } from 'path';
import { spawn } from 'child_process';

let isRegenerating = false;
let regenerationTimeout: NodeJS.Timeout | null = null;

function regenerateBlogData(server: ViteDevServer) {
  if (isRegenerating) return;

  // Debounce rapid file changes
  if (regenerationTimeout) {
    clearTimeout(regenerationTimeout);
  }

  regenerationTimeout = setTimeout(() => {
    isRegenerating = true;
    console.log('🔄 Regenerating blog data from markdown files...');

    const child = spawn('tsx', ['scripts/generate-blog-data.ts'], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      isRegenerating = false;
      if (code === 0) {
        console.log('✅ Blog data regenerated successfully');
        // Trigger HMR update instead of full reload
        if (server && server.ws) {
          // Invalidate route modules that use blog data
          const routeModules = [
            '/src/routes/blog/$slug.tsx',
            '/src/routes/blog/index.tsx',
            '/src/routes/index.tsx',
            '/src/lib/content.ts'
          ];

          routeModules.forEach(modulePath => {
            const module = server.moduleGraph.getModuleById(modulePath);
            if (module) {
              server.moduleGraph.invalidateModule(module);
            }
          });

          // Send custom HMR event for blog data update
          server.ws.send({
            type: 'custom',
            event: 'blog-data-updated',
            data: {
              timestamp: Date.now()
            }
          });

          console.log('🔄 Triggered HMR update for blog data');
        }
      } else {
        console.error(`❌ Blog data regeneration failed with code ${code}`);
      }
    });

    child.on('error', (error) => {
      isRegenerating = false;
      console.error('❌ Error regenerating blog data:', error);
    });
  }, 300); // 300ms debounce
}

export function blogPlugin(): Plugin {
  return {
    name: 'blog-plugin',
    configureServer(server) {
      // Watch markdown files for changes
      const contentDir = join(process.cwd(), 'content', 'blog');
      const watcher = watch(contentDir, { recursive: false }, (eventType, filename) => {
        if (filename && filename.endsWith('.md') && !filename.startsWith('_')) {
          console.log(`📝 Detected change in ${filename}`);
          regenerateBlogData(server);
        }
      });

      // Clean up watcher on server close
      server.httpServer?.once('close', () => {
        watcher.close();
      });

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
