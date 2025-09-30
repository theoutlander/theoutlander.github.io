// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { redirectPlugin } from './src/plugins/vite-redirect-plugin';
// @ts-expect-error - vite-plugin-ssr-ssg has type declaration issues
import ssrSsg from 'vite-plugin-ssr-ssg';

export default defineConfig({
  base: '/',
  plugins: [
    tanstackRouter({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      autoCodeSplitting: false,
    }),
    react(),
    redirectPlugin(),
    ssrSsg({
      render: 'react',
      entry: './src/ssg.ts',
      prerender: true,
    }),
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
