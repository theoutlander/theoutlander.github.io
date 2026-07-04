// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { redirectPlugin } from "./src/plugins/vite-redirect-plugin";
import { blogPlugin } from "./src/plugins/vite-blog-plugin";
import { staticFolderDevPlugin } from "./src/plugins/vite-static-folder-dev-plugin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	base: "/",
	plugins: [
		react(),
		TanStackRouterVite(),
		redirectPlugin(),
		blogPlugin(),
		staticFolderDevPlugin("/maya", path.join(__dirname, "projects/maya")),
		staticFolderDevPlugin("/lab", path.join(__dirname, "projects/lab")),
		staticFolderDevPlugin("/judgement", path.join(__dirname, "projects/judgement")),
	],
	server: {
		host: true, // Listen on all network interfaces
		port: 5173,
		strictPort: false,
		allowedHosts: [".ngrok-free.app", ".ngrok.io", "localhost"],
		https: fs.existsSync(".cert/localhost+3.pem")
			? {
					key: fs.readFileSync(".cert/localhost+3-key.pem"),
					cert: fs.readFileSync(".cert/localhost+3.pem"),
			  }
			: undefined,
	},
	preview: {
		port: 5173,
		host: true,
		https: fs.existsSync(".cert/localhost+3.pem")
			? {
					key: fs.readFileSync(".cert/localhost+3-key.pem"),
					cert: fs.readFileSync(".cert/localhost+3.pem"),
			  }
			: undefined,
	},
	build: {
		outDir: "dist",
		assetsDir: "assets",
		minify: "esbuild",
		esbuild: {
			keepNames: true,
			legalComments: "none",
		},
		rollupOptions: {
			output: {
				manualChunks(id) {
					if (id.includes("node_modules")) {
						if (id.includes("react")) return "vendor-react";
						if (id.includes("@tanstack")) return "vendor-router";
						if (
							id.includes("react-markdown") ||
							id.includes("remark") ||
							id.includes("rehype")
						) {
							return "vendor-markdown";
						}
						return "vendor";
					}
				},
			},
		},
	},
	define: {
		"process.env.NODE_ENV": JSON.stringify(
			process.env.NODE_ENV || "production"
		),
	},
});
