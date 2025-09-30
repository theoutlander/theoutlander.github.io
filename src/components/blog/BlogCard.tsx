// src/components/blog/BlogCard.tsx
import { css } from "../../../styled-system/css/index.mjs";
import type { Post } from "./RoutePost";

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
			})}
		>
			{post.cover ? (
				<img
					src={post.cover}
					alt=""
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
						color: "accent.700",
						fontWeight: "semibold",
						fontSize: "lg",
						_hover: { color: "accent.600" },
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
							color: "gray.800",
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
							<a
								key={t}
								href={`/blog/t/${t}`}
								className={css({
									textDecoration: "none",
									bg: "gray.100",
									color: "gray.700",
									px: 2,
									py: 1,
									rounded: "md",
									fontSize: "sm",
									_hover: { bg: "gray.200" },
								})}
							>
								{t}
							</a>
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
