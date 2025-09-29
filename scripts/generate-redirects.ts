import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { generateRedirectsFile } from "../src/redirects";

// Generate _redirects file for GitHub Pages
const redirectsContent = generateRedirectsFile();
writeFileSync(join(process.cwd(), "public", "_redirects"), redirectsContent);
writeFileSync(join(process.cwd(), "dist", "_redirects"), redirectsContent);

console.log("✅ Redirects generated successfully!");
console.log("📁 Files created:");
console.log("  - public/_redirects");
console.log("  - dist/_redirects");
