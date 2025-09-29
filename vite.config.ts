// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { redirectPlugin } from "./src/plugins/vite-redirect-plugin";
import ssrSsg from "vite-plugin-ssr-ssg";

export default defineConfig({
	base: "/",
	plugins: [
		tanstackRouter({
			routesDirectory: "./src/routes",
			generatedRouteTree: "./src/routeTree.gen.ts",
			autoCodeSplitting: true,
		}),
		react(),
		redirectPlugin(),
		ssrSsg({
			render: "react",
			entry: "./src/ssg.ts",
		}),
	],
	build: {
		outDir: "dist",
		assetsDir: "assets",
	},
});
