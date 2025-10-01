import { css } from "../../../styled-system/css/index.mjs";
// import { Helmet } from 'react-helmet-async';
import type { Post } from "./RoutePost";

export default function BlogList({
	posts,
	filterTag,
}: {
	posts: Post[];
	filterTag?: string;
}) {
	const items = posts.filter((p) => !filterTag || p.tags?.includes(filterTag));

	// Empty state
	if (items.length === 0) {
		return (
			<div
				className={css({
					textAlign: "center",
					py: { base: "12", md: "16" },
					px: "4",
				})}
			>
				<div
					className={css({
						maxW: "md",
						mx: "auto",
					})}
				>
					<div
						className={css({
							fontSize: "6xl",
							mb: "4",
							opacity: "0.6",
						})}
					>
						📝
					</div>
					<h2
						className={css({
							fontSize: { base: "xl", md: "2xl" },
							fontWeight: "bold",
							color: { base: "gray.900", _dark: "dark.text" },
							mb: "2",
						})}
					>
						{filterTag ? `No posts tagged "${filterTag}"` : "No posts yet"}
					</h2>
					<p
						className={css({
							fontSize: "lg",
							color: { base: "gray.600", _dark: "dark.textSecondary" },
							mb: "6",
						})}
					>
						{filterTag
							? "Try a different tag or check back later for new content."
							: "I'm working on some great content. Check back soon!"}
					</p>
					{filterTag && (
						<a
							href="/blog"
							className={css({
								display: "inline-flex",
								alignItems: "center",
								gap: "2",
								px: "4",
								py: "2",
								bg: "brand.600",
								color: "white",
								textDecoration: "none",
								borderRadius: "md",
								fontWeight: "medium",
								_hover: {
									bg: "brand.700",
									transform: "translateY(-1px)",
								},
								_focus: {
									outline: "2px solid brand.600",
									outlineOffset: "2px",
								},
								transition: "all 200ms ease",
								"@media (prefers-reduced-motion: reduce)": {
									transition: "none",
									_hover: {
										transform: "none",
									},
								},
							})}
						>
							<span>←</span>
							<span>View all posts</span>
						</a>
					)}
				</div>
			</div>
		);
	}

	return (
		<div>
			<div
				className={css({
					display: "grid",
					gridTemplateColumns: { base: "1fr", md: "repeat(2, 1fr)" },
					gap: 6,
				})}
			>
				{items.map((p) => (
					<div
						key={p.slug}
						className={css({
							borderRadius: "2xl",
							overflow: "hidden",
							shadow: "sm",
							bg: { base: "white", _dark: "dark.card" },
							border: "1px solid",
							borderColor: { base: "gray.200", _dark: "dark.border" },
							_hover: { shadow: "md", transform: "translateY(-2px)" },
							transition: "all 120ms",
							"@media (prefers-reduced-motion: reduce)": {
								transition: "none",
								_hover: {
									transform: "none",
								},
							},
						})}
					>
						{p.cover ? (
							<img
								src={p.cover}
								alt=""
								loading="lazy"
								className={css({
									objectFit: "cover",
									maxH: "260px",
									w: "100%",
								})}
							/>
						) : null}

						<div className={css({ p: 4 })}>
							<a
								href={`/blog/${p.slug}`}
								className={css({
									textDecoration: "none",
									color: { base: "brand.700", _dark: "brand.400" },
									fontWeight: "semibold",
									fontSize: "lg",
									_hover: { color: { base: "brand.600", _dark: "brand.300" } },
								})}
							>
								<h2>{p.title}</h2>
							</a>

							<p
								className={css({
									fontSize: "sm",
									color: { base: "gray.600", _dark: "dark.textMuted" },
									mt: 1,
								})}
							>
								{p.date ? new Date(p.date).toDateString() : ""}
								{p.excerpt
									? ` · ${estimateReadingTime(p.excerpt)} min read`
									: ""}
							</p>

							{p.excerpt ? (
								<p
									className={css({
										mt: 3,
										color: { base: "gray.900", _dark: "dark.text" },
									})}
								>
									{p.excerpt}
								</p>
							) : null}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function estimateReadingTime(text: string) {
	const words = text.trim().split(/\s+/).length;
	return Math.max(1, Math.round(words / 200));
}
