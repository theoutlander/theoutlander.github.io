import { css, cx } from "../../styled-system/css/index.mjs";
import type { BlogPost } from "../types/blog";

const listCardContent = css({
	p: 4,
	display: "flex",
	flexDirection: "column",
	flex: 1,
});

/** Separates cover from body; must be a static `css()` call (Panda does not emit spread conditionals). */
const listCardContentAfterCover = css({
	borderTop: "1px solid #e5e5e5",
});

function parsePostDate(date: string): number {
	const t = Date.parse(date);
	return Number.isNaN(t) ? 0 : t;
}

function formatDisplayDate(date: string): string {
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return date;
	return d.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function excerptSnippet(excerpt: string, maxLen = 180): string {
	const t = excerpt.trim().replace(/\s+/g, " ");
	if (t.length <= maxLen) return t;
	return `${t.slice(0, maxLen).trim()}…`;
}

export default function RecentWriting({ posts }: { posts: BlogPost[] }) {
	const list = [...(posts ?? [])]
		.sort((a, b) => parsePostDate(b.date) - parsePostDate(a.date))
		.slice(0, 3);

	if (list.length === 0) return null;

	return (
		<section
			data-testid="recent-writing"
			className={css({
				bg: "white",
				mt: "0",
				py: { base: "6", md: "8" },
				_dark: { bg: "dark.surface" },
			})}
			aria-labelledby="recent-writing-heading"
		>
			<div
				className={css({
					maxW: "1040px",
					mx: "auto",
					px: { base: "4", md: "6", lg: "8" },
				})}
			>
				<h2
					id="recent-writing-heading"
					className={css({
						fontWeight: "bold",
						fontSize: { base: "2xl", sm: "3xl", md: "4xl" },
						mb: { base: "6", md: "8" },
						color: { base: "gray.900", _dark: "dark.text" },
						lineHeight: "1.2",
					})}
				>
					Recent Writing
				</h2>
				<ul
					className={css({
						listStyle: "none",
						m: 0,
						p: 0,
						display: "grid",
						gridTemplateColumns: { base: "1fr", md: "repeat(2, 1fr)" },
						gap: 6,
						alignItems: "stretch",
					})}
				>
					{list.map((post) => (
						<li
							key={post.slug}
							className={css({
								display: "flex",
								minH: 0,
							})}
						>
							<a
								href={post.url}
								className={css({
									textDecoration: "none",
									color: "inherit",
									display: "flex",
									height: "100%",
									width: "100%",
									_focusVisible: {
										outline: "2px solid",
										outlineColor: "brand.600",
										outlineOffset: "4px",
										borderRadius: "2xl",
									},
								})}
							>
								<div
									className={css({
										borderRadius: "2xl",
										overflow: "hidden",
										shadow: "sm",
										bg: "white",
										border: "1px solid",
										borderColor: "#e5e5e5",
										_hover: { shadow: "md", transform: "translateY(-2px)" },
										transition: "all 120ms",
										display: "flex",
										flexDirection: "column",
										width: "100%",
										"@media (prefers-reduced-motion: reduce)": {
											transition: "none",
											_hover: {
												transform: "none",
											},
										},
									})}
								>
									{post.cover ? (
										<img
											src={post.cover}
											alt={post.title || "Blog post cover image"}
											loading="lazy"
											className={css({
												display: "block",
												h: "200px",
												w: "100%",
												objectFit: "cover",
												flexShrink: 0,
											})}
										/>
									) : null}

									<div
										className={cx(
											listCardContent,
											post.cover ? listCardContentAfterCover : ""
										)}
									>
										<h3
											className={css({
												color: "#000",
												fontWeight: "600",
												fontSize: "lg",
											})}
										>
											{post.title}
										</h3>

										<time
											dateTime={post.date}
											className={css({
												display: "block",
												fontSize: "sm",
												color: "#666",
												mt: 1,
											})}
										>
											{formatDisplayDate(post.date)}
										</time>

										<p
											className={css({
												mt: 3,
												color: "#000",
												flex: 1,
												display: "-webkit-box",
												WebkitLineClamp: 3,
												WebkitBoxOrient: "vertical",
												overflow: "hidden",
												m: 0,
											})}
										>
											{excerptSnippet(post.excerpt)}
										</p>
									</div>
								</div>
							</a>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
