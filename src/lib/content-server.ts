import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";
import { marked } from "marked";
import type { BlogPost } from "../types/blog";

/** What to include when loading posts. `'public'` = shipped site (no drafts / future-dated). */
export type BlogVisibility = "public" | "all";

interface FrontMatter {
	id: string;
	title: string;
	date: string;
	cover: string;
	excerpt: string;
	category?: string;
	tags: string[];
	draft?: boolean;
	published?: boolean;
}

/** Listing + JSON match the public site unless `BLOG_SHOW_ALL=1` (preview drafts / future-dated locally). */
function defaultVisibility(): BlogVisibility {
	if (process.env.BLOG_SHOW_ALL === "1") return "all";
	return "public";
}

/** True if this post may appear on the public site (listing + JSON export + direct URL in prod). */
export function isPostPublicForSite(fm: Pick<FrontMatter, "date"> & Partial<Pick<FrontMatter, "draft" | "published">>): boolean {
	if (fm.draft === true) return false;
	if (fm.published === false) return false;
	if (!fm.date) return true;
	if (isScheduledForFutureCalendarDay(fm.date)) return false;
	return true;
}

function isScheduledForFutureCalendarDay(dateStr: string): boolean {
	const post = new Date(dateStr);
	if (Number.isNaN(post.getTime())) return false;
	const postDay = post.toISOString().slice(0, 10);
	const todayDay = new Date().toISOString().slice(0, 10);
	return postDay > todayDay;
}

