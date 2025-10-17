import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { css } from "../../styled-system/css/index.mjs";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import BlogList from "../components/blog/BlogList";
import BlogIntro from "../components/blog/BlogIntro";
import SkipLink from "../components/SkipLink";

type Post = {
	id: string;
	slug: string;
	title: string;
	excerpt: string;
	url: string;
	date: string;
	cover: string | null;
	tags: string[];
};

type BlogPageProps = {
	posts: Post[];
};

export function BlogPagePanda({ posts }: BlogPageProps) {
	return (
		<div
			className={css({
				bg: { base: "gray.50", _dark: "dark.bg" },
				minH: "100vh",
				width: "100%",
				overflowX: "hidden",
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
					maxW: "6xl",
					py: { base: 6, md: 10 },
					mx: "auto",
					px: 4,
				})}
			>
				<BlogIntro />
				<BlogList posts={posts} />
			</main>
			<Footer />
		</div>
	);
}
