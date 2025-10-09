import React from "react";
import { css } from "../../../styled-system/css/index.mjs";

export default function BlogIntro() {
	const blogIntroStyles = css({
		maxW: "760px",
		mx: "auto",
		mb: 4, // ~16px bottom margin to cards
		p: 0,
		textAlign: "left",
		"& p": {
			m: 0,
			lineHeight: "1.5",
		},
		"& .lead": {
			fontWeight: "600",
			color: { base: "gray.900", _dark: "gray.100" },
			fontSize: "lg",
		},
		"& .sub": {
			mt: 4, // ~0.9rem breathing room from lead
			color: { base: "gray.600", _dark: "gray.400" },
			fontSize: "md",
		},
		"& .cta": {
			mt: 3, // ~0.7rem from sub
			fontSize: "0.95rem",
			color: { base: "gray.500", _dark: "gray.400" },
		},
		"& .cta a": {
			textDecoration: "underline",
			color: { base: "blue.600", _dark: "blue.400" },
			fontWeight: "500",
			_hover: {
				color: { base: "blue.700", _dark: "blue.300" },
			},
		},
		// Mobile adjustments - reduce spacing slightly
		"@media (max-width: 480px)": {
			"& .sub": {
				mt: "0.8rem", // Slightly tighter on mobile
			},
			"& .cta": {
				mt: "0.6rem", // Slightly tighter on mobile
			},
		},
	});

	const strongStyles = css({
		fontWeight: "700",
		color: { base: "gray.800", _dark: "gray.200" },
	});

	return (
		<div className={`blog-intro ${blogIntroStyles}`}>
			<p className="lead">
				I'm an engineering and product leader who's spent 25+ years building at{" "}
				<strong className={strongStyles}>
					Google, Microsoft, and Salesforce
				</strong>
				.
			</p>
			<p className="sub">
				I write about{" "}
				<strong className={strongStyles}>
					building products, leading teams,
				</strong>{" "}
				and{" "}
				<strong className={strongStyles}>learning through technology.</strong>
			</p>
			<p className="cta">
				For consulting or advisory work, visit{" "}
				<a href="https://plutonic.consulting">Plutonic Consulting</a>.
			</p>
		</div>
	);
}
