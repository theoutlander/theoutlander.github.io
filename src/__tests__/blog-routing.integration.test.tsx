import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createServer } from "http";
import { readFileSync } from "fs";
import { join } from "path";

// Integration test for blog routing with real server
describe("Blog Routing Integration", () => {
	let server: any;
	let baseUrl: string;

	beforeAll(async () => {
		// Start a simple HTTP server to serve static files
		server = createServer((req, res) => {
			const url = req.url || "";

			// Set CORS headers
			res.setHeader("Access-Control-Allow-Origin", "*");
			res.setHeader(
				"Access-Control-Allow-Methods",
				"GET, POST, PUT, DELETE, OPTIONS"
			);
			res.setHeader(
				"Access-Control-Allow-Headers",
				"Content-Type, Authorization"
			);

			if (req.method === "OPTIONS") {
				res.writeHead(200);
				res.end();
				return;
			}

			// Serve the hashnode.json file
			if (url === "/data/hashnode.json") {
				try {
					const data = readFileSync(
						join(process.cwd(), "public/data/hashnode.json"),
						"utf8"
					);
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(data);
				} catch (error) {
					res.writeHead(404);
					res.end("Not found");
				}
				return;
			}

			// Serve individual post files
			if (url.startsWith("/data/posts/") && url.endsWith(".json")) {
				try {
					const filename = url.split("/").pop();
					const data = readFileSync(
						join(process.cwd(), "public/data/posts", filename!),
						"utf8"
					);
					res.writeHead(200, { "Content-Type": "application/json" });
					res.end(data);
				} catch (error) {
					res.writeHead(404);
					res.end("Not found");
				}
				return;
			}

			// Default response
			res.writeHead(404);
			res.end("Not found");
		});

		// Start server on a random port
		await new Promise<void>((resolve) => {
			server.listen(0, () => {
				const port = server.address()?.port;
				baseUrl = `http://localhost:${port}`;
				resolve();
			});
		});
	});

	afterAll(async () => {
		if (server) {
			await new Promise<void>((resolve) => {
				server.close(() => resolve());
			});
		}
	});

	it("should fetch hashnode data successfully", async () => {
		const response = await fetch(`${baseUrl}/data/hashnode.json`);
		expect(response.ok).toBe(true);

		const data = await response.json();
		expect(Array.isArray(data)).toBe(true);
		expect(data.length).toBeGreaterThan(0);

		const post = data[0];
		expect(post).toHaveProperty("slug");
		expect(post).toHaveProperty("title");
		expect(post).toHaveProperty("excerpt");
		expect(post).toHaveProperty("date");
		expect(post).toHaveProperty("tags");
	});

	it("should fetch individual post data successfully", async () => {
		const response = await fetch(
			`${baseUrl}/data/posts/how-engineers-can-use-ai-effectively.json`
		);
		expect(response.ok).toBe(true);

		const data = await response.json();
		// Individual post files don't have slug property, they use filename as identifier
		expect(data).toHaveProperty("id", "68d72ef766a499385385e183");
		expect(data).toHaveProperty(
			"title",
			"How Engineers Can Use AI Effectively"
		);
		expect(data).toHaveProperty("html"); // Individual posts use 'html' not 'contentHtml'
		expect(data).toHaveProperty("tags");
		expect(Array.isArray(data.tags)).toBe(true);
	});

	it("should return 404 for non-existent post", async () => {
		const response = await fetch(
			`${baseUrl}/data/posts/non-existent-post.json`
		);
		expect(response.status).toBe(404);
	});

	it("should have consistent data structure between hashnode.json and individual post files", async () => {
		const [hashnodeResponse, individualResponse] = await Promise.all([
			fetch(`${baseUrl}/data/hashnode.json`),
			fetch(`${baseUrl}/data/posts/how-engineers-can-use-ai-effectively.json`),
		]);

		expect(hashnodeResponse.ok).toBe(true);
		expect(individualResponse.ok).toBe(true);

		const [hashnodeData, individualData] = await Promise.all([
			hashnodeResponse.json(),
			individualResponse.json(),
		]);

		const hashnodePost = hashnodeData.find(
			(p: any) => p.slug === "how-engineers-can-use-ai-effectively"
		);
		expect(hashnodePost).toBeDefined();

		// Both should have the same core properties (accounting for different structures)
		expect(hashnodePost.id).toBe(individualData.id);
		expect(hashnodePost.title).toBe(individualData.title);
		expect(hashnodePost.excerpt).toBe(individualData.excerpt);
		expect(hashnodePost.date).toBe(individualData.date);
		expect(hashnodePost.tags).toEqual(individualData.tags);
		// hashnode has slug, individual posts don't
		expect(hashnodePost.slug).toBe("how-engineers-can-use-ai-effectively");
		// hashnode has contentHtml, individual posts have html
		expect(hashnodePost.contentHtml).toBeDefined();
		expect(individualData.html).toBeDefined();
	});

	it("should handle CORS properly", async () => {
		const response = await fetch(`${baseUrl}/data/hashnode.json`, {
			method: "OPTIONS",
		});

		expect(response.headers.get("Access-Control-Allow-Origin")).toBe("*");
		expect(response.headers.get("Access-Control-Allow-Methods")).toContain(
			"GET"
		);
	});
});
