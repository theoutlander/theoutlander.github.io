// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { redirectPlugin } from './src/plugins/vite-redirect-plugin';

export default defineConfig({
  base: '/',
  plugins: [react(), TanStackRouterVite(), redirectPlugin()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'production'
    ),
  },
});
