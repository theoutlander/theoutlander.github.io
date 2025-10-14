import React from "react";
import { css } from "../../styled-system/css/index.mjs";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import HeroSSR from "../components/HeroSSR";
import CoreCompetencies from "../components/CoreCompetencies";
import StatsStrip from "../components/StatsStrip";
import SkipLink from "../components/SkipLink";

interface HomePageProps {
	posts: any[];
}

export function HomePagePanda({ posts }: HomePageProps) {
	return (
		<div
			className={css({
				background: {
					base: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
					_dark: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
				},
				minHeight: "100vh",
				width: "100%",
				overflowX: "hidden",
			})}
		>
			<SkipLink />
			<HeaderSSR currentPage="home" />
			<main id="main-content">
				<HeroSSR />
				<CoreCompetencies />
				<StatsStrip />
			</main>
			<Footer />
		</div>
	);
}
