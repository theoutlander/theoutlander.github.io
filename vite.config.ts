// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { redirectPlugin } from './src/plugins/vite-redirect-plugin';

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
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Inline all CSS into the HTML
        assetFileNames: assetInfo => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name].[hash][extname]';
          }
          return 'assets/[name].[hash][extname]';
        },
      },
    },
    // Ensure CSS is inlined
    cssCodeSplit: false,
  },
  // Disable client-side hydration for static generation
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'production'
    ),
  },
});
