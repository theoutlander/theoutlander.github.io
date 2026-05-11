import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { css } from "../../styled-system/css/index.mjs";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import HeroSSR from "../components/HeroSSR";
import CoreCompetencies from "../components/CoreCompetencies";
import RecentWriting from "../components/RecentWriting";
import SkipLink from "../components/SkipLink";
import type { BlogPost } from "../types/blog";

interface HomePageProps {
	posts: BlogPost[];
}

export function HomePagePanda({ posts }: HomePageProps) {
	return (
		<>
			<Helmet>
				<title>Nick Karnik</title>
				<meta
					name="description"
					content="25 years building software at Google, Microsoft, and startups. Writing about AI, search, and developer tools from first principles."
				/>
				<link rel="canonical" href="https://nick.karnik.io" />
			</Helmet>
			<div
				className={css({
					bg: { base: "white", _dark: "dark.surface" },
					minHeight: "100vh",
					width: "100%",
					overflowX: "hidden",
					display: "flex",
					flexDirection: "column",
				})}
			>
				<SkipLink />
				<HeaderSSR currentPage="home" />
				<main
					id="main-content"
					className={css({
						flex: "1",
						display: "flex",
						flexDirection: "column",
						bg: { base: "white", _dark: "dark.surface" },
						minHeight: 0,
					})}
				>
					<HeroSSR />
					<RecentWriting posts={posts ?? []} />
					<CoreCompetencies />
				</main>
				<Footer />
			</div>
		</>
	);
}
