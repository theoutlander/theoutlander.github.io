import type { Plugin } from 'vite';
import { redirects } from '../redirects';

export function redirectPlugin(): Plugin {
  return {
    name: 'redirect-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // Only handle GET requests
        if (req.method !== 'GET') {
          return next();
        }

        const url = req.url;
        if (!url) {
          return next();
        }

        // Find matching redirect
        const redirect = redirects.find(r => r.source === url);

        if (redirect) {
          // Set appropriate status code
          res.statusCode = redirect.statusCode;

          // For permanent redirects (301, 308), use replace
          if (redirect.statusCode === 301 || redirect.statusCode === 308) {
            res.setHeader('Location', redirect.destination);
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            res.end();
            return;
          }

          // For temporary redirects (302), use redirect
          if (redirect.statusCode === 302) {
            res.setHeader('Location', redirect.destination);
            res.end();
            return;
          }
        }

        next();
      });
    },
  };
}
