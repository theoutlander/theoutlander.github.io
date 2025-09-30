import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}', './pages/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: {
            50: { value: '#eff6ff' },
            100: { value: '#dbeafe' },
            200: { value: '#bfdbfe' },
            300: { value: '#a3cfff' },
            400: { value: '#60a5fa' },
            500: { value: '#3b82f6' },
            600: { value: '#2563eb' },
            700: { value: '#173da6' },
            800: { value: '#1a3478' },
            900: { value: '#14204a' },
            950: { value: '#0c142e' },
          },
        },
        fonts: {
          heading: {
            value:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          },
          body: {
            value:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
          },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',

  // Static extraction for SSR
  staticCss: {
    recipes: {
      // Add any recipe patterns you want to always include
    },
  },
});
