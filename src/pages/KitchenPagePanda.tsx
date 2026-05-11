import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { css } from "../../styled-system/css/index.mjs";
import { container } from "../../styled-system/patterns/index.mjs";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import SkipLink from "../components/SkipLink";

export function KitchenPagePanda() {
	return (
		<div
			className={css({
				bg: "gray.50",
				minH: "100vh",
				width: "100%",
				overflowX: "hidden",
				display: "flex",
				flexDirection: "column",
			})}
		>
			<Helmet>
				<title>Kitchen</title>
				<meta
					name="description"
					content="Coming soon. Good things take time."
				/>
				<link rel="canonical" href="https://nick.karnik.io/kitchen" />
			</Helmet>
			<SkipLink />
			<HeaderSSR currentPage="kitchen" />
			<main
				id="main-content"
				className={container({
					maxW: "5xl",
					mx: "auto",
					px: { base: 4, md: 6 },
					py: 8,
					flex: "1",
					width: "100%",
				})}
			>
				<h1
					className={css({
						fontSize: { base: "2xl", md: "3xl" },
						fontWeight: "bold",
						color: "gray.800",
						mb: 3,
					})}
				>
					Kitchen
				</h1>
				<p className={css({ color: "gray.600", mb: 4 })}>
					Coming soon. Good things take time.
				</p>
			</main>
			<Footer />
		</div>
	);
}
