import React from "react";
import { Helmet } from "../components/seo/HelmetShim";
import { css } from "../../styled-system/css/index.mjs";
import { container } from "../../styled-system/patterns/index.mjs";
import HeaderSSR from "../components/HeaderSSR";
import Footer from "../components/Footer";
import { CodementorReviews } from "../components/CodementorReviews";
import { CodementorReview } from "../types/codementor";

interface ReviewsPageProps {
	reviews: CodementorReview[];
}

export function ReviewsPagePanda({ reviews }: ReviewsPageProps) {
	return (
		<div
			className={css({
				bg: "gray.50",
				minH: "100vh",
				width: "100%",
				overflowX: "hidden",
			})}
		>
			<Helmet>
				<title>What People Say | Nick Karnik</title>
				<meta
					name="description"
					content="Client reviews and testimonials from Codementor sessions with Nick Karnik."
				/>
				<link rel="canonical" href="https://nick.karnik.io/reviews" />
			</Helmet>
			<HeaderSSR currentPage="reviews" />
			<main
				className={container({
					maxW: "5xl",
					mx: "auto",
					px: { base: 4, md: 6 },
					py: 8,
				})}
			>
				{/* Header */}
				<div className={css({ mb: 8, textAlign: "center" })}>
					<h1
						className={css({
							fontSize: { base: "3xl", md: "4xl" },
							fontWeight: "bold",
							color: "gray.900",
							mb: 3,
						})}
					>
						What People Say
					</h1>
					<p
						className={css({
							fontSize: "lg",
							color: "gray.600",
							maxW: "2xl",
							mx: "auto",
						})}
					>
						Reviews from people I have worked with and mentored over the years.
					</p>
				</div>

				{/* Reviews Grid */}
				<CodementorReviews reviews={reviews} />
			</main>
			<Footer />
		</div>
	);
}
