import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import ProgressTop from "../ui/ProgressTop";
import PostJsonLd from "../seo/PostJsonLd";
import { css } from "../../styled-system/css";

export type Post = {
	id?: string;
	slug: string;
	title: string;
	url: string;
	date: string;
	excerpt: string;
	cover: string;
	tags: string[];
	contentMarkdown?: string;
	contentHtml?: string;
};

export default function RoutePost({ slug }: { slug: string }) {
	const [post, setPost] = useState<Post | null>(null);

	useEffect(() => {
		console.log("RoutePost: Fetching data for slug:", slug);
		fetch("/data/hashnode.json")
			.then((r) => {
				console.log("RoutePost: Fetch response:", r.status);
				return r.json();
			})
			.then((all: Post[]) => {
				console.log("RoutePost: Fetched posts:", all.length);
				const foundPost = all.find((p) => p.slug === slug);
				console.log("RoutePost: Found post:", foundPost);
				setPost(foundPost ?? null);
			})
			.catch((error) => {
				console.error("RoutePost: Fetch error:", error);
				setPost(null);
			});
	}, [slug]);

	if (!post) return <div>Loading…</div>;

	return (
		<>
			<ProgressTop />
			{/* SEO basics for prerendered HTML */}
			<head>
				<title>{post.title}</title>
				<link
					rel="canonical"
					href={`https://nick.karnik.io/blog/${post.slug}`}
				/>
				{post.excerpt ? (
					<meta
						name="description"
						content={post.excerpt}
					/>
				) : null}
				{post.cover ? (
					<meta
						property="og:image"
						content={post.cover}
					/>
				) : null}
			</head>

			{/* Structured data */}
			<PostJsonLd
				title={post.title}
				url={`https://nick.karnik.io/blog/${post.slug}`}
				date={post.date}
				excerpt={post.excerpt}
			/>

			<div className={css({ maxW: "768px", mx: "auto", p: "0 24px" })}>
				{post.cover ? (
					<img
						src={post.cover}
						alt=""
						className={css({
							mb: 8,
							borderRadius: "12px",
							w: "100%",
						})}
					/>
				) : null}

				<h1
					className={css({
						fontSize: "2.25rem",
						fontWeight: "600",
						lineHeight: "1.2",
						mb: 4,
						color: "#1a202c",
					})}
				>
					{post.title}
				</h1>

				<div
					className={css({
						display: "flex",
						alignItems: "center",
						gap: 3,
						mb: 6,
						flexWrap: "wrap",
					})}
				>
					<span
						className={css({
							fontSize: "14px",
							color: "#718096",
						})}
					>
						{post.date ? new Date(post.date).toDateString() : ""}
					</span>
					{post.tags?.slice(0, 4).map((t) => (
						<span
							key={t}
							className={css({
								bg: "#edf2f7",
								color: "#4a5568",
								p: "4px 8px",
								borderRadius: "4px",
								fontSize: "12px",
								fontWeight: "500",
							})}
						>
							{t}
						</span>
					))}
				</div>

				<p
					className={css({
						color: "#1a202c",
						mb: 8,
						fontSize: "18px",
						lineHeight: "1.7",
					})}
				>
					{post.excerpt}
				</p>

				{/* Full article content */}
				<div
					className={css({
						maxW: "none",
						lineHeight: "1.7",
						fontSize: "18px",
						color: "#1a202c",
					})}
				>
					{post.contentMarkdown ? (
						<ReactMarkdown>{post.contentMarkdown}</ReactMarkdown>
					) : post.contentHtml ? (
						<div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
					) : (
						<p className={css({ color: "#718096", fontStyle: "italic" })}>
							Content not available
						</p>
					)}
				</div>
			</div>
		</>
	);
}
