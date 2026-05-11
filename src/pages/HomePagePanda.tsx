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
					content="Twenty-five years building software across search, AI, and data. Engineer, builder, dad of three."
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
					<div
						className={css({
							width: "100%",
							maxW: "1120px",
							mx: "auto",
							px: { base: "4", md: "6", lg: "8" },
							pb: { base: "12", lg: "16" },
							pt: { base: "2", lg: "4" },
							display: "grid",
							gridTemplateColumns: {
								base: "minmax(0, 1fr)",
								lg: "minmax(0, 13fr) minmax(0, 7fr)",
							},
							columnGap: { lg: "8", xl: "10" },
							rowGap: { base: "6", md: "8", lg: "6" },
							alignItems: "start",
						})}
					>
						<div
							className={css({
								gridColumn: { base: "1", lg: "1" },
								gridRow: { base: "1", lg: "1" },
								minWidth: 0,
								width: "100%",
								pt: { base: "4", lg: "8" },
							})}
						>
							<HeroSSR />
						</div>
						<div
							className={css({
								gridColumn: { base: "1", lg: "2" },
								gridRow: { base: "2", lg: "1 / span 2" },
								minWidth: 0,
								width: "100%",
								position: { lg: "sticky" },
								top: { lg: "5rem" },
								alignSelf: { lg: "start" },
							})}
						>
							<RecentWriting posts={posts ?? []} />
						</div>
						<div
							className={css({
								gridColumn: { base: "1", lg: "1" },
								gridRow: { base: "3", lg: "2" },
								minWidth: 0,
								width: "100%",
							})}
						>
							<CoreCompetencies />
						</div>
					</div>
				</main>
				<Footer />
			</div>
		</>
	);
}