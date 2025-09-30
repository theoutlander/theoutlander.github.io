import { renderAllStaticPages } from '../src/static-renderer.js';

async function main() {
  try {
    await renderAllStaticPages();
  } catch (error) {
    console.error('Error rendering static pages:', error);
    process.exit(1);
  }
}

main();
