import { Link } from "@tanstack/react-router";
import { css } from "../../../styled-system/css/index.mjs";
import type { Post } from "../../types/blog";

const RECENT_COUNT = 10;

type BlogSidebarProps = {
	posts?: Post[] | null;
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

export default function BlogSidebar({ posts: postsProp }: BlogSidebarProps) {
	const posts = postsProp ?? [];
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
				"@media (min-width: 768px)": {
					w: "280px",
					flexShrink: 0,
				},
			})}
			aria-label="Blog navigation"
		>
			<nav
				className={css({
					display: "flex",
					flexDirection: "column",
					gap: 8,
				})}
			>
				{categories.length > 0 && (
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
							Categories
						</h2>
						<div
							className={css({
								display: "flex",
								flexWrap: "wrap",
								gap: 2,
							})}
						>
							{categories.map((cat) => (
								<Link
									key={cat}
									to="/blog"
									search={{ category: cat }}
									className={css({
										fontSize: "sm",
										color: "#333",
										textDecoration: "none",
										_hover: { textDecoration: "underline" },
									})}
								>
									{cat}
								</Link>
							))}
						</div>
					</section>
				)}

				{tags.length > 0 && (
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
						<div
							className={css({
								display: "flex",
								flexWrap: "wrap",
								gap: 2,
							})}
						>
							{tags.map((tag) => (
								<Link
									key={tag}
									to="/blog"
									search={{ tag }}
									className={css({
										fontSize: "sm",
										color: "#333",
										textDecoration: "none",
										_hover: { textDecoration: "underline" },
									})}
								>
									{tag}
								</Link>
							))}
						</div>
					</section>
				)}

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
								<Link
									to="/blog/$slug"
									params={{ slug: p.slug }}
									className={css({
										fontSize: "sm",
										color: "#333",
										textDecoration: "none",
										lineHeight: 1.4,
										_hover: { textDecoration: "underline" },
									})}
								>
									{p.title}
								</Link>
							</li>
						))}
					</ul>
				</section>
			</nav>
		</aside>
	);
}
