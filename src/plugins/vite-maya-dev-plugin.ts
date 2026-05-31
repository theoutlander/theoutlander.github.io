import fs from "fs";
import path from "path";
import type { Plugin } from "vite";

const MIME: Record<string, string> = {
	".html": "text/html; charset=utf-8",
	".htm": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".mjs": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".json": "application/json",
	".svg": "image/svg+xml",
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".webp": "image/webp",
	".ico": "image/x-icon",
	".woff2": "font/woff2",
	".woff": "font/woff",
	".md": "text/markdown; charset=utf-8",
};

/**
 * Serves repo-root `maya/` at `/maya` during `vite` dev. Production copies `maya` → `dist/maya`
 * in the SSR script; that folder is not under `public/`, so without this, `/maya` 404s locally.
 */
export function mayaDevPlugin(mayaRoot: string): Plugin {
	const root = path.resolve(mayaRoot);

	return {
		name: "maya-dev-static",
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const raw = req.url?.split("?")[0] ?? "";
				let pathname: string;
				try {
					pathname = decodeURIComponent(raw);
				} catch {
					return next();
				}
				if (!pathname.startsWith("/maya")) return next();

				let rel = pathname.slice("/maya".length);
				// Redirect bare /maya → /maya/ so relative links resolve correctly
				if (rel === "") {
					res.writeHead(301, { Location: "/maya/" });
					res.end();
					return;
				}
				if (rel === "/") rel = "/index.html";

				const parts = rel.split("/").filter(Boolean);
				if (parts.some((p) => p === "..")) return next();

				let filePath = path.join(root, ...parts);
				try {
					if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
						filePath = path.join(filePath, "index.html");
					}
				} catch {
					return next();
				}

				const resolvedRoot = path.resolve(root);
				const resolvedFile = path.resolve(filePath);
				if (
					!resolvedFile.startsWith(resolvedRoot + path.sep) &&
					resolvedFile !== resolvedRoot
				) {
					return next();
				}

				if (!fs.existsSync(resolvedFile) || !fs.statSync(resolvedFile).isFile()) {
					return next();
				}

				const ext = path.extname(resolvedFile).toLowerCase();
				res.setHeader("Content-Type", MIME[ext] ?? "application/octet-stream");
				fs.createReadStream(resolvedFile).on("error", next).pipe(res);
			});
		},
	};
}
