import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/codebots/",
  plugins: [react()],
  build: {
    outDir: "dist",
    // Phaser is large; raise the warning ceiling so the build stays quiet.
    chunkSizeWarningLimit: 1500,
  },
  worker: {
    format: "es",
  },
});
