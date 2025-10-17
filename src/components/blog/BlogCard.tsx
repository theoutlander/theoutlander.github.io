// src/components/blog/BlogCard.tsx
import { css } from "../../../styled-system/css/index.mjs";
import type { Post } from "./RoutePost";
import { capitalizeFirstLetter } from "../../utils/stringUtils";

export default function BlogCard({ post }: { post: Post }) {
	return (
		<article
			className={css({
				borderRadius: "2xl",
				overflow: "hidden",
				shadow: "sm",
				bg: "white",
				border: "1px solid",
				borderColor: "gray.200",
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
					alt=""
					loading="lazy"
					className={css({
						objectFit: "cover",
						maxH: "240px",
						w: "full",
					})}
				/>
			) : null}
			<div className={css({ p: 4 })}>
				<a
					href={`/blog/${post.slug}`}
					className={css({
						textDecoration: "none",
						color: "brand.700",
						fontWeight: "semibold",
						fontSize: "lg",
						_hover: { color: "brand.600" },
					})}
				>
					<h2>{post.title}</h2>
				</a>
				<p
					className={css({
						fontSize: "sm",
						color: "gray.600",
						mt: 1,
					})}
				>
					{post.date ? new Date(post.date).toDateString() : ""} ·{" "}
					{estimateReadingTime(post.excerpt || "")} min read
				</p>
				{post.excerpt ? (
					<p
						className={css({
							mt: 3,
							color: "gray.900",
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
					{post.tags.slice(0, 3).map((t) => (
						<span
							key={t}
							className={css({
								bg: "blue.100",
								color: "blue.800",
								px: "12px",
								py: "6px",
								borderRadius: "full",
								fontSize: "12px",
								fontWeight: "600",
								display: "inline-flex",
								alignItems: "center",
								textTransform: "uppercase",
								letterSpacing: "0.025em",
								_hover: {
									bg: "blue.200",
									transform: "translateY(-1px)",
								},
								transition: "all 0.2s ease",
							})}
						>
							{capitalizeFirstLetter(t)}
						</span>
					))}
					</div>
				) : null}
			</div>
		</article>
	);
}
function estimateReadingTime(text: string) {
	const words = text.trim().split(/\s+/).length;
	return Math.max(1, Math.round(words / 200));
}
