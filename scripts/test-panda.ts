import { renderAllStaticPagesPanda } from '../src/ssr-renderer-panda.js';

async function main() {
  try {
    await renderAllStaticPagesPanda();
  } catch (error) {
    console.error('Error rendering static pages with Panda CSS:', error);
    process.exit(1);
  }
}

main();
