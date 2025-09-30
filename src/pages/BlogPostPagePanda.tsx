import React from "react";
import { css } from "../../styled-system/css/index.mjs";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";

type Post = {
	id?: string;
	slug: string;
	title: string;
	excerpt: string;
	url: string;
	date: string;
	cover: string;
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
				padding: "16px",
			})}
		>
			<HeaderSSR currentPage="blog" />
			<main
				className={css({
					maxW: "4xl",
					py: { base: 6, md: 10 },
					mx: "auto",
					px: 4,
				})}
			>
				<article
					className={css({
						bg: "white",
						borderRadius: "2xl",
						p: 8,
						shadow: "sm",
						border: "1px solid",
						borderColor: "gray.200",
					})}
				>
					<header className={css({ mb: 8 })}>
						<h1
							className={css({
								fontSize: "3xl",
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
							fontSize: "lg",
							lineHeight: 1.7,
							color: "gray.800",
							"& h2": {
								fontSize: "2xl",
								fontWeight: "bold",
								mt: 8,
								mb: 4,
								color: "gray.900",
							},
							"& h3": {
								fontSize: "xl",
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
								p: 4,
								borderRadius: "lg",
								overflow: "auto",
								mb: 4,
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
									<a
										key={tag}
										href={`/blog/t/${tag}`}
										className={css({
											bg: "blue.100",
											color: "blue.700",
											px: 3,
											py: 1,
											borderRadius: "full",
											fontSize: "sm",
											textDecoration: "none",
											_hover: { bg: "blue.200" },
										})}
									>
										{tag}
									</a>
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
