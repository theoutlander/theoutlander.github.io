import React from "react";
import { css } from "../../styled-system/css/index.mjs";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import SkipLink from "../components/SkipLink";
import { capitalizeFirstLetter } from "../utils/stringUtils";

type Post = {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	url: string;
	date: string;
	cover: string | null;
	tags: string[];
	html?: string;
	contentHtml?: string;
	contentMarkdown?: string;
};

type BlogPostPageProps = {
	post: Post;
};

export function BlogPostPagePanda({ post }: BlogPostPageProps) {
	return (
		<div
			className={css({
				bg: "gray.50",
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
					maxW: "4xl",
					py: { base: 6, md: 10 },
					mx: "auto",
					px: { base: 4, md: 6 },
					width: "100%",
				})}
			>
				<article
					className={css({
						bg: "white",
						borderRadius: "2xl",
						p: { base: 4, md: 8 },
						shadow: "sm",
						border: "1px solid",
						borderColor: "gray.200",
					})}
				>
					<header className={css({ mb: 8 })}>
						<h1
							className={css({
								fontSize: { base: "2xl", md: "3xl" },
								fontWeight: "bold",
								mb: 4,
								color: "gray.800",
								lineHeight: 1.2,
							})}
						>
							{post.title}
						</h1>

						<div
							className={css({
								display: "flex",
								alignItems: "center",
								gap: 4,
								mb: 6,
								fontSize: "sm",
								color: "gray.600",
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
							<span>•</span>
							<span>
								{Math.max(
									1,
									Math.round((post.excerpt || "").split(" ").length / 200)
								)}{" "}
								min read
							</span>
						</div>

						{post.cover && (
							<img
								src={post.cover}
								alt=""
								loading="lazy"
								className={css({
									width: "100%",
									height: "300px",
									objectFit: "cover",
									borderRadius: "lg",
									mb: 6,
								})}
							/>
						)}
					</header>

					<div
						className={css({
							fontSize: { base: "md", md: "lg" },
							lineHeight: 1.7,
							color: "gray.800",
							"& h2": {
								fontSize: { base: "xl", md: "2xl" },
								fontWeight: "bold",
								mt: 8,
								mb: 4,
								color: "gray.900",
							},
							"& h3": {
								fontSize: { base: "lg", md: "xl" },
								fontWeight: "semibold",
								mt: 6,
								mb: 3,
								color: "gray.900",
							},
							"& p": {
								mb: 4,
							},
							"& ul, & ol": {
								mb: 4,
								pl: 6,
							},
							"& li": {
								mb: 2,
							},
							"& blockquote": {
								borderLeft: "4px solid",
								borderColor: "blue.500",
								pl: 4,
								py: 2,
								bg: "blue.50",
								fontStyle: "italic",
								mb: 4,
							},
							"& code": {
								bg: "gray.100",
								px: 2,
								py: 1,
								borderRadius: "md",
								fontSize: "sm",
								fontFamily: "mono",
							},
							"& pre": {
								bg: "gray.900",
								color: "white",
								p: { base: 2, md: 4 },
								borderRadius: "lg",
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
								borderColor: "gray.200",
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
									{capitalizeFirstLetter(tag)}
								</span>
							))}
							</div>
						</div>
					)}
				</article>
			</main>
			<Footer />
		</div>
	);
}
