import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { css } from "../../styled-system/css/index.mjs";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import BlogList from "../components/blog/BlogList";
import BlogIntro from "../components/blog/BlogIntro";
import BlogSidebar from "../components/blog/BlogSidebar";
import SkipLink from "../components/SkipLink";
import { Post } from "../types/blog";

type BlogPageProps = {
	posts: Post[];
	filterTag?: string;
	filterCategory?: string;
};

export function BlogPagePanda({ posts, filterTag, filterCategory }: BlogPageProps) {
	return (
		<div
			className={css({
				bg: { base: "white", _dark: "dark.bg" },
				minH: "100vh",
				width: "100%",
				overflowX: "hidden",
				display: "flex",
				flexDirection: "column",
			})}
		>
			<SkipLink />
			<Helmet>
				<title>Nick Karnik Blog | Engineering, Leadership & AI</title>
				<meta
					name="description"
					content="Practical essays and reflections on software engineering, leadership, and AI. Lessons from shipping products at scale and helping teams move faster."
				/>
				<link rel="canonical" href="https://nick.karnik.io/blog" />
			</Helmet>
			<HeaderSSR currentPage="blogs" />
			<main
				id="main-content"
				className={css({
					flex: 1,
					maxW: "6xl",
					py: { base: 6, md: 10 },
					mx: "auto",
					px: 4,
					width: "100%",
					display: "flex",
					flexDirection: { base: "column", md: "row" },
					gap: { base: 8, md: 12 },
					alignItems: "flex-start",
				})}
			>
				<div
					className={css({
						flex: "1 1 0",
						minW: 0,
					})}
				>
					<BlogIntro />
					<BlogList posts={posts} filterTag={filterTag} filterCategory={filterCategory} />
				</div>
				<div
					className={css({
						order: { base: -1, md: 0 },
					})}
				>
					<BlogSidebar posts={posts} />
				</div>
			</main>
			<Footer />
		</div>
	);
}
