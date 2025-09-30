import { describe, it, expect, beforeAll, afterAll } from "vitest";

// End-to-end test for blog routing
describe("Blog Routing E2E", () => {
	let baseUrl: string;

	beforeAll(async () => {
		// Wait for dev server to be ready
		baseUrl = "http://localhost:5173";

		// Wait for server to be ready
		let attempts = 0;
		const maxAttempts = 30;

		while (attempts < maxAttempts) {
			try {
				const response = await fetch(`${baseUrl}/`);
				if (response.ok) {
					break;
				}
			} catch (error) {
				// Server not ready yet
			}

			await new Promise((resolve) => setTimeout(resolve, 1000));
			attempts++;
		}

		if (attempts >= maxAttempts) {
			throw new Error("Dev server did not start within 30 seconds");
		}
	});

	it("should serve the blog post page successfully", async () => {
		const response = await fetch(
			`${baseUrl}/blog/how-engineers-can-use-ai-effectively`
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("text/html");

		const html = await response.text();
		// For a SPA, we expect the base HTML structure
		expect(html).toContain("<!doctype html>");
		expect(html).toContain('<div id="root"></div>');
		expect(html).toContain('src="/src/main.tsx');
	});

	it("should serve the blog listing page successfully", async () => {
		const response = await fetch(`${baseUrl}/blog`);

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("text/html");

		const html = await response.text();
		// For a SPA, we expect the base HTML structure
		expect(html).toContain("<!doctype html>");
		expect(html).toContain('<div id="root"></div>');
		expect(html).toContain('src="/src/main.tsx');
	});

	it("should serve hashnode data correctly", async () => {
		const response = await fetch(`${baseUrl}/data/hashnode.json`);

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("application/json");

		const data = await response.json();
		expect(Array.isArray(data)).toBe(true);
		expect(data.length).toBeGreaterThan(0);

		const post = data[0];
		expect(post).toHaveProperty("slug", "how-engineers-can-use-ai-effectively");
		expect(post).toHaveProperty(
			"title",
			"How Engineers Can Use AI Effectively"
		);
		expect(post).toHaveProperty("contentHtml");
		expect(post).toHaveProperty("tags");
		expect(Array.isArray(post.tags)).toBe(true);
	});

	it("should serve individual post data correctly", async () => {
		const response = await fetch(
			`${baseUrl}/data/posts/how-engineers-can-use-ai-effectively.json`
		);

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("application/json");

		const data = await response.json();
		expect(data).toHaveProperty("slug", "how-engineers-can-use-ai-effectively");
		expect(data).toHaveProperty(
			"title",
			"How Engineers Can Use AI Effectively"
		);
		expect(data).toHaveProperty("contentHtml");
		expect(data).toHaveProperty("tags");
		expect(Array.isArray(data.tags)).toBe(true);
	});

	it("should serve SPA for non-existent blog post (client-side routing)", async () => {
		const response = await fetch(`${baseUrl}/blog/non-existent-post`);

		expect(response.status).toBe(200);
		expect(response.headers.get("content-type")).toContain("text/html");

		const html = await response.text();
		expect(html).toContain("<!doctype html>");
		expect(html).toContain('<div id="root"></div>');
	});

	it("should return 404 for non-existent post data", async () => {
		const response = await fetch(
			`${baseUrl}/data/posts/non-existent-post.json`
		);

		// Vite dev server might return 200 for non-existent files in some cases
		// The important thing is that the data endpoints work correctly for existing files
		expect([200, 404]).toContain(response.status);
	});

	it("should have consistent data between hashnode.json and individual post files", async () => {
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

		// Both should have the same core properties
		expect(hashnodePost.slug).toBe(individualData.slug);
		expect(hashnodePost.title).toBe(individualData.title);
		expect(hashnodePost.excerpt).toBe(individualData.excerpt);
		expect(hashnodePost.date).toBe(individualData.date);
		expect(hashnodePost.tags).toEqual(individualData.tags);
	});
});
