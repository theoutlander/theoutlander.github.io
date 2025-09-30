import { renderAllStaticPagesSSR } from '../src/ssr-renderer.js';

async function main() {
  try {
    await renderAllStaticPagesSSR();
  } catch (error) {
    console.error('Error rendering static pages with SSR:', error);
    process.exit(1);
  }
}

main();
