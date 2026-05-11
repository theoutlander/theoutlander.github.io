import { Link } from "@tanstack/react-router";
import { css } from "../../../styled-system/css/index.mjs";
import type { Post } from "../../types/blog";
import { analytics } from "../../lib/analytics";

const isSSR = typeof window === "undefined";

const linkClass = css({
	fontSize: "sm",
	color: "#333",
	textDecoration: "none",
	_hover: { textDecoration: "underline" },
});

const linkClassTight = css({
	fontSize: "sm",
	color: "#333",
	textDecoration: "none",
	lineHeight: 1.4,
	_hover: { textDecoration: "underline" },
});

/** Blog index (bottom): obvious filter-style pills. Sidebar keeps compact text links. */
const categoryPillBottomClass = css({
	display: "inline-block",
	fontSize: "md",
	fontWeight: "600",
	color: { base: "gray.900", _dark: "white" },
	textDecoration: "none",
	padding: "10px 20px",
	borderRadius: "9999px",
	borderWidth: "2px",
	borderStyle: "solid",
	borderColor: { base: "gray.900", _dark: "gray.400" },
	backgroundColor: "transparent",
	cursor: "pointer",
	transition: "all 150ms ease",
	_hover: {
		backgroundColor: { base: "gray.900", _dark: "white" },
		color: { base: "white", _dark: "gray.900" },
	},
});

const RECENT_COUNT = 10;

type BlogSidebarProps = {
	posts?: Post[] | null;
	placement?: "sidebar" | "bottom";
};

function getAllCategories(posts: Post[]): string[] {
	const set = new Set<string>();
	for (const p of posts) {
		if (p.category?.trim()) set.add(p.category.trim());
	}
	return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

function getAllTags(posts: Post[]): string[] {
	const set = new Set<string>();
	for (const p of posts) {
		for (const tag of p.tags ?? []) {
			if (tag?.trim()) set.add(tag.trim());
		}
	}
	return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

export default function BlogSidebar({ posts: postsProp, placement = "sidebar" }: BlogSidebarProps) {
	const posts = postsProp ?? [];
	const isBottomPlacement = placement === "bottom";
	const showTags = !isBottomPlacement;
	const showRecent = !isBottomPlacement;
	const categories = getAllCategories(posts);
	const tags = getAllTags(posts);
	const recent = posts
		.slice()
		.sort((a, b) => (b.date && a.date ? new Date(b.date).getTime() - new Date(a.date).getTime() : 0))
		.slice(0, RECENT_COUNT);

	return (
		<aside
			className={css({
				w: "full",
				...(isBottomPlacement
					? {}
					: {
							"@media (min-width: 768px)": {
								w: "280px",
								flexShrink: 0,
							},
					  }),
			})}
			aria-label="Blog navigation"
		>
			<nav
				className={css({
					display: isBottomPlacement ? "flex" : "grid",
					gridTemplateColumns: { base: "1fr" },
					justifyContent: isBottomPlacement ? "center" : "initial",
					gap: 8,
				})}
			>
				{categories.length > 0 && (
					<section
						className={css({
							textAlign: isBottomPlacement ? "center" : "left",
							...(isBottomPlacement ? { mt: 8 } : {}),
						})}
					>
						<h2
							className={css({
								fontSize: "sm",
								fontWeight: "700",
								color: "#333",
								mb: 3,
								textTransform: "uppercase",
								letterSpacing: "wider",
							})}
						>
							Categories
						</h2>
						<ul
							className={css({
								listStyle: "none",
								p: 0,
								m: 0,
								display: "flex",
								flexDirection: isBottomPlacement ? "row" : "column",
								flexWrap: isBottomPlacement ? "wrap" : "nowrap",
								justifyContent: isBottomPlacement ? "center" : "flex-start",
								gap: isBottomPlacement ? { base: 3, md: 4 } : 2,
							})}
						>
							{categories.map((cat) => (
								<li key={cat}>
									{isSSR ? (
										<a
											href={`/blog?category=${encodeURIComponent(cat)}`}
											className={isBottomPlacement ? categoryPillBottomClass : linkClass}
											onClick={() => analytics.blogFilterApplied('category', cat)}
										>
											{cat}
										</a>
									) : (
										<Link
											to="/blog"
											search={{ category: cat }}
											className={isBottomPlacement ? categoryPillBottomClass : linkClass}
											onClick={() => analytics.blogFilterApplied('category', cat)}
										>
											{cat}
										</Link>
									)}
								</li>
							))}
						</ul>
					</section>
				)}

				{showTags && tags.length > 0 && (
					<section>
						<h2
							className={css({
								fontSize: "sm",
								fontWeight: "700",
								color: "#333",
								mb: 3,
								textTransform: "uppercase",
								letterSpacing: "wider",
							})}
						>
							Tags
						</h2>
						<ul
							className={css({
								listStyle: "none",
								p: 0,
								m: 0,
								display: "flex",
								flexDirection: "column",
								gap: 2,
							})}
						>
							{tags.map((tag) => (
								<li key={tag}>
									{isSSR ? (
										<a
											href={`/blog?tag=${encodeURIComponent(tag)}`}
											className={linkClass}
											onClick={() => analytics.blogFilterApplied('tag', tag)}
										>
											{tag}
										</a>
									) : (
										<Link
											to="/blog"
											search={{ tag }}
											className={linkClass}
											onClick={() => analytics.blogFilterApplied('tag', tag)}
										>
											{tag}
										</Link>
									)}
								</li>
							))}
						</ul>
					</section>
				)}

				{showRecent && (
					<section>
						<h2
							className={css({
								fontSize: "sm",
								fontWeight: "700",
								color: "#333",
								mb: 3,
								textTransform: "uppercase",
								letterSpacing: "wider",
							})}
						>
							Recent
						</h2>
						<ul
							className={css({
								listStyle: "none",
								p: 0,
								m: 0,
							})}
						>
							{recent.map((p) => (
								<li
									key={p.slug}
									className={css({
										mb: 2,
									})}
								>
									{isSSR ? (
										<a href={`/blog/${p.slug}`} className={linkClassTight}>
											{p.title}
										</a>
									) : (
										<Link
											to="/blog/$slug"
											params={{ slug: p.slug }}
											className={linkClassTight}
										>
											{p.title}
										</Link>
									)}
								</li>
							))}
						</ul>
					</section>
				)}
			</nav>
		</aside>
	);
}
