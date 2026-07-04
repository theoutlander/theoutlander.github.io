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
 * Serves a repo-root folder (e.g. `maya/`, `lab/`) at a matching URL prefix during `vite` dev.
 * Production copies these folders into `dist/` in the SSR script; they're not under `public/`,
 * so without this, their routes 404 locally.
 */
export function staticFolderDevPlugin(mountPath: string, folderRoot: string): Plugin {
	const root = path.resolve(folderRoot);

	return {
		name: `static-folder-dev${mountPath}`,
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const raw = req.url?.split("?")[0] ?? "";
				let pathname: string;
				try {
					pathname = decodeURIComponent(raw);
				} catch {
					return next();
				}
				if (!pathname.startsWith(mountPath)) return next();

				let rel = pathname.slice(mountPath.length);
				// Redirect bare mount → mount/ so relative links resolve correctly
				if (rel === "") {
					res.writeHead(301, { Location: `${mountPath}/` });
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
