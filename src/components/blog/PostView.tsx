import { Helmet } from "../seo/HelmetShim";
import ProgressTop from "../ui/ProgressTop";
import BackToTop from "../ui/BackToTop";
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
import { capitalizeFirstLetter } from "../../utils/stringUtils";
import { Post } from "../../types/blog";

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
				image={post.cover}
			/>

			<div className={blogPost()}>
				{post.cover ? (
					<img
						src={post.cover}
						alt={post.title || "Blog post cover image"}
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
							{capitalizeFirstLetter(t)}
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
			<BackToTop />
		</>
	);
}
