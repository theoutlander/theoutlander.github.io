import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://theoutlander.github.io",
  base: "/",
  output: "static",
  integrations: [sitemap()],
});