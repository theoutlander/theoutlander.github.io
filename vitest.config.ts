/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'public/',
        'scripts/',
      ],
    },
    // Exclude E2E tests from regular test runs
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/*.e2e.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      // Standalone sub-apps under projects/ own their own vitest runner and node env.
      // Running their tests here (jsdom, root setup, coverage instrumentation) breaks them.
      'projects/**',
    ],
  },
});
