import { Helmet } from "react-helmet-async";
import ProgressTop from "../ui/ProgressTop";
import PostJsonLd from "../seo/PostJsonLd";
import Comments from "./Comments";
import { css } from "../../../styled-system/css/index.mjs";
import {
	blogPost,
	blogTitle,
	blogMeta,
	blogDate,
	blogTag,
	blogExcerpt,
	blogContent,
	blogCover,
} from "../../../styled-system/recipes/index.mjs";

type Post = {
	id?: string;
	title: string;
	date: string;
	cover: string;
	excerpt: string;
	html: string;
	url: string;
	tags: string[];
};

export default function PostView({ post }: { post: Post }) {
	const postUrl =
		post.url ||
		`https://nick.karnik.io/blog/${post.title
			.toLowerCase()
			.replace(/\s+/g, "-")}`;

	return (
		<>
			<Helmet>
				<title>{post.title}</title>
				<meta
					name="description"
					content={post.excerpt || ""}
				/>
				<link
					rel="canonical"
					href={typeof window === "undefined" ? "" : window.location.href}
				/>
				{post.cover ? (
					<meta
						property="og:image"
						content={post.cover}
					/>
				) : null}
				<meta
					property="og:title"
					content={post.title}
				/>
				<meta
					property="og:type"
					content="article"
				/>
				<meta
					name="twitter:card"
					content="summary_large_image"
				/>
			</Helmet>
			<ProgressTop />
			{/* Structured data */}
			<PostJsonLd
				title={post.title}
				url={postUrl}
				date={post.date}
				excerpt={post.excerpt}
			/>

			<div className={blogPost()}>
				{post.cover ? (
					<img
						src={post.cover}
						alt=""
						loading="lazy"
						className={blogCover()}
					/>
				) : null}

				<h1 className={blogTitle()}>{post.title}</h1>

				<div className={blogMeta()}>
					<span className={blogDate()}>
						{post.date ? new Date(post.date).toDateString() : ""}
					</span>
					{post.tags?.slice(0, 4).map((t) => (
						<span
							key={t}
							className={blogTag()}
						>
							{t}
						</span>
					))}
				</div>

				<p className={blogExcerpt()}>{post.excerpt}</p>

				{/* Full article content */}
				<div
					className={css({
						...blogContent(),
					})}
				>
					{post.html ? (
						<div dangerouslySetInnerHTML={{ __html: post.html }} />
					) : (
						<p
							className={css({ color: "text.secondary", fontStyle: "italic" })}
						>
							Content not available
						</p>
					)}
				</div>

				{/* Comments Section */}
				<Comments
					postTitle={post.title}
					postUrl={postUrl}
				/>
			</div>
		</>
	);
}
