// src/components/blog/BlogCard.tsx
import { css } from "../../../styled-system/css/index.mjs";
import type { Post } from "../../types/blog";
import { capitalizeFirstLetter } from "../../utils/stringUtils";

export default function BlogCard({ post }: { post: Post }) {
	return (
		<a
			href={`/blog/${post.slug}`}
			className={css({
				textDecoration: "none",
				color: "inherit",
				display: "block",
			})}
		>
			<article
				className={css({
					borderRadius: "2xl",
					overflow: "hidden",
					shadow: "sm",
					bg: "white",
					border: "1px solid",
					borderColor: "#e5e5e5",
					_hover: { transform: "translateY(-2px)", shadow: "md" },
					transition: "transform 0.2s",
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
							objectFit: "cover",
							maxH: "240px",
							w: "full",
						})}
					/>
				) : null}
				<div className={css({ p: 4 })}>
					<h2
						className={css({
							color: "#000",
							fontWeight: "600",
							fontSize: "lg",
						})}
					>
						{post.title}
					</h2>
					<p
						className={css({
							fontSize: "sm",
							color: "#666",
							mt: 1,
						})}
					>
						{post.date ? new Date(post.date).toDateString() : ""} ·{" "}
						{estimateReadingTime(
							post.contentMarkdown || post.contentHtml || post.excerpt || ""
						)}{" "}
						min read
					</p>
					{post.excerpt ? (
						<p
							className={css({
								mt: 3,
								color: "#000",
							})}
						>
							{post.excerpt}
						</p>
					) : null}
					{post.tags?.length ? (
						<div
							className={css({
								display: "flex",
								gap: 2,
								mt: 4,
								flexWrap: "wrap",
							})}
						>
							{post.tags.slice(0, 3).map((t: string) => (
								<span
									key={t}
									className={css({
										color: "#666",
										fontSize: "12px",
									})}
								>
									{capitalizeFirstLetter(t)}
								</span>
							))}
						</div>
					) : null}
				</div>
			</article>
		</a>
	);
}
function estimateReadingTime(text: string) {
	// Strip HTML tags if present
	const cleanText = text.replace(/<[^>]*>/g, "");
	const words = cleanText.trim().split(/\s+/).length;
	return Math.max(1, Math.round(words / 200));
}
