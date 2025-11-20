// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import { redirectPlugin } from "./src/plugins/vite-redirect-plugin";
import fs from "fs";

export default defineConfig({
	base: "/",
	plugins: [react(), TanStackRouterVite(), redirectPlugin()],
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
	},
	define: {
		"process.env.NODE_ENV": JSON.stringify(
			process.env.NODE_ENV || "production"
		),
	},
});
