import React from "react";
import { Helmet } from "react-helmet-async";
import { css } from "../styled-system/css";

type Post = {
	id?: string;
	slug: string;
	title: string;
	excerpt: string;
	url: string;
	date: string;
	cover: string;
	tags: string[];
};

type BlogPageProps = {
	posts: Post[];
};

function Header() {
	const BRAND = "Nick Karnik";

	return (
		<header
			className={css({
				position: "sticky",
				top: 0,
				zIndex: 10,
				bg: "white",
				borderBottom: "1px solid #e2e8f0",
				backdropFilter: "saturate(180%) blur(8px)",
			})}
		>
			<div className={css({ maxW: "1200px", mx: "auto", p: "12px 24px" })}>
				<div
					className={css({
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 6,
					})}
				>
					<a
						href="/"
						className={css({ textDecoration: "none" })}
					>
						<h2
							className={css({
								fontSize: "1.5rem",
								fontWeight: "600",
								color: "#1a202c",
								m: 0,
							})}
						>
							{BRAND}
						</h2>
					</a>

					<div className={css({ display: "flex", gap: 6 })}>
						<a
							href="/blog"
							className={css({ textDecoration: "none" })}
						>
							<span
								className={css({
									color: "#3182ce",
									fontWeight: "500",
									fontSize: "16px",
								})}
							>
								Blog
							</span>
						</a>
						<a
							href="/about"
							className={css({ textDecoration: "none" })}
						>
							<span
								className={css({
									color: "#718096",
									fontSize: "16px",
								})}
							>
								About
							</span>
						</a>
						<a
							href="/resume"
							className={css({ textDecoration: "none" })}
						>
							<span
								className={css({
									color: "#718096",
									fontSize: "16px",
								})}
							>
								Resume
							</span>
						</a>
					</div>
				</div>
			</div>
		</header>
	);
}

function Footer() {
	return (
		<footer
			className={css({
				bg: "white",
				borderTop: "1px solid #e2e8f0",
				p: "32px 0",
				mt: 16,
			})}
		>
			<div className={css({ maxW: "1200px", mx: "auto", p: "0 24px" })}>
				<div
					className={css({
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						flexWrap: "wrap",
						gap: 4,
					})}
				>
					<span
						className={css({
							fontSize: "14px",
							color: "#718096",
						})}
					>
						© 2024 Nick Karnik. All rights reserved.
					</span>
					<div className={css({ display: "flex", gap: 4 })}>
						<a
							href="https://github.com/theoutlander"
							target="_blank"
							rel="noopener noreferrer"
							className={css({ textDecoration: "none" })}
						>
							<span
								className={css({
									fontSize: "14px",
									color: "#718096",
								})}
							>
								GitHub
							</span>
						</a>
						<a
							href="https://www.linkedin.com/in/theoutlander"
							target="_blank"
							rel="noopener noreferrer"
							className={css({ textDecoration: "none" })}
						>
							<span
								className={css({
									fontSize: "14px",
									color: "#718096",
								})}
							>
								LinkedIn
							</span>
						</a>
						<a
							href="mailto:nick@karnik.io"
							className={css({ textDecoration: "none" })}
						>
							<span
								className={css({
									fontSize: "14px",
									color: "#718096",
								})}
							>
								Email
							</span>
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}

function BlogCard({ post }: { post: Post }) {
	return (
		<div
			className={css({
				borderRadius: "16px",
				overflow: "hidden",
				boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
				border: "1px solid #e2e8f0",
				bg: "white",
				transition: "all 0.2s ease",
			})}
		>
			{post.cover && (
				<div>
					<img
						src={post.cover}
						alt=""
						className={css({
							objectFit: "cover",
							maxHeight: "260px",
							w: "100%",
						})}
					/>
				</div>
			)}
			<div className={css({ p: 4 })}>
				<a
					href={`/blog/${post.slug}`}
					className={css({ textDecoration: "none" })}
				>
					<h3
						className={css({
							fontSize: "1.125rem",
							fontWeight: "600",
							color: "#3182ce",
							m: "0 0 4px 0",
						})}
					>
						{post.title}
					</h3>
				</a>
				<p
					className={css({
						fontSize: "14px",
						color: "#718096",
						m: "0 0 12px 0",
					})}
				>
					{post.date ? new Date(post.date).toDateString() : ""}
					{post.excerpt
						? ` · ${Math.max(
								1,
								Math.round(post.excerpt.split(" ").length / 200)
						  )} min read`
						: ""}
				</p>
				{post.excerpt && (
					<p
						className={css({
							color: "#1a202c",
							lineHeight: 1.6,
							m: 0,
						})}
					>
						{post.excerpt}
					</p>
				)}
			</div>
		</div>
	);
}

export function BlogPage({ posts }: BlogPageProps) {
	return (
		<div
			className={css({
				bg: "#f7fafc",
				minH: "100vh",
			})}
		>
			<Header />
			<main
				className={css({
					maxW: "1200px",
					mx: "auto",
					p: "24px 24px 40px 24px",
				})}
			>
				<div className={css({ mb: 12 })}>
					<h1
						className={css({
							fontSize: "3rem",
							fontWeight: "700",
							m: "0 0 16px 0",
							color: "#1a202c",
						})}
					>
						Blog
					</h1>
					<p
						className={css({
							fontSize: "18px",
							color: "#718096",
							maxW: "600px",
							m: 0,
						})}
					>
						Thoughts on engineering, AI, and technology from my experience
						building and leading teams.
					</p>
				</div>

				<div
					className={css({
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
						gap: 6,
					})}
				>
					{posts.map((post) => (
						<BlogCard
							key={post.slug}
							post={post}
						/>
					))}
				</div>
			</main>
			<Footer />
		</div>
	);
}
