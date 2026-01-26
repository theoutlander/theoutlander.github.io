import React, { Suspense, lazy } from "react";
import { css } from "../../styled-system/css/index.mjs";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import SkipLink from "../components/SkipLink";
import BackToTop from "../components/ui/BackToTop";
import { capitalizeFirstLetter } from "../utils/stringUtils";
import { Post } from "../types/blog";

const Comments = lazy(() => import("../components/blog/Comments"));

type BlogPostPageProps = {
	post: Post;
};

export function BlogPostPagePanda({ post }: BlogPostPageProps) {

	return (
		<div
			className={css({
				bg: "white",
				minH: "100vh",
				width: "100%",
				overflowX: "hidden",
			})}
		>
			<SkipLink />
			<HeaderSSR currentPage="blogs" />
			<main
				id="main-content"
				className={css({
					maxW: "768px",
					py: { base: 6, md: 10 },
					mx: "auto",
					px: { base: 4, md: 6 },
					width: "100%",
				})}
			>
				<article>
					<header className={css({ mb: 8 })}>
						<h1
							className={css({
								fontSize: { base: "2xl", md: "2.5rem" },
								fontWeight: "600",
								mb: 4,
								color: "#000",
								lineHeight: 1.2,
							})}
						>
							{post.title}
						</h1>

						<div
							className={css({
								display: "flex",
								alignItems: "center",
								gap: 2,
								mb: 6,
								fontSize: "14px",
								color: "#666",
							})}
						>
							<time>
								{post.date
									? new Date(post.date).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
									  })
									: ""}
							</time>
							<span>│</span>
							<span>
								{estimateReadingTime(
									post.contentHtml || post.html || post.excerpt || ""
								)}{" "}
								min read
							</span>
							{post.tags && post.tags.length > 0 && (
								<>
									<span>│</span>
									<span>{post.tags[0]}</span>
								</>
							)}
						</div>

						{post.cover && (
							<img
								src={post.cover}
								alt={post.title || "Blog post cover image"}
								loading="lazy"
								className={css({
									width: "100%",
									height: "auto",
									mb: 6,
								})}
							/>
						)}
					</header>

					<div
						className={css({
							fontSize: { base: "16px", md: "18px" },
							lineHeight: 1.7,
							color: "#000",
							"& h2": {
								fontSize: { base: "1.5rem", md: "1.75rem" },
								fontWeight: "600",
								mt: 8,
								mb: 4,
								color: "#000",
							},
							"& h3": {
								fontSize: { base: "1.25rem", md: "1.5rem" },
								fontWeight: "600",
								mt: 6,
								mb: 3,
								color: "#000",
							},
							"& p": {
								mb: 4,
							},
							"& ul, & ol": {
								mb: 4,
								pl: 6,
							},
							"& ol": {
								listStyleType: "decimal",
							},
							"& ul": {
								listStyleType: "disc",
							},
							"& li": {
								mb: 2,
							},
							"& blockquote": {
								borderLeft: "3px solid",
								borderColor: "#ccc",
								pl: 4,
								py: 2,
								mb: 4,
								fontStyle: "italic",
								color: "#666",
							},
							"& code": {
								bg: "#f5f5f5",
								px: 2,
								py: 1,
								borderRadius: "3px",
								fontSize: "0.9em",
								fontFamily: "mono",
							},
							"& pre": {
								bg: "#f5f5f5",
								color: "#000",
								p: { base: 3, md: 4 },
								borderRadius: "3px",
								overflow: "auto",
								overflowX: "auto",
								mb: 4,
								maxWidth: "100%",
							},
							"& pre code": {
								bg: "transparent",
								color: "inherit",
								px: 0,
								py: 0,
							},
							"& a": {
								color: "#000",
								textDecoration: "underline",
							},
						})}
					>
						{post.contentHtml ? (
							<div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
						) : post.html ? (
							<div dangerouslySetInnerHTML={{ __html: post.html }} />
						) : (
							<p>{post.excerpt}</p>
						)}
					</div>

					{post.tags && post.tags.length > 0 && (
						<div
							className={css({
								mt: 8,
								pt: 6,
								borderTop: "1px solid",
								borderColor: "#e5e5e5",
							})}
						>
							<div
								className={css({
									display: "flex",
									gap: 2,
									flexWrap: "wrap",
								})}
							>
								{post.tags.map((tag) => (
									<span
										key={tag}
										className={css({
											color: "#666",
											fontSize: "14px",
										})}
									>
										{capitalizeFirstLetter(tag)}
									</span>
								))}
							</div>
						</div>
					)}
				</article>

				{/* Comments Section */}
				<Suspense fallback={null}>
					<Comments
						postTitle={post.title}
						postUrl={`/blog/${post.slug}`}
					/>
				</Suspense>
			</main>
			<Footer />
			<BackToTop />
		</div>
	);
}

function estimateReadingTime(text: string) {
	// Strip HTML tags if present
	const cleanText = text.replace(/<[^>]*>/g, "");
	const words = cleanText.trim().split(/\s+/).length;
	return Math.max(1, Math.round(words / 200));
}