function parseFrontMatter(content: string): {
	frontMatter: FrontMatter;
	markdown: string;
} {
	const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
	const match = content.match(frontMatterRegex);

	if (!match) {
		throw new Error("Invalid front matter format");
	}

	const frontMatterText = match[1];
	const markdown = match[2];

	const frontMatter: Partial<FrontMatter> = {};
	const lines = frontMatterText.split("\n");

	for (const line of lines) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;

		const colonIndex = trimmed.indexOf(":");
		if (colonIndex === -1) continue;

		const key = trimmed.slice(0, colonIndex).trim();
		let value = trimmed.slice(colonIndex + 1).trim();

		// Remove quotes if present
		if (
			(value.startsWith('"') && value.endsWith('"')) ||
			(value.startsWith("'") && value.endsWith("'"))
		) {
			value = value.slice(1, -1);
		}

		if (key === "draft" || key === "published") {
			const lower = value.toLowerCase();
			if (lower === "true") {
				(frontMatter as any)[key] = true;
			} else if (lower === "false") {
				(frontMatter as any)[key] = false;
			} else {
				(frontMatter as any)[key] = value;
			}
			continue;
		}

		// Handle array values
		if (key === "tags" && value.startsWith("[") && value.endsWith("]")) {
			const arrayContent = value.slice(1, -1);
			frontMatter[key] = arrayContent
				.split(",")
				.map((item) => item.trim().replace(/^["']|["']$/g, ""))
				.filter((item) => item.length > 0);
		} else {
			(frontMatter as any)[key] = value;
		}
	}

	return {
		frontMatter: frontMatter as FrontMatter,
		markdown,
	};
}

function getSlugFromFilename(filename: string): string {
	if (!filename) return "";
	return filename.replace(/\.md$/, "");
}

/** Wrap each markdown-generated table for horizontal scroll without breaking table layout */
function wrapBlogPostTables(html: string): string {
	return html.replace(
		/<table\b[^>]*>[\s\S]*?<\/table>/gi,
		'<div class="blog-post-table-wrap">$&</div>'
	);
}

/**
 * Removes all Mermaid code blocks from markdown.
 * Images are preserved, but all Mermaid blocks are removed.
 */
function removeAllMermaidBlocks(markdown: string): string {
	const lines = markdown.split('\n');
	const processedLines: string[] = [];
	let i = 0;

	while (i < lines.length) {
		// Check if current line starts a Mermaid block
		if (lines[i].trim() === '```mermaid') {
			const mermaidStart = i;
			let mermaidEnd = i;

			// Find the end of the Mermaid block
			for (let j = i + 1; j < lines.length; j++) {
				if (lines[j].trim() === '```') {
					mermaidEnd = j;
					break;
				}
			}

			// Remove the Mermaid block (skip it)
			i = mermaidEnd + 1;
		} else {
			processedLines.push(lines[i]);
			i++;
		}
	}

	return processedLines.join('\n');
}

/**
 * Removes `<!-- build-todo --> ... <!-- /build-todo -->` regions from markdown
 * before HTML conversion. Content is omitted from published JSON/HTML but logged
 * during `generate-blog-data` / dev loads so unfinished cross-links stay tracked.
 */
function removeBuildTodoSections(markdown: string, slug: string): string {
	const pattern =
		/<!--\s*build-todo\s*-->([\s\S]*?)<!--\s*\/build-todo\s*-->/gi;
	let matchCount = 0;

	const stripped = markdown.replace(pattern, (_full, inner: string) => {
		matchCount += 1;
		const body = inner.trim();
		const preview =
			body.length > 400 ? `${body.slice(0, 400)}…` : body;
		console.log(
			`[blog build-todo] ${slug} (#${matchCount}):\n${preview}\n`
		);
		return "";
	});

	return stripped.replace(/\n{3,}/g, "\n\n");
}

async function compileMarkdownToBlogPost(
	frontMatter: FrontMatter,
	markdown: string,
	slug: string
): Promise<BlogPost> {
	let processedMarkdown = removeAllMermaidBlocks(markdown);
	processedMarkdown = removeBuildTodoSections(processedMarkdown, slug);

	const rawHtml = await marked(processedMarkdown, {
		breaks: true,
		gfm: true,
	});
	const contentHtml = wrapBlogPostTables(rawHtml);

	return {
		id: frontMatter.id,
		slug,
		title: frontMatter.title,
		excerpt: frontMatter.excerpt,
		url: `https://nick.karnik.io/blog/${slug}`,
		date: frontMatter.date,
		cover: frontMatter.cover || null,
		category: frontMatter.category?.trim() || null,
		tags: frontMatter.tags || [],
		contentMarkdown: processedMarkdown,
		contentHtml,
	};
}

async function buildBlogPostFromMarkdownContent(
	content: string,
	slug: string,
	visibility: BlogVisibility
): Promise<BlogPost | null> {
	const { frontMatter, markdown } = parseFrontMatter(content);
	if (visibility === "public" && !isPostPublicForSite(frontMatter)) {
		return null;
	}
	return compileMarkdownToBlogPost(frontMatter, markdown, slug);
}

export async function loadAllBlogPosts(options?: {
	visibility?: BlogVisibility;
}): Promise<BlogPost[]> {
	const visibility = options?.visibility ?? defaultVisibility();
	const contentDir = join(process.cwd(), "content", "blog");
	const files = readdirSync(contentDir).filter(
		(file) => file.endsWith(".md") && !file.startsWith("_")
	);

	const posts: BlogPost[] = [];

	for (const file of files) {
		try {
			const filePath = join(contentDir, file);
			const content = readFileSync(filePath, "utf-8");
			const slug = getSlugFromFilename(file);

			const post = await buildBlogPostFromMarkdownContent(
				content,
				slug,
				visibility
			);
			if (!post) continue;

			posts.push(post);
		} catch (error) {
			console.error(`Error loading blog post ${file}:`, error);
		}
	}

	// Sort by date (newest first)
	return posts.sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
	);
}

export async function loadBlogPost(slug: string): Promise<BlogPost | null> {
	const contentDir = join(process.cwd(), "content", "blog");
	const filePath = join(contentDir, `${slug}.md`);
	if (!existsSync(filePath)) return null;

	const content = readFileSync(filePath, "utf-8");
	return buildBlogPostFromMarkdownContent(
		content,
		slug,
		defaultVisibility()
	);
}

export function getBlogPostSlugs(): string[] {
	const contentDir = join(process.cwd(), "content", "blog");
	const files = readdirSync(contentDir).filter(
		(file) => file.endsWith(".md") && !file.startsWith("_")
	);
	const slugs: string[] = [];
	for (const file of files) {
		try {
			const content = readFileSync(join(contentDir, file), "utf-8");
			const { frontMatter } = parseFrontMatter(content);
			if (isPostPublicForSite(frontMatter)) {
				slugs.push(getSlugFromFilename(file));
			}
		} catch {
			// skip invalid files
		}
	}
	return slugs;
}

export type { BlogPost };
