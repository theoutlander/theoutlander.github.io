import { css } from "../../../styled-system/css/index.mjs";
// import { Helmet } from 'react-helmet-async';
import type { Post } from "../../types/blog";
import { capitalizeFirstLetter } from "../../utils/stringUtils";

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
						{filterTag
							? `No posts tagged "${capitalizeFirstLetter(filterTag)}"`
							: "No posts yet"}
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
					alignItems: "stretch",
				})}
			>
				{items.map((p) => (
					<a
						key={p.slug}
						href={`/blog/${p.slug}`}
						className={css({
							textDecoration: "none",
							color: "inherit",
							display: "flex",
							height: "100%",
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
							{p.cover ? (
								<img
									src={p.cover}
									alt={p.title || "Blog post cover image"}
									loading="lazy"
									className={css({
										objectFit: "cover",
										maxH: "260px",
										w: "100%",
									})}
								/>
							) : null}

							<div
								className={css({
									p: 4,
									display: "flex",
									flexDirection: "column",
									flex: 1,
								})}
							>
								<h2
									className={css({
										color: "#000",
										fontWeight: "600",
										fontSize: "lg",
									})}
								>
									{p.title}
								</h2>

								<p
									className={css({
										fontSize: "sm",
										color: "#666",
										mt: 1,
									})}
								>
									{p.date ? new Date(p.date).toDateString() : ""}
									{p.contentMarkdown || p.contentHtml || p.excerpt
										? ` · ${estimateReadingTime(
												p.contentMarkdown || p.contentHtml || p.excerpt || ""
										  )} min read`
										: ""}
								</p>

								{p.excerpt ? (
									<p
										className={css({
											mt: 3,
											color: "#000",
											flex: 1,
											display: "-webkit-box",
											WebkitLineClamp: 3,
											WebkitBoxOrient: "vertical",
											overflow: "hidden",
										})}
									>
										{p.excerpt}
									</p>
								) : null}
							</div>
						</div>
					</a>
				))}
			</div>
		</div>
	);
}

function estimateReadingTime(text: string) {
	// Strip HTML tags if present
	const cleanText = text.replace(/<[^>]*>/g, "");
	const words = cleanText.trim().split(/\s+/).length;
	return Math.max(1, Math.round(words / 200));
}
